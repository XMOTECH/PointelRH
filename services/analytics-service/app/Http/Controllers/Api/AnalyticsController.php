<?php

namespace App\Http\Controllers\Api;

use App\Services\KpiCacheService;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * AnalyticsController
 * Gère les requêtes d'analytics et de dashboard
 * 
 * Responsabilités:
 * - Valider les entrées
 * - Appeler les services métier
 * - Retourner les réponses formatées
 * - Tracer les opérations
 */
class AnalyticsController extends BaseApiController
{
    public function __construct(
        private readonly KpiCacheService $kpiCache
    ) {}

    /**
     * Récupérer le dashboard d'analytics
     * Inclut les KPIs du jour par département
     * 
     * GET /api/analytics/dashboard?date=2026-03-20
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'date' => 'nullable|date_format:Y-m-d',
            ]);

            // In a real app, we'd get company_id from JWT
            $companyId = $request->header('X-Company-Id', '00000000-0000-0000-0000-000000000001');
            $date = $validated['date'] ?? now()->toDateString();

            LoggingService::info('Dashboard retrieved', [
                'company_id' => $companyId,
                'date' => $date,
            ]);

            $kpis = $this->kpiCache->getDashboard($companyId, $date);

            if (empty($kpis)) {
                LoggingService::warning('No KPI data available for dashboard', [
                    'company_id' => $companyId,
                    'date' => $date,
                ]);
                return $this->respondSuccess([
                    'date'        => $date,
                    'totals'      => [
                        'total_present'     => 0,
                        'total_late'        => 0,
                        'total_absent'      => 0,
                        'avg_presence_rate' => 0,
                    ],
                    'departments' => [],
                    'generated_at'=> now()->toIso8601String(),
                ]);
            }

            $totals = collect($kpis)->pipe(fn($c) => [
                'total_present'     => $c->sum('present'),
                'total_late'        => $c->sum('late'),
                'total_absent'      => $c->sum('absent'),
                'avg_presence_rate' => round($c->avg('presence_rate'), 1),
            ]);

            return $this->respondSuccess([
                'date'        => $date,
                'totals'      => $totals,
                'departments' => $kpis,
                'generated_at'=> now()->toIso8601String(),
            ]);
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when retrieving dashboard', ['errors' => $e->errors()]);
            return $this->respondValidationError($e->errors());
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve dashboard', $e);
            return $this->respondServerError('Impossible de récupérer le dashboard');
        }
    }

    /**
     * Récupérer la tendance de présence
     * Affiche les données de présence sur une période donnée
     * 
     * GET /api/analytics/presence-trend?period=7d
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function presenceTrend(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'period' => 'nullable|string|regex:/^\d+d$/',
            ]);

            $companyId = $request->header('X-Company-Id', '00000000-0000-0000-0000-000000000001');
            $periodStr = $validated['period'] ?? '7d';
            $days = (int) str_replace('d', '', $periodStr);
            $days = min(max($days, 1), 90);

            LoggingService::info('Presence trend retrieved', [
                'company_id' => $companyId,
                'period_days' => $days,
            ]);

            $data = $this->kpiCache->getPresenceTrend($companyId, $days);

            if (empty($data)) {
                LoggingService::warning('No presence trend data available', [
                    'company_id' => $companyId,
                    'period_days' => $days,
                ]);
                return $this->respondSuccess([
                    'period' => "{$days}d",
                    'data'   => [],
                ]);
            }

            return $this->respondSuccess([
                'period' => "{$days}d",
                'data'   => $data,
            ]);
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when retrieving presence trend', ['errors' => $e->errors()]);
            return $this->respondValidationError($e->errors());
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve presence trend', $e);
            return $this->respondServerError('Impossible de récupérer la tendance de présence');
        }
    }

    /**
     * Récupérer les statistiques par département
     * GET /api/analytics/department-stats?department_id=uuid&date=2026-03-20
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function departmentStats(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'department_id' => 'nullable|uuid',
                'date' => 'nullable|date_format:Y-m-d',
            ]);

            $companyId = $request->header('X-Company-Id', '00000000-0000-0000-0000-000000000001');
            $departmentId = $validated['department_id'] ?? null;
            $date = $validated['date'] ?? now()->toDateString();

            LoggingService::info('Department stats retrieved', [
                'company_id' => $companyId,
                'department_id' => $departmentId,
                'date' => $date,
            ]);

            $kpis = $this->kpiCache->getDashboard($companyId, $date);

            if ($departmentId) {
                $departmentData = collect($kpis)->firstWhere('department_id', $departmentId);
                if (!$departmentData) {
                    LoggingService::warning('Department not found in KPIs', [
                        'company_id' => $companyId,
                        'department_id' => $departmentId,
                    ]);
                    return $this->respondNotFound('Department stats not found');
                }
                $kpis = [$departmentData];
            }

            return $this->respondSuccess($kpis);
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when retrieving department stats', ['errors' => $e->errors()]);
            return $this->respondValidationError($e->errors());
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve department stats', $e);
            return $this->respondServerError('Impossible de récupérer les statistiques du département');
        }
    }
}
