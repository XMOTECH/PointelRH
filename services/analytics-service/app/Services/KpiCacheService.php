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
            return DailySnapshot::where([
                'company_id'    => $companyId,
                'snapshot_date' => $date,
            ])->get()->map(fn($s) => [
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
                    'date'         => $day->first()->snapshot_date,
                    'presence_rate'=> round($day->avg('presence_rate'), 1),
                    'late_count'   => $day->sum('late_count'),
                    'absent_count' => $day->sum('absent_count'),
                ])->values()->toArray();
        });
    }
}
