<?php

namespace App\Http\Controllers\Api;

use App\Services\PlanningService;
use App\Services\LoggingService;
use App\Models\ScheduleOverride;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PlanningController extends BaseApiController
{
    public function __construct(
        private readonly PlanningService $planningService
    ) {}

    /**
     * Get the effective planning for a company/department within a date range.
     * GET /api/planning
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $startDate = $request->query('start_date', now()->startOfWeek()->format('Y-m-d'));
            $endDate = $request->query('end_date', now()->endOfWeek()->format('Y-m-d'));
            $departmentId = $request->filter_department_id ?? $request->query('department_id');

            // Fetch employees for this company/department
            $query = \App\Models\Employee::where('company_id', $request->auth_company_id);
            if ($departmentId) {
                $query->where('department_id', $departmentId);
            }
            $employees = $query->get();

            $result = $employees->map(function ($employee) use ($startDate, $endDate) {
                return [
                    'employee_id' => $employee->id,
                    'first_name' => $employee->first_name,
                    'last_name' => $employee->last_name,
                    'days' => $this->planningService->getEmployeePlanning($employee->id, $startDate, $endDate)
                ];
            });

            return $this->respondSuccess($result);
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve planning', $e);
            return $this->respondServerError('Impossible de récupérer le planning');
        }
    }

    /**
     * Set a schedule override for a specific employee and date.
     * POST /api/planning/override
     */
    public function override(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'required|uuid|exists:employees,id',
                'date' => 'required|date',
                'is_off' => 'required|boolean',
                'start_time' => 'required_if:is_off,false|nullable|date_format:H:i',
                'end_time' => 'required_if:is_off,false|nullable|date_format:H:i',
                'reason' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();

            // Security: Ensure employee belongs to the authenticated company and department (if manager)
            $query = \App\Models\Employee::where('id', $data['employee_id'])
                ->where('company_id', $request->auth_company_id);
            
            if ($request->has('filter_department_id')) {
                $query->where('department_id', $request->filter_department_id);
            }

            $employee = $query->first();

            if (!$employee) {
                return $this->respondForbidden('Vous n\'avez pas la permission de modifier cet employé ou il n\'appartient pas à votre département');
            }
            
            $override = ScheduleOverride::updateOrCreate(
                ['employee_id' => $data['employee_id'], 'date' => $data['date']],
                [
                    'start_time' => $data['start_time'] ?? null,
                    'end_time' => $data['end_time'] ?? null,
                    'is_off' => $data['is_off'],
                    'reason' => $data['reason'] ?? null,
                ]
            );

            LoggingService::info('Schedule override created/updated', [
                'employee_id' => $data['employee_id'],
                'date' => $data['date'],
            ]);

            return $this->respondSuccess($override, 'Modification enregistrée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to save schedule override', $e);
            return $this->respondServerError('Erreur lors de l\'enregistrement');
        }
    }
}
