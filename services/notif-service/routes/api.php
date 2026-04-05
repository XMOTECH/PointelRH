<?php

use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

// ── Health check (Docker / load balancer) ────────────────
Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'notif']));

// ── Routes protégées par JWT ──────────────────────────────
Route::middleware(['auth.jwt'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
});
