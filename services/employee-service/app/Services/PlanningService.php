<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\ScheduleOverride;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class PlanningService
{
    /**
     * Resolve the effective daily planning for an employee over a date range.
     */
    public function getEmployeePlanning(string $employeeId, string $startDate, string $endDate): Collection
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $employee = Employee::with('schedule')->findOrFail($employeeId);

        // Fetch all relevant data in bulk
        $overrides = ScheduleOverride::where('employee_id', $employeeId)
            ->whereBetween('date', [$start, $end])
            ->get()
            ->keyBy(fn ($o) => $o->date->format('Y-m-d'));

        $leaves = LeaveRequest::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start, $end])
                    ->orWhereBetween('end_date', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_date', '<=', $start)
                            ->where('end_date', '>=', $end);
                    });
            })
            ->get();

        $planning = collect();
        $current = $start->copy();

        while ($current->lte($end)) {
            $dateStr = $current->format('Y-m-d');
            $dayOfWeek = $current->dayOfWeekIso; // 1 (Mon) to 7 (Sun)

            $dayResult = [
                'date' => $dateStr,
                'status' => 'rest', // default
                'start_time' => null,
                'end_time' => null,
                'type' => 'template',
                'reason' => null,
                'is_override' => false,
            ];

            // 1. Check Overrides (Highest priority)
            if ($overrides->has($dateStr)) {
                $override = $overrides->get($dateStr);
                $dayResult['is_override'] = true;
                $dayResult['type'] = 'override';
                $dayResult['reason'] = $override->reason;

                if ($override->is_off) {
                    $dayResult['status'] = 'off';
                } else {
                    $dayResult['status'] = 'work';
                    $dayResult['start_time'] = $override->start_time;
                    $dayResult['end_time'] = $override->end_time;
                }
            }
            // 2. Check Approved Leaves
            elseif ($this->isDateInLeaves($current, $leaves)) {
                $leave = $this->getLeaveForDate($current, $leaves);
                $dayResult['status'] = 'leave';
                $dayResult['type'] = 'leave';
                $dayResult['reason'] = $leave->leave_type;
            }
            // 3. Fallback to Template
            elseif ($employee->schedule && $employee->schedule->isWorkDay($dayOfWeek)) {
                $dayResult['status'] = 'work';
                $dayResult['start_time'] = $employee->schedule->start_time;
                $dayResult['end_time'] = $employee->schedule->end_time;
            }

            $planning->push($dayResult);
            $current->addDay();
        }

        return $planning;
    }

    private function isDateInLeaves(Carbon $date, Collection $leaves): bool
    {
        return $leaves->contains(fn ($l) => $date->between($l->start_date, $l->end_date));
    }

    private function getLeaveForDate(Carbon $date, Collection $leaves): ?LeaveRequest
    {
        return $leaves->first(fn ($l) => $date->between($l->start_date, $l->end_date));
    }
}
