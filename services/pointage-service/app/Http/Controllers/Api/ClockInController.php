<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClockInRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\ClockInService;
use App\Services\DTOs\ClockInData;
use App\Exceptions\AlreadyClockedInException;
use App\Exceptions\InvalidTokenException;
use App\Exceptions\NotAWorkDayException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ClockInController extends Controller
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
 
            return response()->json([
                'success'    => true,
                'attendance' => new AttendanceResource($attendance),
                'message'    => $attendance->isLate()
                    ? "Pointe avec {$attendance->late_minutes} min de retard"
                    : "Pointage enregistre — bonjour !",
            ], 201);
 
        } catch (AlreadyClockedInException $e) {
            return response()->json(['error' => $e->getMessage()], 409);
        } catch (InvalidTokenException $e) {
            return response()->json(['error' => 'QR invalide ou expire'], 404);
        } catch (NotAWorkDayException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error("Erreur clock-in: " . $e->getMessage());
            return response()->json(['error' => 'Une erreur interne est survenue: ' . $e->getMessage()], 500);
        }
    }
}
