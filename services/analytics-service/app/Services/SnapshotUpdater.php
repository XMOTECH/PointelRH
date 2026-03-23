<?php

namespace App\Services;

use App\Models\DailySnapshot;
use App\Models\EmployeeMonthlyStat;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SnapshotUpdater
{
    /**
     * Update daily snapshot based on an attendance event.
     */
    public function updateFromAttendance(array $payload): void
    {
        $event = $payload['event'] ?? 'Unknown';
        $companyId = $payload['company_id'];
        $date = isset($payload['checked_in_at']) ? substr($payload['checked_in_at'], 0, 10) : now()->toDateString();
        
        $departmentId = $payload['department_id'] ?? '00000000-0000-0000-0000-000000000000';

        // Get total employees for this department from our local cache
        $dept = \App\Models\Department::find($departmentId);
        $totalEmployees = $dept ? $dept->employee_count : 0;

        DB::transaction(function () use ($date, $companyId, $departmentId, $payload, $event, $totalEmployees) {
            $snapshot = DailySnapshot::firstOrCreate(
                ['snapshot_date' => $date, 'company_id' => $companyId, 'department_id' => $departmentId]
            );

            // Update total employees for the snapshot
            $snapshot->total_employees = $totalEmployees;

            if ($event === 'EmployeeCheckedIn') {
                $snapshot->increment('present_count');
            }

            if (($payload['late_minutes'] ?? 0) > 0) {
                // Increment if not already counted as late by another event
                $snapshot->increment('late_count');
                $snapshot->increment('total_late_minutes', $payload['late_minutes']);
            }

            // Update absence count and rates
            $totalPresent = $snapshot->present_count;
            $snapshot->absent_count = max(0, $totalEmployees - $totalPresent);

            if ($totalEmployees > 0) {
                $snapshot->presence_rate = ($totalPresent / $totalEmployees) * 100;
            }

            if ($totalPresent > 0) {
                $snapshot->punctuality_rate = (1 - ($snapshot->late_count / $totalPresent)) * 100;
            }

            $snapshot->last_updated_at = now();
            $snapshot->save();
        });

        $this->updateMonthlyStats($payload, $event, $date);
    }

    /**
     * Update total employees count for today's snapshot (used when syncing employees).
     */
    public function updateSnapshotBaseCount(string $departmentId, string $companyId, int $totalEmployees): void
    {
        $date = now()->toDateString();
        
        $snapshot = DailySnapshot::where([
            'snapshot_date' => $date,
            'company_id'    => $companyId,
            'department_id' => $departmentId,
        ])->first();

        $presentCount = $snapshot ? $snapshot->present_count : 0;

        DailySnapshot::updateOrCreate(
            ['snapshot_date' => $date, 'company_id' => $companyId, 'department_id' => $departmentId],
            [
                'total_employees' => $totalEmployees,
                'absent_count' => max(0, $totalEmployees - $presentCount),
                'presence_rate' => $totalEmployees > 0 ? ($presentCount / $totalEmployees) * 100 : 0,
                'last_updated_at' => now(),
            ]
        );
    }

    private function updateMonthlyStats(array $payload, string $event, string $dateStr): void
    {
        $date = new \DateTime($dateStr);
        $month = (int) $date->format('m');
        $year = (int) $date->format('Y');
        $employeeId = $payload['employee_id'];
        $companyId = $payload['company_id'];

        $stat = EmployeeMonthlyStat::firstOrCreate(
            ['employee_id' => $employeeId, 'month' => $month, 'year' => $year, 'company_id' => $companyId]
        );

        if ($event === 'EmployeeCheckedIn') {
            $stat->increment('present_days');
        }

        if (($payload['late_minutes'] ?? 0) > 0) {
            $stat->increment('late_days');
            $stat->increment('total_late_minutes', $payload['late_minutes']);
        }
    }
}
