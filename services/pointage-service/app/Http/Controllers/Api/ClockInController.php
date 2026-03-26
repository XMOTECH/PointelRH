<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ClockInRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\ClockInService;
use App\Services\DTOs\ClockInData;
use App\Services\LoggingService;
use App\Exceptions\AlreadyClockedInException;
use App\Exceptions\InvalidTokenException;
use App\Exceptions\NotAWorkDayException;
use Illuminate\Http\JsonResponse;

class ClockInController extends BaseApiController
{
    public function __construct(
        private readonly ClockInService $clockInService
    ) {}
 
    public function store(ClockInRequest $request): JsonResponse
    {
        try {
            $companyId = $request->auth_company_id ?? $request->input('company_id');

            if (!$companyId) {
                return $this->respondError('ID de l\'entreprise manquant pour le pointage', 400);
            }

            $attendance = $this->clockInService->clockIn(
                new ClockInData(
                    channel:   $request->validated('channel', 'qr'),
                    payload:   array_merge(
                        $request->validated('payload', []),
                        ['auth_user_id' => $request->auth_user_id]
                    ),
                    companyId: $companyId,
                )
            );
 
            LoggingService::info('Clock-in successful', [
                'employee_id' => $attendance->employee_id,
                'late_minutes' => $attendance->late_minutes,
            ]);
            
            // Broadcast event to clear Analytics cache AND generate snapshots
            (new \App\Services\RabbitMQService())->publishEvent('EmployeeCheckedIn', [
                'employee_id' => $attendance->employee_id,
                'company_id' => $attendance->company_id,
                'department_id' => $attendance->department_id,
                'late_minutes' => $attendance->late_minutes,
                'checked_in_at' => now()->toIso8601String(),
                'date' => now()->toDateString(),
            ], 'pointage_events');
 
            return $this->respondSuccess(
                new AttendanceResource($attendance),
                $attendance->isLate()
                    ? "Pointe avec {$attendance->late_minutes} min de retard"
                    : "Pointage enregistre — bonjour !",
                201
            );
 
        } catch (AlreadyClockedInException $e) {
            LoggingService::warning('Clock-in failed: already clocked in', ['error' => $e->getMessage()]);
            return $this->respondConflict($e->getMessage());
        } catch (InvalidTokenException $e) {
            LoggingService::warning('Clock-in failed: invalid token', ['error' => $e->getMessage()]);
            return $this->respondNotFound($e->getMessage());
        } catch (NotAWorkDayException $e) {
            LoggingService::warning('Clock-in failed: not a work day', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Clock-in error', $e);
            return $this->respondServerError('Une erreur est survenue lors du pointage');
        }
    }
}
