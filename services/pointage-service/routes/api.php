<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClockInController;
use App\Http\Controllers\Api\ClockOutController;
use App\Http\Controllers\Api\AttendanceController;

Route::middleware([\App\Http\Middleware\ValidateJwtFromAuthService::class])->group(function () {
 
    // Pointage
    Route::post('/clock-in',  [ClockInController::class,  'store']);
    Route::post('/clock-out', [ClockOutController::class, 'store']);
 
    // Lecture — manager et analytics
    Route::get('/attendances/today',               [AttendanceController::class, 'today']);
    Route::get('/attendances/live',                [AttendanceController::class, 'live']);
    /*
    Route::get('/attendances/employee/{id}',       [AttendanceController::class, 'byEmployee']);
    Route::get('/attendances/department/{id}',     [AttendanceController::class, 'byDepartment']);
    */
});

