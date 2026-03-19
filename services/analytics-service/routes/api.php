<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AnalyticsController;

Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
Route::get('/analytics/presence', [AnalyticsController::class, 'presenceTrend']);
