<?php

namespace App\Http\Controllers\Api;

use App\Services\LeaveRequestService;
use App\Services\LoggingService;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LeaveRequestController extends BaseApiController
{
    public function __construct(
        private readonly LeaveRequestService $leaveService
    ) {}

    /**
     * Display a listing of leave requests.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Scoped by company (and department via middleware if manager)
            $departmentId = $request->query('department_id', $request->filter_department_id);
            
            $leaves = $this->leaveService->index($request->auth_company_id, $departmentId);
            
            return $this->respondSuccess($leaves);
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve leaves', $e);
            return $this->respondServerError('Impossible de récupérer les demandes de congés');
        }
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id'   => 'required|uuid|exists:employees,id',
                'leave_type'    => 'required|string|max:50',
                'start_date'    => 'required|date',
                'end_date'      => 'required|date|after_or_equal:start_date',
                'reason'        => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();
            
            // Security: Ensure employee belongs to company
            $employee = \App\Models\Employee::where('id', $data['employee_id'])
                ->where('company_id', $request->auth_company_id)
                ->first();
                
            if (!$employee) {
                return $this->respondForbidden('Employé non trouvé dans votre entreprise');
            }

            $leave = $this->leaveService->create(array_merge($data, [
                'company_id'    => $request->auth_company_id,
                'department_id' => $employee->department_id,
                'status'        => 'pending'
            ]));

            return $this->respondSuccess($leave, 'Demande de congé enregistrée', 201);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create leave request', $e);
            return $this->respondServerError('Erreur lors de l\'enregistrement');
        }
    }

    /**
     * Update the specified leave request (Approval/Rejection).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $leave = LeaveRequest::where('id', $id)
                ->where('company_id', $request->auth_company_id)
                ->firstOrFail();

            // Manager check: can only approve/reject for their department
            if ($request->auth_role === 'manager' && $leave->department_id !== $request->auth_department_id) {
                return $this->respondForbidden('Vous ne pouvez valider que les congés de votre équipe');
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:approved,rejected',
                'reason_response' => 'nullable|string|max:500', // Optionnel : feedback manager
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $updatedLeave = $this->leaveService->update($leave, $validator->validated());

            return $this->respondSuccess($updatedLeave, 'Statut de la demande mis à jour');
        } catch (\Exception $e) {
            LoggingService::error('Failed to update leave request', $e);
            return $this->respondServerError('Erreur lors de la mise à jour');
        }
    }
    
    public function destroy(string $id): JsonResponse
    {
        // ... optionnel : annulation par l'employé si toujours pending
        return $this->respondError('Non implémenté', 501);
    }
}
