<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\KpiCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private readonly KpiCacheService $kpiCache
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        // In a real app, we'd get company_id from JWT
        $companyId = $request->header('X-Company-Id', '00000000-0000-0000-0000-000000000001');
        $date = $request->query('date', now()->toDateString());

        $kpis = $this->kpiCache->getDashboard($companyId, $date);

        $totals = collect($kpis)->pipe(fn($c) => [
            'total_present'    => $c->sum('present'),
            'total_late'       => $c->sum('late'),
            'total_absent'     => $c->sum('absent'),
            'avg_presence_rate'=> round($c->avg('presence_rate'), 1),
        ]);

        return response()->json([
            'date'        => $date,
            'totals'      => $totals,
            'departments' => $kpis,
            'generated_at'=> now()->toIso8601String(),
        ]);
    }

    public function presenceTrend(Request $request): JsonResponse
    {
        $companyId = $request->header('X-Company-Id', '00000000-0000-0000-0000-000000000001');
        $days = (int) str_replace('d', '', $request->query('period', '7d'));
        $days = min(max($days, 1), 90);

        return response()->json([
            'period' => "{$days}d",
            'data'   => $this->kpiCache->getPresenceTrend($companyId, $days),
        ]);
    }
}
