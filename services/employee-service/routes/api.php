<?php

use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\EmployeeNotificationController;
use App\Http\Controllers\Api\FaceEnrollmentController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MissionController;
use App\Http\Controllers\Api\PlanningController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

/* |-------------------------------------------------------------------------- | API Routes |-------------------------------------------------------------------------- | | Here is where you can register API routes for your application. These | routes are loaded by the RouteServiceProvider within a group which | is assigned the "api" middleware group. Enjoy building your API! | */

// ── Health check (Docker / load balancer) ────────────────
Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'employee']));

// ── Internal Service Routes (No JWT for inter-service communication)
Route::get('/employees/{id}/notification-context', [EmployeeNotificationController::class, 'getNotificationContext']);
Route::get('/employees/by-user/{userId}', [EmployeeController::class, 'resolveByUser']);
Route::get('/locations/resolve/{token}', [LocationController::class, 'resolve']);

// ── Endpoints sensibles avec rate limiting (brute force protection)
Route::middleware(['throttle:resolve-employee'])->group(function () {
    Route::post('/employees/resolve-qr', [EmployeeController::class, 'resolveQr']);
    Route::post('/employees/resolve-pin', [EmployeeController::class, 'resolvePin']);
    Route::post('/employees/resolve-face', [EmployeeController::class, 'resolveFace']);
});

// ── Routes protégées par JWT ──────────────────────────────
Route::middleware(['auth.jwt'])->group(function () {

    // ── Employees ──────────────────────────────────────────
    Route::get('/employee/me', [EmployeeController::class, 'me']);
    Route::get('/employee/my-missions', [MissionController::class, 'myMissions']);

    Route::middleware(['scoped.department'])->group(function () {
        Route::apiResource('employees', EmployeeController::class);
        Route::get('/employees/{id}/schedule', [EmployeeController::class, 'schedule']);
        Route::patch('/employees/{id}/status', [EmployeeController::class, 'updateStatus']);
        Route::post('/employees/{id}/generate-pin', [EmployeeController::class, 'generatePin']);

        // ── Face Enrollment ──────────────────────────────────
        Route::get('/employees/{id}/face-enrollment', [FaceEnrollmentController::class, 'show']);
        Route::post('/employees/{id}/face-enrollment', [FaceEnrollmentController::class, 'store']);
        Route::delete('/employees/{id}/face-enrollment', [FaceEnrollmentController::class, 'destroy']);

        Route::apiResource('leaves', LeaveRequestController::class);
        Route::patch('/leaves/{id}/status', [LeaveRequestController::class, 'update']);

        Route::apiResource('missions', MissionController::class);
        Route::post('/missions/{id}/assign', [MissionController::class, 'assign']);

        // ── Schedule Templates ────────────────────────────────
        Route::apiResource('schedules', ScheduleController::class);

        // ── Operational Planning ──────────────────────────────
        Route::get('/planning', [PlanningController::class, 'index']);
        Route::post('/planning/override', [PlanningController::class, 'override']);
    });


    // ── Departments ────────────────────────────────────────
    Route::apiResource('departments', DepartmentController::class);

    // ── Settings ───────────────────────────────────────────
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::post('/settings', [SettingsController::class, 'update']);
    Route::get('/settings/{group}', [SettingsController::class, 'show']);
});
