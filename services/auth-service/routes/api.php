<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ── Health check (Docker / load balancer) ────────────────
Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'auth']));

Route::prefix('auth')->group(function () {
    // ── Routes publiques ───────────────────────────────────
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::get('/ping', [AuthController::class, 'ping']);
    Route::post('/verify', [AuthController::class, 'verify']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // ── Routes protégées (JWT requis) ──────────────────────
    Route::middleware(['auth:api'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/users', [UserController::class, 'store']);

        // ── Administration Plateforme (Super Admin uniquement) ──
        Route::middleware(['super_admin'])->prefix('admin')->group(function () {
            Route::get('/stats', [CompanyController::class, 'stats']);
            Route::get('/companies', [CompanyController::class, 'index']);
            Route::post('/companies', [CompanyController::class, 'store']);
            Route::patch('/companies/{id}/status', [CompanyController::class, 'toggleStatus']);
        });
    });
});
