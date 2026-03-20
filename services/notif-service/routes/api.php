<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotificationController;

Route::get('/notifications', [NotificationController::class, 'index']);
