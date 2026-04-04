<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ClockInController;
use App\Http\Controllers\Api\ClockOutController;
use App\Http\Middleware\ScopeByDepartment;
use App\Http\Middleware\ValidateJwtFromAuthService;
use Illuminate\Support\Facades\Route;

// ── Health check (Docker / load balancer) ────────────────
Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'pointage']));

Route::middleware([
    ValidateJwtFromAuthService::class,
    ScopeByDepartment::class,
])->group(function () {

    Route::prefix('pointage')->group(function () {
        // Pointage entrée / sortie
        Route::post('/clock-in', [ClockInController::class, 'store']);
        Route::post('/clock-out', [ClockOutController::class, 'store']);

        // Lecture — manager et analytics
        Route::prefix('attendances')->group(function () {
            Route::get('/my-today', [AttendanceController::class, 'myToday']);
            Route::get('/today', [AttendanceController::class, 'today']);
            Route::get('/live', [AttendanceController::class, 'live']);
            Route::get('/employee/{id}', [AttendanceController::class, 'byEmployee']);
        });
    });
});
