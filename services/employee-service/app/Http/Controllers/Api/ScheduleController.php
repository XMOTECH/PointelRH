<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $schedules = Schedule::where('company_id', $request->auth_company_id)->get();
        return response()->json($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'work_days' => 'required|array',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'grace_minutes' => 'integer|min:0',
            'timezone' => 'string|max:100',
        ]);

        $data['company_id'] = $request->auth_company_id;
        $schedule = Schedule::create($data);

        return response()->json($schedule, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $schedule = Schedule::where('company_id', $request->auth_company_id)->findOrFail($id);
        return response()->json($schedule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $schedule = Schedule::where('company_id', $request->auth_company_id)->findOrFail($id);
        
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'work_days' => 'sometimes|array',
            'start_time' => 'sometimes|date_format:H:i:s',
            'end_time' => 'sometimes|date_format:H:i:s',
            'grace_minutes' => 'sometimes|integer|min:0',
            'timezone' => 'sometimes|string|max:100',
        ]);

        $schedule->update($data);
        return response()->json($schedule);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $schedule = Schedule::where('company_id', $request->auth_company_id)->findOrFail($id);
        $schedule->delete();
        return response()->json(null, 204);
    }
}
