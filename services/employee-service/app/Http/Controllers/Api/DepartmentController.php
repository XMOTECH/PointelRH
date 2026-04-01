<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InvalidDataException;
use App\Exceptions\ResourceNotFoundException;
use App\Http\Resources\DepartmentResource;
use App\Services\DepartmentService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * DepartmentController
 * Gère les opérations CRUD sur les départements
 *
 * Responsabilités:
 * - Valider les entrées
 * - Appeler les services métier
 * - Retourner les réponses formatées
 * - Tracer les opérations
 */
class DepartmentController extends BaseApiController
{
    public function __construct(
        private readonly DepartmentService $departmentService
    ) {}

    /**
     * Lister tous les départements de la compagnie
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $departments = $this->departmentService->list($request->auth_company_id);

            LoggingService::info('Departments list retrieved', [
                'company_id' => $request->auth_company_id,
                'count' => $departments->count(),
            ]);

            return $this->respondSuccess(
                DepartmentResource::collection($departments),
                null,
                200
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to list departments', $e);

            return $this->respondServerError();
        }
    }

    /**
     * Créer un nouveau département
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'manager_id' => 'nullable|uuid',
                'parent_id' => 'nullable|uuid',
                'location' => 'nullable|string|max:255',
            ]);

            $data['company_id'] = $request->auth_company_id;
            $department = $this->departmentService->create($data);

            return $this->respondSuccess(
                new DepartmentResource($department),
                'Department created successfully',
                201
            );
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when creating department', ['errors' => $e->errors()]);

            return $this->respondValidationError($e->errors());
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid data when creating department', ['error' => $e->getMessage()]);

            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create department', $e);

            return $this->respondServerError();
        }
    }

    /**
     * Récupérer un département spécifique
     */
    public function show(string $id, Request $request): JsonResponse
    {
        try {
            $department = $this->departmentService->getById($id);

            LoggingService::info('Department retrieved', [
                'department_id' => $id,
            ]);

            return $this->respondSuccess(
                new DepartmentResource($department),
                null,
                200
            );
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Department not found', ['department_id' => $id]);

            return $this->respondNotFound('Department not found');
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve department', $e);

            return $this->respondServerError();
        }
    }

    /**
     * Modifier un département
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'sometimes|string|max:255',
                'manager_id' => 'nullable|uuid',
                'parent_id' => 'nullable|uuid',
                'location' => 'nullable|string|max:255',
            ]);

            $department = $this->departmentService->update($id, $data);

            return $this->respondSuccess(
                new DepartmentResource($department),
                'Department updated successfully',
                200
            );
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when updating department', ['errors' => $e->errors()]);

            return $this->respondValidationError($e->errors());
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Department not found for update', ['department_id' => $id]);

            return $this->respondNotFound('Department not found');
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid data when updating department', ['error' => $e->getMessage()]);

            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to update department', $e);

            return $this->respondServerError();
        }
    }

    /**
     * Supprimer un département
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        try {
            $this->departmentService->delete($id);

            return $this->respondSuccess(
                null,
                'Department deleted successfully',
                200
            );
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Department not found for deletion', ['department_id' => $id]);

            return $this->respondNotFound('Department not found');
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete department', $e);

            return $this->respondServerError();
        }
    }
}
