<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClockOutService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\AttendanceResource;
use App\Exceptions\AttendanceNotFoundException;
use Illuminate\Support\Facades\Log;

class ClockOutController extends Controller
{
    public function __construct(
        private readonly ClockOutService $clockOutService
    ) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'employee_id' => 'required|uuid',
        ]);

        try {
            $attendance = $this->clockOutService->clockOut(
                $request->employee_id,
                $request->auth_company_id
            );

            return response()->json([
                'success' => true,
                'attendance' => new AttendanceResource($attendance),
                'message' => 'Pointage de sortie enregistre. Travail effectue: ' . $attendance->work_minutes . ' min',
            ]);
        } catch (AttendanceNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            \Log::error("Erreur clock-out: " . $e->getMessage());
            return response()->json(['error' => 'Une erreur interne est survenue: ' . $e->getMessage()], 500);
        }
    }
}
