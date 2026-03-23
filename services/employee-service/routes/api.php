<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ScheduleController;

/* |-------------------------------------------------------------------------- | API Routes |-------------------------------------------------------------------------- | | Here is where you can register API routes for your application. These | routes are loaded by the RouteServiceProvider within a group which | is assigned the "api" middleware group. Enjoy building your API! | */

// ── Internal Service Routes (No JWT for faster inter-service communication)
Route::get('/employees/{id}/notification-context', [\App\Http\Controllers\Api\EmployeeNotificationController::class , 'getNotificationContext']);
Route::post('/employees/resolve-qr', [EmployeeController::class , 'resolveQr']);

// ── Routes protégées par JWT ──────────────────────────────
Route::middleware(['auth.jwt'])->group(function () {

    // ── Employees ──────────────────────────────────────────
    Route::get('/employee/me', [EmployeeController::class , 'me']);
    
    Route::middleware(['scoped.department'])->group(function () {
        Route::apiResource('employees', EmployeeController::class);
        Route::get('/employees/{id}/schedule', [EmployeeController::class , 'schedule']);
        Route::patch('/employees/{id}/status', [EmployeeController::class , 'updateStatus']);
    });

    // ── Departments ────────────────────────────────────────
    Route::apiResource('departments', DepartmentController::class);

    // ── Schedules ──────────────────────────────────────────
    Route::apiResource('schedules', ScheduleController::class);
});
