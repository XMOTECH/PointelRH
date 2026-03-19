<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/notifications', function () {
    return response()->json(['data' => []]);
});
