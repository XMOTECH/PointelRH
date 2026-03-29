<?php

namespace App\Http\Controllers\Api;

use App\Models\Mission;
use App\Models\Employee;
use App\Http\Resources\MissionResource;
use App\Http\Resources\MissionCollection;
use App\Services\LoggingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MissionController extends BaseApiController
{
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

            if (!empty($employeeIds)) {
                // Ensure all employees belong to the same company/department context
                $validEmployees = Employee::whereIn('id', $employeeIds)
                    ->where('company_id', $request->auth_company_id);

                if ($request->has('filter_department_id')) {
                    $validEmployees->where('department_id', $request->filter_department_id);
                }

                $finalIds = $validEmployees->pluck('id')->toArray();

                if (count($finalIds) !== count($employeeIds)) {
                    DB::rollBack();
                    return $this->respondError('Certains employés ne sont pas éligibles pour cette mission', 422);
                }

                $mission->employees()->syncWithPivotValues($finalIds, [
                    'status' => 'assigned',
                    'assigned_at' => now(),
                ]);
            }

            DB::commit();

            LoggingService::info('Mission created with assignments', [
                'mission_id' => $mission->id,
                'assignments_count' => count($employeeIds)
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
                ->where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            // Scoping check for managers
            if ($request->has('filter_department_id') && $mission->department_id !== $request->filter_department_id) {
                return $this->respondForbidden('Accès refusé à cette mission');
            }

            return $this->respondSuccess(new MissionResource($mission));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->respondNotFound('Mission non trouvée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve mission', $e);
            return $this->respondServerError('Erreur lors de la récupération');
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

            // Ensure all employees belong to the same company/department context
            $employeeIds = $request->employee_ids;
            $validEmployees = Employee::whereIn('id', $employeeIds)
                ->where('company_id', $request->auth_company_id);

            if ($request->has('filter_department_id')) {
                $validEmployees->where('department_id', $request->filter_department_id);
            }

            $finalIds = $validEmployees->pluck('id')->toArray();

            if (count($finalIds) !== count($employeeIds)) {
                return $this->respondError('Certains employés ne sont pas éligibles pour cette mission', 422);
            }

            $mission->employees()->syncWithPivotValues($finalIds, [
                'status' => 'assigned',
                'comment' => $request->comment,
                'assigned_at' => now(),
            ]);

            LoggingService::info('Employees assigned to mission', [
                'mission_id' => $id,
                'count' => count($finalIds)
            ]);

            return $this->respondSuccess(null, 'Employés assignés avec succès');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->respondNotFound('Mission non trouvée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete mission', $e);
            return $this->respondServerError('Impossible de supprimer la mission');
        }
    }
}
