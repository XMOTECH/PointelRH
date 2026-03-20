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
            $attendance = $this->clockInService->clockIn(
                new ClockInData(
                    channel:   $request->validated('channel', 'qr'),
                    payload:   $request->validated('payload', []),
                    companyId: $request->auth_company_id,
                )
            );
 
            LoggingService::info('Clock-in successful', [
                'employee_id' => $attendance->employee_id,
                'late_minutes' => $attendance->late_minutes,
            ]);
 
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
            return $this->respondNotFound('QR invalide ou expire');
        } catch (NotAWorkDayException $e) {
            LoggingService::warning('Clock-in failed: not a work day', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Clock-in error', $e);
            return $this->respondServerError('Une erreur est survenue lors du pointage');
        }
    }
}
