<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\LocationController;

/* |-------------------------------------------------------------------------- | API Routes |-------------------------------------------------------------------------- | | Here is where you can register API routes for your application. These | routes are loaded by the RouteServiceProvider within a group which | is assigned the "api" middleware group. Enjoy building your API! | */

// ── Internal Service Routes (No JWT for inter-service communication)
Route::get('/employees/{id}/notification-context', [\App\Http\Controllers\Api\EmployeeNotificationController::class , 'getNotificationContext']);
Route::get('/employees/by-user/{userId}', [EmployeeController::class , 'resolveByUser']);
Route::get('/locations/resolve/{token}', [\App\Http\Controllers\Api\LocationController::class, 'resolve']);

// ── Endpoints sensibles avec rate limiting (brute force protection)
Route::middleware(['throttle:resolve-employee'])->group(function () {
    Route::post('/employees/resolve-qr', [EmployeeController::class , 'resolveQr']);
    Route::post('/employees/resolve-pin', [EmployeeController::class , 'resolvePin']);
});

// ── Routes protégées par JWT ──────────────────────────────
Route::middleware(['auth.jwt'])->group(function () {

    // ── Employees ──────────────────────────────────────────
    Route::get('/employee/me', [EmployeeController::class , 'me']);
    
    Route::middleware(['scoped.department'])->group(function () {
        Route::apiResource('employees', EmployeeController::class);
        Route::get('/employees/{id}/schedule', [EmployeeController::class , 'schedule']);
        Route::patch('/employees/{id}/status', [EmployeeController::class , 'updateStatus']);
        Route::post('/employees/{id}/generate-pin', [EmployeeController::class , 'generatePin']);

        Route::apiResource('leaves', \App\Http\Controllers\Api\LeaveRequestController::class);
        Route::patch('/leaves/{id}/status', [\App\Http\Controllers\Api\LeaveRequestController::class, 'update']);

        Route::apiResource('missions', \App\Http\Controllers\Api\MissionController::class);
        Route::post('/missions/{id}/assign', [\App\Http\Controllers\Api\MissionController::class, 'assign']);

        // ── Operational Planning ──────────────────────────────
        Route::get('/planning', [\App\Http\Controllers\Api\PlanningController::class, 'index']);
        Route::post('/planning/override', [\App\Http\Controllers\Api\PlanningController::class, 'override']);
    });

    // ── Departments ────────────────────────────────────────
    Route::apiResource('departments', DepartmentController::class);

    // ── Settings ───────────────────────────────────────────
    Route::get('/settings', [\App\Http\Controllers\Api\SettingsController::class, 'index']);
    Route::post('/settings', [\App\Http\Controllers\Api\SettingsController::class, 'update']);
    Route::get('/settings/{group}', [\App\Http\Controllers\Api\SettingsController::class, 'show']);
});
