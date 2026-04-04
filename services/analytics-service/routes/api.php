<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Middleware\ScopeByDepartment;
use App\Http\Middleware\ValidateJwtFromAuthService;
use Illuminate\Support\Facades\Route;

// ── Health check (Docker / load balancer) ────────────────
Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'analytics']));

Route::middleware([
    ValidateJwtFromAuthService::class,
    ScopeByDepartment::class,
])->prefix('analytics')->group(function () {
    Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::get('/presence', [AnalyticsController::class, 'presenceTrend']);
    Route::get('/department-stats', [AnalyticsController::class, 'departmentStats']);
});
