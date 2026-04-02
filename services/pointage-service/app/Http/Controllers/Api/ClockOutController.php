<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AttendanceNotFoundException;
use App\Exceptions\NotClockedInException;
use App\Http\Requests\ClockOutRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\ClockOutService;
use App\Services\LoggingService;
use App\Services\RabbitMQService;
use Illuminate\Http\JsonResponse;

/**
 * ClockOutController
 * Gère les demandes de pointage de sortie
 *
 * Responsabilités:
 * - Valider les entrées
 * - Appeler le service métier
 * - Retourner les réponses formatées
 * - Tracer les erreurs
 */
class ClockOutController extends BaseApiController
{
    public function __construct(
        private readonly ClockOutService $clockOutService
    ) {}

    /**
     * Enregistrer une sortie (clock-out)
     */
    public function store(ClockOutRequest $request): JsonResponse
    {
        try {
            $companyId = $request->auth_company_id ?? $request->input('company_id');

            if (! $companyId) {
                return $this->respondError('ID de l\'entreprise manquant pour le pointage', 400);
            }

            $attendance = $this->clockOutService->clockOut(
                employeeId: $request->validated('employee_id'),
                companyId: $companyId,
            );

            LoggingService::info('Clock-out successful', [
                'employee_id' => $attendance->employee_id,
                'work_minutes' => $attendance->work_minutes,
            ]);

            // Broadcast event to clear Analytics cache
            app(RabbitMQService::class)->publishEvent('EmployeeCheckedOut', [
                'employee_id' => $attendance->employee_id,
                'company_id' => $attendance->company_id,
                'department_id' => $attendance->department_id,
                'work_minutes' => $attendance->work_minutes,
                'date' => now()->toDateString(),
            ], 'pointage_events');

            return $this->respondSuccess(
                new AttendanceResource($attendance),
                "Pointage de sortie enregistré. Travail effectué: {$attendance->work_minutes} min",
                200
            );

        } catch (AttendanceNotFoundException $e) {
            LoggingService::warning('Clock-out failed: attendance not found', ['error' => $e->getMessage()]);

            return $this->respondNotFound($e->getMessage());

        } catch (NotClockedInException $e) {
            LoggingService::warning('Clock-out failed: not clocked in', ['error' => $e->getMessage()]);

            return $this->respondConflict($e->getMessage());

        } catch (\Exception $e) {
            LoggingService::error('Clock-out error', $e);

            return $this->respondServerError('Une erreur est survenue lors du pointage de sortie');
        }
    }
}
