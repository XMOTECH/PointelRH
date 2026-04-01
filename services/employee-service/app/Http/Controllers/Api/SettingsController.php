<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get all settings grouped by group.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all();

        $grouped = $settings->groupBy('group')->map(function ($items) {
            return $items->pluck('value', 'key');
        });

        return response()->json([
            'status' => 'success',
            'data' => $grouped,
        ]);
    }

    /**
     * Update multiple settings.
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'group' => 'nullable|string',
        ]);

        foreach ($data['settings'] as $key => $value) {
            Setting::set($key, $value, $data['group'] ?? 'general');
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Paramètres mis à jour avec succès',
        ]);
    }

    /**
     * Get specific group settings.
     */
    public function show(string $group): JsonResponse
    {
        $settings = Setting::where('group', $group)->pluck('value', 'key');

        return response()->json([
            'status' => 'success',
            'data' => $settings,
        ]);
    }
}
