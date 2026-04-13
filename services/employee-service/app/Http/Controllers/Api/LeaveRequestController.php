<?php

namespace App\Http\Controllers\Api;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Services\LeaveRequestService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LeaveRequestController extends BaseApiController
{
    public function __construct(
        private readonly LeaveRequestService $leaveService
    ) {}

    /**
     * Liste des congés (admin/manager).
     * GET /api/leaves
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $departmentId = $request->query('department_id', $request->filter_department_id);
            $leaves = $this->leaveService->index($request->auth_company_id, $departmentId);

            return $this->respondSuccess($leaves);
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve leaves', $e);

            return $this->respondServerError('Impossible de récupérer les demandes de congés');
        }
    }

    /**
     * Création par admin/manager (spécifie employee_id).
     * POST /api/leaves
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'required|uuid|exists:employees,id',
                'leave_type_id' => 'required|uuid|exists:leave_types,id',
                'leave_type' => 'nullable|string|max:50',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'half_day' => 'nullable|boolean',
                'half_day_period' => 'nullable|in:morning,afternoon',
                'reason' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();

            $employee = Employee::where('id', $data['employee_id'])
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondForbidden('Employé non trouvé dans votre entreprise');
            }

            $data['company_id'] = $request->auth_company_id;
            $data['department_id'] = $employee->department_id;

            $leave = $this->leaveService->create($data);

            return $this->respondSuccess($leave, 'Demande de congé enregistrée', 201);
        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create leave request', $e);

            return $this->respondServerError('Erreur lors de l\'enregistrement');
        }
    }

    /**
     * Approbation / Rejet d'un congé.
     * PATCH /api/leaves/{id}/status
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $leave = LeaveRequest::where('id', $id)
                ->where('company_id', $request->auth_company_id)
                ->firstOrFail();

            if ($request->auth_role === 'manager' && $leave->department_id !== $request->auth_department_id) {
                return $this->respondForbidden('Vous ne pouvez valider que les congés de votre équipe');
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:approved,rejected',
                'rejection_reason' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();

            // Résoudre l'approbateur
            $approver = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if ($approver) {
                $data['approved_by'] = $approver->id;
            }

            $updatedLeave = $this->leaveService->update($leave, $data);

            return $this->respondSuccess($updatedLeave, 'Statut de la demande mis à jour');
        } catch (\Exception $e) {
            LoggingService::error('Failed to update leave request', $e);

            return $this->respondServerError('Erreur lors de la mise à jour');
        }
    }

    /**
     * Annulation d'un congé par admin.
     * DELETE /api/leaves/{id}
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $leave = LeaveRequest::where('id', $id)
                ->where('company_id', $request->auth_company_id)
                ->firstOrFail();

            if ($leave->status !== 'pending') {
                return $this->respondError('Seules les demandes en attente peuvent être annulées', 422);
            }

            $this->leaveService->cancel($leave);

            return $this->respondSuccess(null, 'Demande de congé annulée');
        } catch (\Exception $e) {
            LoggingService::error('Failed to cancel leave request', $e);

            return $this->respondServerError('Erreur lors de l\'annulation');
        }
    }

    // ── Employee self-service endpoints ──────────────────────

    /**
     * Mes congés.
     * GET /api/employee/my-leaves
     */
    public function myLeaves(Request $request): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employé introuvable');
            }

            $leaves = $this->leaveService->getMyLeaves($employee->id, $request->auth_company_id);

            return $this->respondSuccess($leaves);
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve employee leaves', $e);

            return $this->respondServerError('Impossible de récupérer vos congés');
        }
    }

    /**
     * Mes soldes de congé.
     * GET /api/employee/my-balance
     */
    public function myBalance(Request $request): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employé introuvable');
            }

            $year = (int) $request->query('year', now()->year);
            $balances = $this->leaveService->getMyBalance($employee->id, $request->auth_company_id, $year);

            return $this->respondSuccess($balances);
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve employee balance', $e);

            return $this->respondServerError('Impossible de récupérer vos soldes');
        }
    }

    /**
     * Demande de congé par l'employé connecté.
     * POST /api/employee/my-leaves
     */
    public function storeMyLeave(Request $request): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employé introuvable');
            }

            $validator = Validator::make($request->all(), [
                'leave_type_id' => 'required|uuid|exists:leave_types,id',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'half_day' => 'nullable|boolean',
                'half_day_period' => 'nullable|in:morning,afternoon',
                'reason' => 'nullable|string|max:500',
                'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            ]);

            if ($validator->fails()) {
                return $this->respondError($validator->errors()->first(), 422);
            }

            $data = $validator->validated();
            $data['employee_id'] = $employee->id;
            $data['company_id'] = $request->auth_company_id;
            $data['department_id'] = $employee->department_id;

            // Upload pièce jointe si présente
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store(
                    "leave-attachments/{$request->auth_company_id}",
                    'local'
                );
                $data['attachment_path'] = $path;
            }
            unset($data['attachment']);

            $leave = $this->leaveService->create($data);

            return $this->respondSuccess($leave, 'Demande de congé soumise avec succès', 201);
        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create employee leave request', $e);

            return $this->respondServerError('Erreur lors de la soumission');
        }
    }

    /**
     * Annulation d'un congé par l'employé.
     * DELETE /api/employee/my-leaves/{id}
     */
    public function cancelMyLeave(Request $request, string $id): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', $request->auth_user_id)
                ->where('company_id', $request->auth_company_id)
                ->first();

            if (! $employee) {
                return $this->respondNotFound('Profil employé introuvable');
            }

            $leave = LeaveRequest::where('id', $id)
                ->where('employee_id', $employee->id)
                ->where('company_id', $request->auth_company_id)
                ->firstOrFail();

            $this->leaveService->cancel($leave);

            return $this->respondSuccess(null, 'Demande de congé annulée');
        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to cancel employee leave', $e);

            return $this->respondServerError('Erreur lors de l\'annulation');
        }
    }

    /**
     * Types de congé actifs.
     * GET /api/leave-types
     */
    public function leaveTypes(Request $request): JsonResponse
    {
        try {
            $types = $this->leaveService->getLeaveTypes($request->auth_company_id);

            return $this->respondSuccess($types);
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve leave types', $e);

            return $this->respondServerError('Impossible de récupérer les types de congé');
        }
    }
}
