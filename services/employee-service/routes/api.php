<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\LocationController;

/* |-------------------------------------------------------------------------- | API Routes |-------------------------------------------------------------------------- | | Here is where you can register API routes for your application. These | routes are loaded by the RouteServiceProvider within a group which | is assigned the "api" middleware group. Enjoy building your API! | */

// ── Internal Service Routes (No JWT for faster inter-service communication)
Route::get('/employees/{id}/notification-context', [\App\Http\Controllers\Api\EmployeeNotificationController::class , 'getNotificationContext']);
Route::post('/employees/resolve-qr', [EmployeeController::class , 'resolveQr']);
Route::post('/employees/resolve-pin', [EmployeeController::class , 'resolvePin']);
Route::get('/employees/by-user/{userId}', [EmployeeController::class , 'resolveByUser']);
Route::get('/locations/resolve/{token}', [\App\Http\Controllers\Api\LocationController::class, 'resolve']);

// ── Routes protégées par JWT ──────────────────────────────
Route::middleware(['auth.jwt'])->group(function () {

    // ── Employees ──────────────────────────────────────────
    Route::get('/employee/me', [EmployeeController::class , 'me']);
    
    Route::middleware(['scoped.department'])->group(function () {
        Route::apiResource('employees', EmployeeController::class);
        Route::get('/employees/{id}/schedule', [EmployeeController::class , 'schedule']);
        Route::patch('/employees/{id}/status', [EmployeeController::class , 'updateStatus']);
        Route::post('/employees/{id}/generate-pin', [EmployeeController::class , 'generatePin']);
    });

    // ── Departments ────────────────────────────────────────
    Route::apiResource('departments', DepartmentController::class);

    // ── Locations ──────────────────────────────────────────
    Route::apiResource('locations', LocationController::class);
    Route::get('/locations/{id}/qr', [LocationController::class, 'generateQr']);

    // ── Schedules ──────────────────────────────────────────
    Route::apiResource('schedules', ScheduleController::class);
});
