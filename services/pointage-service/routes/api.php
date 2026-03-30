<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClockInController;
use App\Http\Controllers\Api\ClockOutController;
use App\Http\Controllers\Api\AttendanceController;

Route::middleware([
    \App\Http\Middleware\ValidateJwtFromAuthService::class,
    \App\Http\Middleware\ScopeByDepartment::class
])->group(function () {

    Route::prefix('pointage')->group(function () {
        // Pointage entrée / sortie
        Route::post('/clock-in',  [ClockInController::class, 'store']);
        Route::post('/clock-out', [ClockOutController::class, 'store']);

        // Lecture — manager et analytics
        Route::prefix('attendances')->group(function () {
            Route::get('/my-today', [AttendanceController::class, 'myToday']);
            Route::get('/today', [AttendanceController::class, 'today']);
            Route::get('/live',  [AttendanceController::class, 'live']);
            Route::get('/employee/{id}', [AttendanceController::class, 'byEmployee']);
        });
    });
});
