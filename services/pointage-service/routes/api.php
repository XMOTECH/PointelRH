<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClockInController;
use App\Http\Controllers\Api\ClockOutController;
use App\Http\Controllers\Api\AttendanceController;

Route::middleware([\App\Http\Middleware\ValidateJwtFromAuthService::class])->group(function () {
    Route::group(['prefix' => 'pointage'], function () {
        Route::post('/clock-in',  [ClockInController::class,  'store']);
        Route::post('/clock-out', [ClockOutController::class, 'store']);
    });
  
    Route::prefix('pointage')->group(function () {
        // Lecture — manager et analytics
        Route::prefix('attendances')->group(function () {
            Route::get('/today', [AttendanceController::class, 'today']);
            Route::get('/live',  [AttendanceController::class, 'live']);
            Route::get('/employee/{id}', [AttendanceController::class, 'byEmployee']);
        });
    });
});
