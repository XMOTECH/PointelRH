<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AnalyticsController;

use App\Http\Middleware\ValidateJwtFromAuthService;

Route::middleware([ValidateJwtFromAuthService::class])->group(function () {
    Route::get('/api/analytics/dashboard', [AnalyticsController::class , 'dashboard']);
    Route::get('/api/analytics/presence', [AnalyticsController::class , 'presenceTrend']);
    Route::get('/api/analytics/department-stats', [AnalyticsController::class , 'departmentStats']);
});
