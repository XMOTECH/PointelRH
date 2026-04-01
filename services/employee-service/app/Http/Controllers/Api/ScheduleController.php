<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InvalidDataException;
use App\Exceptions\ResourceNotFoundException;
use App\Http\Resources\ScheduleResource;
use App\Services\LoggingService;
use App\Services\ScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * ScheduleController
 * Gère les opérations CRUD sur les horaires
 *
 * Responsabilités:
 * - Valider les entrées
 * - Appeler les services métier
 * - Retourner les réponses formatées
 * - Tracer les opérations
 */
class ScheduleController extends BaseApiController
{
    public function __construct(
        private readonly ScheduleService $scheduleService
    ) {}

    /**
     * Lister tous les horaires de la compagnie
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $schedules = $this->scheduleService->list($request->auth_company_id);

            LoggingService::info('Schedules list retrieved', [
                'company_id' => $request->auth_company_id,
                'count' => $schedules->count(),
            ]);

            return $this->respondSuccess(
                ScheduleResource::collection($schedules),
                null,
                200
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to list schedules', $e);

            return $this->respondServerError();
        }
    }

    /**
     * Créer un nouvel horaire
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'work_days' => 'required|array',
                'start_time' => 'required|date_format:H:i:s',
                'end_time' => 'required|date_format:H:i:s',
                'grace_minutes' => 'integer|min:0',
                'timezone' => 'string|max:100',
            ]);

            $data['company_id'] = $request->auth_company_id;
            $schedule = $this->scheduleService->create($data);

            return $this->respondSuccess(
                new ScheduleResource($schedule),
                'Schedule created successfully',
                201
            );
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when creating schedule', ['errors' => $e->errors()]);

            return $this->respondValidationError($e->errors());
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid data when creating schedule', ['error' => $e->getMessage()]);

            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to create schedule', $e);

            return $this->respondServerError();
        }
    }

    /**
     * Récupérer un horaire spécifique
     */
    public function show(string $id, Request $request): JsonResponse
    {
        try {
            $schedule = $this->scheduleService->getById($id);

            LoggingService::info('Schedule retrieved', [
                'schedule_id' => $id,
            ]);

            return $this->respondSuccess(
                new ScheduleResource($schedule),
                null,
                200
            );
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Schedule not found', ['schedule_id' => $id]);

            return $this->respondNotFound('Schedule not found');
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve schedule', $e);

            return $this->respondServerError();
        }
    }

    /**
     * Modifier un horaire
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'sometimes|string|max:255',
                'work_days' => 'sometimes|array',
                'start_time' => 'sometimes|date_format:H:i:s',
                'end_time' => 'sometimes|date_format:H:i:s',
                'grace_minutes' => 'sometimes|integer|min:0',
                'timezone' => 'sometimes|string|max:100',
            ]);

            $schedule = $this->scheduleService->update($id, $data);

            return $this->respondSuccess(
                new ScheduleResource($schedule),
                'Schedule updated successfully',
                200
            );
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when updating schedule', ['errors' => $e->errors()]);

            return $this->respondValidationError($e->errors());
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Schedule not found for update', ['schedule_id' => $id]);

            return $this->respondNotFound('Schedule not found');
        } catch (InvalidDataException $e) {
            LoggingService::warning('Invalid data when updating schedule', ['error' => $e->getMessage()]);

            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to update schedule', $e);

            return $this->respondServerError();
        }
    }

    /**
     * Supprimer un horaire
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        try {
            $this->scheduleService->delete($id);

            return $this->respondSuccess(
                null,
                'Schedule deleted successfully',
                200
            );
        } catch (ResourceNotFoundException $e) {
            LoggingService::warning('Schedule not found for deletion', ['schedule_id' => $id]);

            return $this->respondNotFound('Schedule not found');
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete schedule', $e);

            return $this->respondServerError();
        }
    }
}
