<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MissionCollection;
use App\Http\Resources\MissionResource;
use App\Models\Employee;
use App\Models\Mission;
use App\Models\MissionDocument;
use App\Services\ConflictService;
use App\Services\LoggingService;
use App\Services\RabbitMQService;
use App\Services\MissionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MissionController extends BaseApiController
{
    /**
     * List missions assigned to the authenticated employee.
     * GET /api/employee/my-missions
     */
    public function myMissions(Request $request): JsonResponse
    {
        try {
            LoggingService::info('Debugging myMissions lookup', [
                'auth_user_id' => $request->auth_user_id,
                'auth_company_id' => $request->auth_company_id
            ]);

            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employé introuvable');
            }

            $missions = $employee->missions()
                ->with('department')
                ->withCount([
                    'tasks',
                    'tasks as completed_tasks_count' => function ($q) {
                        $q->where('status', 'done');
                    },
                ])
                ->orderBy('start_date', 'desc')
                ->get()
                ->map(function ($mission) {
                    $total = $mission->tasks_count;
                    $completed = $mission->completed_tasks_count;
                    return [
                        'id' => $mission->id,
                        'title' => $mission->title,
                        'description' => $mission->description,
                        'location' => $mission->location,
                        'status' => $mission->status,
                        'start_date' => $mission->start_date?->toDateString(),
                        'end_date' => $mission->end_date?->toDateString(),
                        'department' => $mission->department?->name,
                        'assignment_status' => $mission->pivot->status,
                        'comment' => $mission->pivot->comment,
                        'assigned_at' => $mission->pivot->assigned_at,
                        'stats' => [
                            'total_tasks' => $total,
                            'completed_tasks' => $completed,
                            'progression_percentage' => $total > 0 ? round(($completed / $total) * 100) : 0,
                        ],
                    ];
                });

            return $this->respondSuccess($missions);
        } catch (\Exception $e) {
            LoggingService::error('Failed to list employee missions', $e);

            return $this->respondServerError('Impossible de récupérer vos missions');
        }
    }

    /**
     * Detail of a mission assigned to the authenticated employee.
     * GET /api/employee/my-missions/{id}
     */
    public function myMissionDetail(Request $request, string $id): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employe introuvable');
            }

            // Verify the employee is assigned to this mission
            $mission = Mission::with(['department', 'employees', 'documents'])
                ->withCount([
                    'tasks',
                    'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
                ])
                ->whereHas('employees', fn ($q) => $q->where('employees.id', $employee->id))
                ->where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            // Get tasks assigned to this employee for this mission
            $myTasks = $mission->tasks()
                ->with(['creator:id,first_name,last_name', 'comments.employee', 'comments.attachments'])
                ->where('assigned_to', $employee->id)
                ->orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
                ->orderBy('due_date')
                ->get();

            $myTasksCompleted = $myTasks->where('status', 'done')->count();

            // Coworkers = other employees assigned to this mission (not self)
            $coworkers = $mission->employees
                ->where('id', '!=', $employee->id)
                ->values()
                ->map(fn ($e) => [
                    'id' => $e->id,
                    'first_name' => $e->first_name,
                    'last_name' => $e->last_name,
                    'role' => $e->role,
                ]);

            return $this->respondSuccess([
                'id' => $mission->id,
                'title' => $mission->title,
                'description' => $mission->description,
                'location' => $mission->location,
                'status' => $mission->status,
                'start_date' => $mission->start_date?->toDateString(),
                'end_date' => $mission->end_date?->toDateString(),
                'department' => $mission->department ? [
                    'id' => $mission->department->id,
                    'name' => $mission->department->name,
                ] : null,
                'stats' => [
                    'total_tasks' => $mission->tasks_count,
                    'completed_tasks' => $mission->completed_tasks_count,
                    'progression_percentage' => $mission->tasks_count > 0
                        ? round(($mission->completed_tasks_count / $mission->tasks_count) * 100)
                        : 0,
                    'my_tasks_total' => $myTasks->count(),
                    'my_tasks_completed' => $myTasksCompleted,
                ],
                'my_tasks' => $myTasks->map(fn ($task) => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'due_date' => $task->due_date?->toDateString(),
                    'estimated_minutes' => $task->estimated_minutes,
                    'actual_minutes' => $task->actual_minutes,
                    'completed_at' => $task->completed_at?->toISOString(),
                    'creator_name' => $task->creator ? $task->creator->first_name . ' ' . $task->creator->last_name : null,
                    'comments' => ($task->comments ?? collect())->map(fn ($c) => [
                        'id' => $c->id,
                        'content' => $c->content,
                        'employee_name' => $c->employee ? $c->employee->first_name . ' ' . $c->employee->last_name : null,
                        'attachments' => ($c->attachments ?? collect())->map(fn ($a) => [
                            'id' => $a->id,
                            'file_name' => $a->file_name,
                            'file_type' => $a->file_type,
                            'file_size' => $a->file_size,
                            'url' => '/api/files/' . $a->file_path,
                        ]),
                        'created_at' => $c->created_at->toISOString(),
                    ]),
                    'created_at' => $task->created_at->toISOString(),
                    'updated_at' => $task->updated_at->toISOString(),
                ]),
                'documents' => ($mission->documents ?? collect())->map(fn ($d) => [
                    'id' => $d->id,
                    'file_name' => $d->file_name,
                    'file_type' => $d->file_type,
                    'file_size' => $d->file_size,
                    'url' => '/api/files/' . $d->file_path,
                    'uploaded_by_name' => $d->uploaded_by_name,
                    'created_at' => $d->created_at->toISOString(),
                ]),
                'coworkers' => $coworkers,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->respondNotFound('Mission non trouvee ou non assignee');
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve employee mission detail', $e);

            return $this->respondServerError('Impossible de recuperer le detail de la mission');
        }
    }

    /**
     * Display a listing of missions.
     * GET /api/missions
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Mission::with(['department', 'employees'])
                ->where('company_id', $request->auth_company_id);

            // Scoping enforced by middleware (filter_department_id)
            if ($request->has('filter_department_id')) {
                $query->where('department_id', $request->filter_department_id);
            } elseif ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            $missions = $query->orderBy('created_at', 'desc')->get();

            return $this->respondSuccess(new MissionCollection($missions));
        } catch (\Exception $e) {
            LoggingService::error('Failed to list missions', $e);

            return $this->respondServerError('Impossible de récupérer les missions');
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'nullable|string|max:255',
                'status' => 'nullable|in:draft,active,completed,cancelled',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'department_id' => 'nullable|uuid|exists:departments,id',
                'employee_ids' => 'nullable|array',
                'employee_ids.*' => 'uuid|exists:employees,id',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();
            $employeeIds = $data['employee_ids'] ?? [];
            unset($data['employee_ids']);

            // Security: Enforce department if manager
            if ($request->has('filter_department_id')) {
                $data['department_id'] = $request->filter_department_id;
            }

            $data['company_id'] = $request->auth_company_id;
            $data['id'] = (string) Str::uuid();

            DB::beginTransaction();

            $mission = Mission::create($data);

            if (! empty($employeeIds)) {
                $missionService = app(MissionService::class);
                $missionService->assignEmployees($mission, $employeeIds);
            }

            DB::commit();

            // Publier événement pour chaque employé assigné
            if (! empty($finalIds)) {
                $employees = Employee::whereIn('id', $finalIds)->get();
                $rabbitMQ = new RabbitMQService();
                foreach ($employees as $employee) {
                    $rabbitMQ->publishEvent('MissionAssigned', [
                        'employee_id' => $employee->id,
                        'user_id' => $employee->user_id,
                        'employee_name' => $employee->first_name.' '.$employee->last_name,
                        'company_id' => $mission->company_id,
                        'mission_id' => $mission->id,
                        'mission_title' => $mission->title,
                        'mission_location' => $mission->location,
                        'mission_start_date' => $mission->start_date?->toDateString(),
                    ], 'employee_events');
                }
            }

            LoggingService::info('Mission created with assignments', [
                'mission_id' => $mission->id,
                'assignments_count' => count($employeeIds),
            ]);

            return $this->respondSuccess(new MissionResource($mission->load('employees')), 'Mission créée avec succès', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            LoggingService::error('Failed to create mission', $e);

            return $this->respondServerError('Impossible de créer la mission');
        }
    }

    /**
     * Display the specified mission.
     * GET /api/missions/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $mission = Mission::with(['department', 'employees', 'documents'])
                ->withCount('tasks')
                ->where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            // Scoping check for managers
            if ($request->has('filter_department_id') && $mission->department_id !== $request->filter_department_id) {
                return $this->respondForbidden('Accès refusé à cette mission');
            }

            return $this->respondSuccess(new MissionResource($mission));
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Mission non trouvée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve mission', $e);

            return $this->respondServerError('Erreur lors de la récupération');
        }
    }

    /**
     * Update a mission.
     * PATCH /api/missions/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $mission = Mission::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            if ($request->has('filter_department_id') && $mission->department_id !== $request->filter_department_id) {
                return $this->respondForbidden('Accès refusé à cette mission');
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'location' => 'nullable|string|max:255',
                'status' => 'sometimes|in:draft,active,completed,cancelled',
                'start_date' => 'sometimes|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'department_id' => 'nullable|uuid|exists:departments,id',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();

            if ($request->has('filter_department_id')) {
                $data['department_id'] = $request->filter_department_id;
            }

            $mission->update($data);

            LoggingService::info('Mission updated', [
                'mission_id' => $mission->id,
            ]);

            return $this->respondSuccess(
                new MissionResource($mission->load('employees')),
                'Mission mise à jour avec succès'
            );
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Mission non trouvée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to update mission', $e);

            return $this->respondServerError('Impossible de mettre à jour la mission');
        }
    }

    /**
     * Assign employees to a mission.
     * POST /api/missions/{id}/assign
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        try {
            $mission = Mission::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            // Scoping check for managers
            if ($request->has('filter_department_id') && $mission->department_id !== $request->filter_department_id) {
                return $this->respondForbidden('Vous ne pouvez pas assigner des employés à cette mission');
            }

            $request->validate([
                'employee_ids' => 'required|array',
                'employee_ids.*' => 'uuid|exists:employees,id',
                'comment' => 'nullable|string',
            ]);

            // Vérifier les conflits de congé (warning non bloquant)
            $leaveWarnings = [];
            if ($mission->start_date && $mission->end_date) {
                $conflictService = app(ConflictService::class);
                foreach ($request->employee_ids as $empId) {
                    $conflicts = $conflictService->checkLeaveConflicts($empId, $mission->start_date, $mission->end_date);
                    foreach ($conflicts as $c) {
                        $emp = Employee::find($empId);
                        $leaveWarnings[] = ($emp?->full_name ?? $empId) . ' : ' . $c['title'];
                    }
                }
            }

            $missionService = app(MissionService::class);
            $missionService->assignEmployees($mission, $request->employee_ids, $request->comment);

            LoggingService::info('Employees assigned to mission', [
                'mission_id' => $id,
                'count' => count($request->employee_ids),
            ]);

            $message = ! empty($leaveWarnings)
                ? 'Employés assignés — attention : certains sont en congé'
                : 'Employés assignés avec succès';

            return $this->respondSuccess(
                ! empty($leaveWarnings) ? ['warnings' => $leaveWarnings] : null,
                $message
            );
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Mission non trouvée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to assign employees', $e);

            return $this->respondServerError('Erreur lors de l\'assignation');
        }
    }

    /**
     * Remove the specified mission.
     * DELETE /api/missions/{id}
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $mission = Mission::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            if ($request->has('filter_department_id') && $mission->department_id !== $request->filter_department_id) {
                return $this->respondForbidden('Accès refusé');
            }

            $mission->delete();

            return $this->respondSuccess(null, 'Mission supprimée');
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Mission non trouvée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete mission', $e);

            return $this->respondServerError('Impossible de supprimer la mission');
        }
    }

    /**
     * Upload documents to a mission.
     * POST /api/missions/{id}/documents
     */
    public function uploadDocuments(Request $request, string $id): JsonResponse
    {
        try {
            $mission = Mission::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            if ($request->has('filter_department_id') && $mission->department_id !== $request->filter_department_id) {
                return $this->respondForbidden('Accès refusé');
            }

            $request->validate([
                'documents' => 'required|array|max:10',
                'documents.*' => 'file|max:20480|mimes:jpg,jpeg,png,gif,pdf,mp4,mov,avi,webm,doc,docx,xls,xlsx,ppt,pptx,txt',
            ]);

            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            $uploaded = [];
            foreach ($request->file('documents') as $file) {
                $path = $file->store("mission-documents/{$mission->id}", 'public');
                $doc = MissionDocument::create([
                    'id' => (string) Str::uuid(),
                    'mission_id' => $mission->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_type' => $this->resolveDocFileType($file->getMimeType()),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_by' => $employee?->id,
                    'uploaded_by_name' => $employee ? $employee->first_name . ' ' . $employee->last_name : null,
                ]);
                $uploaded[] = [
                    'id' => $doc->id,
                    'file_name' => $doc->file_name,
                    'file_type' => $doc->file_type,
                    'file_size' => $doc->file_size,
                    'url' => '/api/files/' . $doc->file_path,
                    'uploaded_by_name' => $doc->uploaded_by_name,
                    'created_at' => $doc->created_at->toIso8601String(),
                ];
            }

            return $this->respondSuccess($uploaded, 'Documents uploades', 201);
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Mission non trouvée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to upload mission documents', $e);

            return $this->respondServerError('Impossible d\'uploader les documents');
        }
    }

    /**
     * Delete a mission document.
     * DELETE /api/missions/{id}/documents/{docId}
     */
    public function deleteDocument(Request $request, string $id, string $docId): JsonResponse
    {
        try {
            $mission = Mission::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            if ($request->has('filter_department_id') && $mission->department_id !== $request->filter_department_id) {
                return $this->respondForbidden('Accès refusé');
            }

            $doc = MissionDocument::where('mission_id', $mission->id)->findOrFail($docId);

            Storage::disk('public')->delete($doc->file_path);
            $doc->delete();

            return $this->respondSuccess(null, 'Document supprime');
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Document non trouve');
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete mission document', $e);

            return $this->respondServerError('Impossible de supprimer le document');
        }
    }

    private function resolveDocFileType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) return 'image';
        if ($mimeType === 'application/pdf') return 'pdf';
        if (str_starts_with($mimeType, 'video/')) return 'video';
        return 'document';
    }
}
