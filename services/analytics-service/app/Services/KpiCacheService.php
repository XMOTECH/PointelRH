<?php

namespace App\Services;

use App\Models\DailySnapshot;
use Illuminate\Support\Facades\Cache;

class KpiCacheService
{
    private const TTL = 300; // 5 minutes

    public function getDashboard(string $companyId, string $date): array
    {
        $cacheKey = "kpi:dashboard:{$companyId}:{$date}";

        return Cache::remember($cacheKey, self::TTL, function () use ($companyId, $date) {
            $snapshots = DailySnapshot::where([
                'company_id'    => $companyId,
                'snapshot_date' => $date,
            ])->get();

            // If no snapshots exist for today, lazy-initialize them from Departments
            if ($snapshots->isEmpty() && $date === now()->toDateString()) {
                $departments = \App\Models\Department::where('company_id', $companyId)->get();
                
                foreach ($departments as $dept) {
                    DailySnapshot::create([
                        'snapshot_date' => $date,
                        'company_id'    => $companyId,
                        'department_id' => $dept->id,
                        'total_employees' => $dept->employee_count,
                        'present_count'  => 0,
                        'late_count'     => 0,
                        'absent_count'   => $dept->employee_count,
                        'presence_rate'  => 0,
                        'punctuality_rate' => 0,
                        'last_updated_at' => now(),
                    ]);
                }

                // Refresh snapshots after creation
                $snapshots = DailySnapshot::where([
                    'company_id'    => $companyId,
                    'snapshot_date' => $date,
                ])->get();
            }

            return $snapshots->map(fn($s) => [
                'department_id'   => $s->department_id,
                'total_employees' => $s->total_employees,
                'present'         => $s->present_count,
                'late'            => $s->late_count,
                'absent'          => $s->absent_count,
                'presence_rate'   => $s->presence_rate,
                'punctuality_rate'=> $s->punctuality_rate,
            ])->toArray();
        });
    }

    public function invalidate(string $companyId, string $date): void
    {
        Cache::forget("kpi:dashboard:{$companyId}:{$date}");
    }

    public function getPresenceTrend(string $companyId, int $days = 7): array
    {
        $cacheKey = "kpi:trend:{$companyId}:{$days}d";

        return Cache::remember($cacheKey, 600, function () use ($companyId, $days) {
            return DailySnapshot::where('company_id', $companyId)
                ->where('snapshot_date', '>=', now()->subDays($days)->toDateString())
                ->orderBy('snapshot_date')
                ->get()
                ->groupBy('snapshot_date')
                ->map(fn($day) => [
                    'date'            => $day->first()->snapshot_date,
                    'presence_rate'   => round($day->avg('presence_rate'), 1),
                    'total_employees' => (int) $day->sum('total_employees'),
                    'present_count'   => (int) $day->sum('present_count'),
                    'late_count'      => (int) $day->sum('late_count'),
                    'absent_count'    => (int) $day->sum('absent_count'),
                ])->values()->toArray();
        });
    }
}
