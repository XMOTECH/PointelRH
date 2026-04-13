<?php

namespace App\Http\Controllers\Api;

use App\Models\Employee;
use App\Models\Shift;
use App\Models\Task;
use App\Models\Mission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimelineController extends BaseApiController
{
    /**
     * Get team timeline (Gantt/Calendar format).
     * GET /api/timeline/team
     */
    public function team(Request $request): JsonResponse
    {
        $start = $request->has('start') ? Carbon::parse($request->start) : now()->startOfWeek();
        $end = $request->has('end') ? Carbon::parse($request->end) : now()->endOfWeek();
        $companyId = $request->auth_company_id;

        $employees = Employee::where('company_id', $companyId)
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->get();

        $conflictService = app(\App\Services\ConflictService::class);

        $data = $employees->map(function ($employee) use ($start, $end, $conflictService) {
            $shifts = Shift::with('mission:id,title')
                ->where('employee_id', $employee->id)
                ->whereBetween('start_at', [$start, $end])
                ->get()
                ->map(fn($s) => [
                    'id' => $s->id,
                    'mission_title' => $s->mission?->title,
                    'start' => $s->start_at->toIso8601String(),
                    'end' => $s->end_at->toIso8601String(),
                    'status' => $s->status,
                    'date' => $s->start_at->toDateString(),
                ]);

            return [
                'employee_id' => $employee->id,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'department_name' => $employee->department?->name,
                'occupancy_rate' => $conflictService->getOccupancyRate($employee->id, $start), // simplified to range start or check logic
                'shifts' => $shifts,
            ];
        });

        return $this->respondSuccess($data);
    }

    /**
     * Get individual employee timeline.
     * GET /api/timeline/employee/{id}
     */
    public function employee(Request $request, string $id): JsonResponse
    {
        $start = $request->has('start') ? Carbon::parse($request->start) : now()->startOfWeek();
        $end = $request->has('end') ? Carbon::parse($request->end) : now()->endOfWeek();
        $companyId = $request->auth_company_id;

        $employee = Employee::where('id', $id)->where('company_id', $companyId)->firstOrFail();

        $shifts = Shift::with('mission:id,title')
            ->where('employee_id', $employee->id)
            ->whereBetween('start_at', [$start, $end])
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'type' => 'shift',
                'title' => $s->mission ? "Mission: " . $s->mission->title : "Shift",
                'start' => $s->start_at->toIso8601String(),
                'end' => $s->end_at->toIso8601String(),
                'status' => $s->status,
                'color' => $s->status === 'pending' ? '#FFA500' : '#4CAF50',
            ]);

        $tasks = Task::where('assigned_to', $employee->id)
            ->whereBetween('due_date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'type' => 'task',
                'title' => $t->title,
                'start' => $t->due_date->toIso8601String(),
                'allDay' => true,
                'priority' => $t->priority,
                'color' => $t->priority === 'high' ? '#F44336' : '#2196F3',
            ]);

        return $this->respondSuccess([
            'employee' => $employee->first_name . ' ' . $employee->last_name,
            'events' => $shifts->concat($tasks),
        ]);
    }

    /**
     * Get individual occupancy status.
     * GET /api/timeline/occupancy
     */
    public function occupancy(Request $request): JsonResponse
    {
        $date = $request->has('date') ? Carbon::parse($request->date) : now();
        $companyId = $request->auth_company_id;
        
        $conflictService = app(\App\Services\ConflictService::class);

        $employees = Employee::where('company_id', $companyId)
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'name' => $e->first_name . ' ' . $e->last_name,
                'occupancy_rate' => $conflictService->getOccupancyRate($e->id, $date),
            ]);

        return $this->respondSuccess($employees);
    }
}
