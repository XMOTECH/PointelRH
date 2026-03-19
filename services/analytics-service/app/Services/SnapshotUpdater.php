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
        
        // We need department_id for snapshots. If missing, we might need to resolve it.
        $departmentId = $payload['department_id'] ?? '00000000-0000-0000-0000-000000000000';

        DB::transaction(function () use ($date, $companyId, $departmentId, $payload, $event) {
            $snapshot = DailySnapshot::firstOrCreate(
                ['snapshot_date' => $date, 'company_id' => $companyId, 'department_id' => $departmentId]
            );

            if ($event === 'EmployeeCheckedIn') {
                $snapshot->increment('present_count');
            }

            if (($payload['late_minutes'] ?? 0) > 0) {
                // Increment if not already counted as late by another event
                $snapshot->increment('late_count');
                $snapshot->increment('total_late_minutes', $payload['late_minutes']);
            }

            // Update punctuality rate
            $totalPresent = $snapshot->present_count;
            if ($totalPresent > 0) {
                $snapshot->punctuality_rate = (1 - ($snapshot->late_count / $totalPresent)) * 100;
            }

            $snapshot->last_updated_at = now();
            $snapshot->save();
        });

        $this->updateMonthlyStats($payload, $event, $date);
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
