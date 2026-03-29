<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AnalyticsController;

use App\Http\Middleware\ValidateJwtFromAuthService;

Route::middleware([
    ValidateJwtFromAuthService::class,
    \App\Http\Middleware\ScopeByDepartment::class
])->prefix('analytics')->group(function () {
    Route::get('/dashboard', [AnalyticsController::class , 'dashboard']);
    Route::get('/presence', [AnalyticsController::class , 'presenceTrend']);
    Route::get('/department-stats', [AnalyticsController::class , 'departmentStats']);
});
