<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\EmployeeResource;
use App\Http\Resources\EmployeeCollection;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Services\EmployeeService;
use App\Services\LoggingService;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidDataException;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * EmployeeController
 * Gère les opérations CRUD et requêtes spéciales sur les employés
 *
 * Responsabilités:
 * - Valider les entrées
 * - Appeler les services métier
 * - Retourner les réponses formatées
 * - Tracer les opérations
 */
class EmployeeController extends BaseApiController
{
    public function __construct(
        private readonly EmployeeService $employeeService
    ) {}

    /**
     * Lister les employés de la compagnie
     * Supports filtrage par département, statut, type de contrat
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'department_id' => $request->query('department_id'),
                'status'        => $request->query('status'),
                'contract_type' => $request->query('contract_type'),
            ];

            $employees = $this->employeeService->list(
                $request->auth_company_id,
                array_filter($filters)
            );

            LoggingService::info('Employees list retrieved', [
                'company_id' => $request->auth_company_id,
                'count'      => $employees->count(),
            ]);

            return $this->respondSuccess(
                new EmployeeCollection($employees),
                null,
                200
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to list employees', $e);
            return $this->respondServerError('Impossible de récupérer la liste des employés');
        }
    }

    /**
     * Créer un nouvel employé
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        try {
            $data               = $request->validated();
            $data['company_id'] = $request->auth_company_id;

            $employee = $this->employeeService->create($data);

            return $this->respondSuccess(
                new EmployeeResource($employee),
                'Employé créé avec succès',
                201
            );
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid data when creating employee', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create employee', $e);
            return $this->respondServerError('Impossible de créer l\'employé');
        }
    }

    /**
     * Afficher les détails d'un employé
     */
    public function show(string $id, Request $request): JsonResponse
    {
        try {
            $employee = $this->employeeService->getById($id);

            return $this->respondSuccess(
                new EmployeeResource($employee),
                null,
                200
            );
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Employee not found', ['employee_id' => $id]);
            return $this->respondNotFound('Employé non trouvé');
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve employee', $e);
            return $this->respondServerError('Impossible de récupérer l\'employé');
        }
    }

    /**
     * Mettre à jour un employé
     */
    public function update(UpdateEmployeeRequest $request, string $id): JsonResponse
    {
        try {
            $employee = $this->employeeService->update($id, $request->validated());

            return $this->respondSuccess(
                new EmployeeResource($employee),
                'Employé mis à jour',
                200
            );
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Employee not found for update', ['employee_id' => $id]);
            return $this->respondNotFound('Employé non trouvé');
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid data when updating employee', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to update employee', $e);
            return $this->respondServerError('Impossible de mettre à jour l\'employé');
        }
    }

    /**
     * Supprimer un employé
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        try {
            $this->employeeService->delete($id);

            return $this->respondSuccess(
                null,
                'Employé supprimé',
                200
            );
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Employee not found for deletion', ['employee_id' => $id]);
            return $this->respondNotFound('Employé non trouvé');
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete employee', $e);
            return $this->respondServerError('Impossible de supprimer l\'employé');
        }
    }

    /**
     * Résoudre un employé via son QR token
     * POST /api/employees/resolve-qr
     */
    public function resolveQr(Request $request): JsonResponse
    {
        try {
            $qrToken = $request->input('qr_token') ?: $request->json('qr_token');
            if (!$qrToken) {
                return $this->respondError('The qr token field is required.', 422);
            }

            $employee = Employee::with(['schedule', 'department'])
                ->where('qr_token', $qrToken)
                ->where('status', 'active')
                ->first();

            if (!$employee) {
                LoggingService::warning('Invalid QR token', ['qr_token' => $qrToken]);
                return $this->respondNotFound('QR token invalide ou employé inactif');
            }

            LoggingService::info('Employee resolved via QR', ['employee_id' => $employee->id]);

            return $this->respondSuccess([
                'employee'   => new EmployeeResource($employee),
                'schedule'   => $employee->schedule,
                'department' => $employee->department,
            ]);
        } catch (\Exception $e) {
            LoggingService::error('Failed to resolve QR token', $e);
            return $this->respondServerError('Impossible de résoudre le QR token');
        }
    }

    /**
     * Récupérer l'horaire actif d'un employé
     * GET /api/employees/{id}/schedule
     */
    public function schedule(string $id): JsonResponse
    {
        try {
            $employee = Employee::with('schedule')->findOrFail($id);

            return $this->respondSuccess([
                'schedule'      => $employee->schedule,
                'work_days'     => $employee->schedule->work_days,
                'start_time'    => $employee->schedule->start_time,
                'grace_minutes' => $employee->schedule->grace_minutes,
                'timezone'      => $employee->schedule->timezone,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            LoggingService::warning('Employee not found for schedule', ['employee_id' => $id]);
            return $this->respondNotFound('Employé non trouvé');
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve employee schedule', $e);
            return $this->respondServerError('Impossible de récupérer l\'horaire');
        }
    }

    /**
     * Update the status of an employee.
     * PATCH /api/employees/{id}/status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:active,inactive,suspended',
            ]);

            $employee = Employee::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            $employee->update(['status' => $request->status]);

            return $this->respondSuccess(
                new EmployeeResource($employee),
                'Statut mis à jour',
                200
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            LoggingService::warning('Employee not found for status update', ['employee_id' => $id]);
            return $this->respondNotFound('Employé non trouvé');
        } catch (\Exception $e) {
            LoggingService::error('Failed to update employee status', $e);
            return $this->respondServerError('Impossible de mettre à jour le statut');
        }
    }
}
