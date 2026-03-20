<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::prefix('auth')->group(function () {
    // ── Routes publiques ───────────────────────────────────
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/ping', [AuthController::class, 'ping']);
    Route::post('/verify', [AuthController::class, 'verify']); // pour l'API Gateway
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // ── Routes protégées (JWT requis) ──────────────────────
    Route::middleware(['auth:api'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

