<?php

namespace App\Http\Controllers\Api;

use App\Models\Employee;
use App\Models\Mission;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\ConflictService;
use App\Services\LoggingService;
use App\Services\RabbitMQService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TaskController extends BaseApiController
{
    /**
     * My tasks (employee view).
     * GET /api/employee/my-tasks
     */
    public function myTasks(Request $request): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employe introuvable');
            }

            $query = Task::with(['creator:id,first_name,last_name', 'mission:id,title', 'comments'])
                ->where('assigned_to', $employee->id)
                ->where('company_id', $request->auth_company_id);

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('date')) {
                $query->whereDate('due_date', $request->date);
            }

            $tasks = $query->orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
                ->orderBy('due_date')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($task) => $this->formatTask($task));

            return $this->respondSuccess($tasks);
        } catch (\Exception $e) {
            LoggingService::error('Failed to list employee tasks', $e);

            return $this->respondServerError('Impossible de recuperer vos taches');
        }
    }

    /**
     * Team tasks (manager view).
     * GET /api/tasks
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Task::with(['assignee:id,first_name,last_name', 'creator:id,first_name,last_name', 'mission:id,title', 'comments'])
                ->where('company_id', $request->auth_company_id);

            if ($request->has('filter_department_id')) {
                $query->where('department_id', $request->filter_department_id);
            } elseif ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            if ($request->has('mission_id')) {
                $query->where('mission_id', $request->mission_id);
            }

            if ($request->has('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('date')) {
                $query->whereDate('due_date', $request->date);
            }

            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            $tasks = $query->orderByRaw("FIELD(status, 'in_progress', 'todo', 'done')")
                ->orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
                ->orderBy('due_date')
                ->get()
                ->map(fn ($task) => $this->formatTask($task));

            return $this->respondSuccess($tasks);
        } catch (\Exception $e) {
            LoggingService::error('Failed to list tasks', $e);

            return $this->respondServerError('Impossible de recuperer les taches');
        }
    }

    /**
     * Create a task.
     * POST /api/tasks
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'priority' => 'nullable|in:low,medium,high',
                'assigned_to' => 'required|uuid|exists:employees,id',
                'mission_id' => 'nullable|uuid|exists:missions,id',
                'due_date' => 'nullable|date',
                'recurrence' => 'nullable|in:daily,weekly',
                'estimated_minutes' => 'nullable|integer|min:1',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();

            // Resolve creator employee
            $creator = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $creator) {
                return $this->respondNotFound('Profil employe introuvable');
            }

            // Validate assigned employee belongs to same company
            $assignee = Employee::where('id', $data['assigned_to'])
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $assignee) {
                return $this->respondError('Employe non eligible', 422);
            }

            if ($request->has('filter_department_id')) {
                $data['department_id'] = $request->filter_department_id;
            } else {
                $data['department_id'] = $assignee->department_id;
            }

            $data['company_id'] = $request->auth_company_id;
            $data['created_by'] = $creator->id;
            $data['id'] = (string) Str::uuid();

            // Vérifier si l'employé est en congé (warning non bloquant)
            $leaveWarnings = [];
            if (! empty($data['due_date'])) {
                $conflictService = app(ConflictService::class);
                $leaveConflicts = $conflictService->checkLeaveConflicts(
                    $assignee->id,
                    $data['due_date'],
                    $data['due_date']
                );
                if (! empty($leaveConflicts)) {
                    $leaveWarnings = array_map(fn ($c) => $c['title'], $leaveConflicts);
                }
            }

            $task = Task::create($data);

            // Notify assigned employee if different from creator
            if ($creator->id !== $assignee->id) {
                $rabbitMQ = new RabbitMQService();
                $rabbitMQ->publishEvent('TaskAssigned', [
                    'employee_id' => $assignee->id,
                    'user_id' => $assignee->user_id,
                    'employee_name' => $assignee->first_name.' '.$assignee->last_name,
                    'company_id' => $task->company_id,
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'task_priority' => $task->priority,
                    'task_due_date' => $task->due_date?->toDateString(),
                    'creator_name' => $creator->first_name.' '.$creator->last_name,
                ], 'employee_events');
            }

            LoggingService::info('Task created', ['task_id' => $task->id]);

            $responseData = $this->formatTask($task->load(['assignee:id,first_name,last_name', 'creator:id,first_name,last_name', 'mission:id,title']));
            if (! empty($leaveWarnings)) {
                $responseData['warnings'] = $leaveWarnings;
            }

            return $this->respondSuccess(
                $responseData,
                ! empty($leaveWarnings) ? 'Tâche créée — attention : l\'employé est en congé sur cette période' : 'Tache creee avec succes',
                201
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to create task', $e);

            return $this->respondServerError('Impossible de creer la tache');
        }
    }

    /**
     * Update a task.
     * PATCH /api/tasks/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $task = Task::where('company_id', $request->auth_company_id)->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'priority' => 'sometimes|in:low,medium,high',
                'status' => 'sometimes|in:todo,in_progress,done',
                'due_date' => 'nullable|date',
                'estimated_minutes' => 'nullable|integer|min:1',
                'actual_minutes' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();

            // Dependency check
            if (isset($data['status']) && $data['status'] === 'done' && $task->isBlocked()) {
                return $this->respondError("Cette tâche est bloquée par une autre tâche non terminée.", 422);
            }

            // Auto-set completed_at
            if (isset($data['status']) && $data['status'] === 'done' && ! $task->completed_at) {
                $data['completed_at'] = now();
            } elseif (isset($data['status']) && $data['status'] !== 'done') {
                $data['completed_at'] = null;
            }

            $task->update($data);

            // Notify manager when employee completes a task
            if (isset($data['status']) && $data['status'] === 'done') {
                $creator = Employee::find($task->created_by);
                $assignee = Employee::find($task->assigned_to);

                if ($creator && $assignee && $creator->id !== $assignee->id) {
                    $rabbitMQ = new RabbitMQService();
                    $rabbitMQ->publishEvent('TaskCompleted', [
                        'employee_id' => $creator->id,
                        'user_id' => $creator->user_id,
                        'company_id' => $task->company_id,
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                        'completed_by' => $assignee->first_name.' '.$assignee->last_name,
                    ], 'employee_events');

                    // Check if other tasks were waiting for this one (DependencyMet)
                    $blockedTasks = Task::where('dependency_task_id', $task->id)->get();
                    foreach ($blockedTasks as $blockedTask) {
                        $rabbitMQ->publishEvent('DependencyMet', [
                            'employee_id' => $blockedTask->assigned_to,
                            'company_id' => $blockedTask->company_id,
                            'task_id' => $blockedTask->id,
                            'dependency_task_title' => $task->title,
                        ], 'employee_events');
                    }
                }
            }

            return $this->respondSuccess(
                $this->formatTask($task->load(['assignee:id,first_name,last_name', 'creator:id,first_name,last_name', 'mission:id,title', 'comments'])),
                'Tache mise a jour'
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to update task', $e);

            return $this->respondServerError('Impossible de mettre a jour la tache');
        }
    }

    /**
     * Update only the status (employee shortcut).
     * PATCH /api/employee/my-tasks/{id}/status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employe introuvable');
            }

            $task = Task::where('assigned_to', $employee->id)->findOrFail($id);

            // Dependency check
            if ($request->status === 'done' && $task->isBlocked()) {
                return $this->respondError("Cette tâche est bloquée par une autre tâche non terminée.", 422);
            }

            $updateData = ['status' => $request->status];

            if ($request->status === 'done' && ! $task->completed_at) {
                $updateData['completed_at'] = now();
            } elseif ($request->status !== 'done') {
                $updateData['completed_at'] = null;
            }

            $task->update($updateData);

            // Notify creator when task is done
            if ($request->status === 'done') {
                $creator = Employee::find($task->created_by);
                if ($creator && $creator->id !== $employee->id) {
                    $rabbitMQ = new RabbitMQService();
                    $rabbitMQ->publishEvent('TaskCompleted', [
                        'employee_id' => $creator->id,
                        'user_id' => $creator->user_id,
                        'company_id' => $task->company_id,
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                        'completed_by' => $employee->first_name.' '.$employee->last_name,
                    ], 'employee_events');

                    // Check if other tasks were waiting for this one (DependencyMet)
                    $blockedTasks = Task::where('dependency_task_id', $task->id)->get();
                    foreach ($blockedTasks as $blockedTask) {
                        $rabbitMQ->publishEvent('DependencyMet', [
                            'employee_id' => $blockedTask->assigned_to,
                            'company_id' => $blockedTask->company_id,
                            'task_id' => $blockedTask->id,
                            'dependency_task_title' => $task->title,
                        ], 'employee_events');
                    }
                }
            }

            return $this->respondSuccess(
                $this->formatTask($task->load(['creator:id,first_name,last_name', 'mission:id,title', 'comments'])),
                'Statut mis a jour'
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to update task status', $e);

            return $this->respondServerError('Impossible de mettre a jour le statut');
        }
    }

    /**
     * Add a comment to a task.
     * POST /api/tasks/{id}/comments
     */
    public function addComment(Request $request, string $id): JsonResponse
    {
        try {
            $task = Task::where('company_id', $request->auth_company_id)->findOrFail($id);

            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employe introuvable');
            }

            $request->validate([
                'content' => 'required|string|max:1000',
            ]);

            $comment = TaskComment::create([
                'id' => (string) Str::uuid(),
                'task_id' => $task->id,
                'employee_id' => $employee->id,
                'content' => $request->content,
            ]);

            return $this->respondSuccess([
                'id' => $comment->id,
                'content' => $comment->content,
                'employee_name' => $employee->first_name.' '.$employee->last_name,
                'created_at' => $comment->created_at->toISOString(),
            ], 'Commentaire ajoute', 201);
        } catch (\Exception $e) {
            LoggingService::error('Failed to add task comment', $e);

            return $this->respondServerError('Impossible d\'ajouter le commentaire');
        }
    }

    /**
     * Delete a task.
     * DELETE /api/tasks/{id}
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $task = Task::where('company_id', $request->auth_company_id)->findOrFail($id);

            if ($request->has('filter_department_id') && $task->department_id !== $request->filter_department_id) {
                return $this->respondForbidden('Acces refuse');
            }

            $task->delete();

            return $this->respondSuccess(null, 'Tache supprimee');
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete task', $e);

            return $this->respondServerError('Impossible de supprimer la tache');
        }
    }

    /**
     * Log time on a task (timer).
     * POST /api/employee/my-tasks/{id}/timer
     */
    public function logTime(Request $request, string $id): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employe introuvable');
            }

            $task = Task::where('assigned_to', $employee->id)->findOrFail($id);

            $request->validate([
                'minutes' => 'required|integer|min:1',
            ]);

            $task->increment('actual_minutes', $request->minutes);

            return $this->respondSuccess([
                'actual_minutes' => $task->fresh()->actual_minutes,
            ], 'Temps enregistre');
        } catch (\Exception $e) {
            LoggingService::error('Failed to log time', $e);

            return $this->respondServerError('Impossible d\'enregistrer le temps');
        }
    }

    private function formatTask(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'priority' => $task->priority,
            'status' => $task->status,
            'due_date' => $task->due_date?->toDateString(),
            'recurrence' => $task->recurrence,
            'estimated_minutes' => $task->estimated_minutes,
            'actual_minutes' => $task->actual_minutes,
            'completed_at' => $task->completed_at?->toISOString(),
            'assigned_to' => $task->assigned_to,
            'assignee_name' => $task->assignee ? $task->assignee->first_name.' '.$task->assignee->last_name : null,
            'created_by' => $task->created_by,
            'creator_name' => $task->creator ? $task->creator->first_name.' '.$task->creator->last_name : null,
            'department_id' => $task->department_id,
            'mission_id' => $task->mission_id,
            'mission_title' => $task->mission?->title,
            'parent_task_id' => $task->parent_task_id,
            'dependency_task_id' => $task->dependency_task_id,
            'is_blocked' => $task->isBlocked(),
            'subtasks_count' => $task->subtasks()->count(),
            'comments' => ($task->comments ?? collect())->map(fn ($c) => [
                'id' => $c->id,
                'content' => $c->content,
                'employee_name' => $c->employee ? $c->employee->first_name.' '.$c->employee->last_name : null,
                'attachment_path' => $c->attachment_path,
                'created_at' => $c->created_at->toISOString(),
            ]),
            'created_at' => $task->created_at->toISOString(),
            'updated_at' => $task->updated_at->toISOString(),
        ];
    }
}
