<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\Shift;
use App\Models\Task;
use App\Models\Mission;
use Carbon\Carbon;

class ConflictService
{
    /**
     * Check for any temporal overlaps for an employee.
     */
    public function checkOverlap(string $employeeId, string|Carbon $start, string|Carbon $end, ?string $excludeShiftId = null): array
    {
        $start = Carbon::parse($start);
        $end = Carbon::parse($end);
        $conflicts = [];

        // Check against other shifts
        $overlappingShifts = Shift::where('employee_id', $employeeId)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_at', [$start, $end])
                    ->orWhereBetween('end_at', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_at', '<=', $start)
                          ->where('end_at', '>=', $end);
                    });
            });

        if ($excludeShiftId) {
            $overlappingShifts->where('id', '!=', $excludeShiftId);
        }

        foreach ($overlappingShifts->get() as $shift) {
            $conflicts[] = [
                'type' => 'shift',
                'id' => $shift->id,
                'title' => 'Conflit avec un autre créneau',
                'start' => $shift->start_at->toIso8601String(),
                'end' => $shift->end_at->toIso8601String(),
            ];
        }

        // Check against missions (approximate by dates if no precise time)
        // Note: Currently missions only have dates. We assume they take the whole day if no shifts are defined.
        $overlappingMissions = Mission::whereHas('employees', function($q) use ($employeeId) {
            $q->where('employee_id', $employeeId);
        })
        ->where(function ($query) use ($start, $end) {
            $query->whereBetween('start_date', [$start->toDateString(), $end->toDateString()])
                  ->orWhereBetween('end_date', [$start->toDateString(), $end->toDateString()]);
        })->get();

        foreach ($overlappingMissions as $mission) {
            $conflicts[] = [
                'type' => 'mission',
                'id' => $mission->id,
                'title' => 'En mission : ' . $mission->title,
                'start' => $mission->start_date->toIso8601String(),
                'end' => $mission->end_date ? $mission->end_date->toIso8601String() : null,
            ];
        }

        // Check against approved/pending leaves
        $leaveConflicts = $this->checkLeaveConflicts($employeeId, $start, $end);
        $conflicts = array_merge($conflicts, $leaveConflicts);

        return $conflicts;
    }

    /**
     * Check for leave conflicts for an employee on a date range.
     */
    public function checkLeaveConflicts(string $employeeId, string|Carbon $start, string|Carbon $end): array
    {
        $start = Carbon::parse($start);
        $end = Carbon::parse($end);
        $conflicts = [];

        $overlappingLeaves = LeaveRequest::where('employee_id', $employeeId)
            ->whereIn('status', ['approved', 'pending'])
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start->toDateString(), $end->toDateString()])
                    ->orWhereBetween('end_date', [$start->toDateString(), $end->toDateString()])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_date', '<=', $start->toDateString())
                            ->where('end_date', '>=', $end->toDateString());
                    });
            })
            ->get();

        foreach ($overlappingLeaves as $leave) {
            $typeName = $leave->leaveType?->name ?? $leave->leave_type;
            $conflicts[] = [
                'type' => 'leave',
                'id' => $leave->id,
                'title' => "En congé : {$typeName}",
                'start' => $leave->start_date->toIso8601String(),
                'end' => $leave->end_date->toIso8601String(),
                'status' => $leave->status,
            ];
        }

        return $conflicts;
    }

    /**
     * Get occupancy rate (%) for an employee on a given date.
     */
    public function getOccupancyRate(string $employeeId, string|Carbon $date): float
    {
        $date = Carbon::parse($date);
        
        // Total shift minutes
        $shiftMinutes = Shift::where('employee_id', $employeeId)
            ->whereDate('start_at', $date)
            ->get()
            ->sum(fn($s) => $s->start_at->diffInMinutes($s->end_at));

        if ($shiftMinutes === 0) return 0;

        // Total estimated task minutes for that day
        $taskMinutes = Task::where('assigned_to', $employeeId)
            ->whereDate('due_date', $date)
            ->sum('estimated_minutes');

        return round(($taskMinutes / $shiftMinutes) * 100, 2);
    }
}
