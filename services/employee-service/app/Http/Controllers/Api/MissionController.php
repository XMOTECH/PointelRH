<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MissionCollection;
use App\Http\Resources\MissionResource;
use App\Models\Employee;
use App\Models\Mission;
use App\Services\ConflictService;
use App\Services\LoggingService;
use App\Services\RabbitMQService;
use App\Services\MissionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                ->orderBy('start_date', 'desc')
                ->get()
                ->map(function ($mission) {
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
                    ];
                });

            return $this->respondSuccess($missions);
        } catch (\Exception $e) {
            LoggingService::error('Failed to list employee missions', $e);

            return $this->respondServerError('Impossible de récupérer vos missions');
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
            $mission = Mission::with(['department', 'employees'])
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
}
