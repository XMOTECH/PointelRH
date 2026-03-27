<?php

namespace App\Http\Controllers\Api;

use App\Models\Attendance;
use App\Http\Resources\AttendanceResource;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Services\LoggingService;

class AttendanceController extends BaseApiController
{
    /**
     * Récupérer les pointages d'aujourd'hui pour la compagnie
     */
    public function today(Request $request)
    {
        try {
            $companyId = $request->auth_company_id;
            $locationId = $request->query('location_id');

            $date = $request->query('date') ?? Carbon::today()->toDateString();
            $period = $request->query('period') ?? 'day';

            $startDate = $date;
            $endDate = $date;

            if ($period === 'week') {
                $carbonDate = Carbon::parse($date);
                $startDate = $carbonDate->copy()->startOfWeek()->toDateString();
                $endDate = $carbonDate->copy()->endOfWeek()->toDateString();
            } elseif ($period === 'month') {
                $carbonDate = Carbon::parse($date);
                $startDate = $carbonDate->copy()->startOfMonth()->toDateString();
                $endDate = $carbonDate->copy()->endOfMonth()->toDateString();
            }

            $query = Attendance::where('company_id', $companyId)
                ->whereBetween('work_date', [$startDate, $endDate]);

            if ($locationId) {
                $query->where('location_id', $locationId);
            }

            $attendances = $query->orderBy('checked_in_at', 'desc')->get();

            return $this->respondSuccess(
                AttendanceResource::collection($attendances)
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve today attendances', $e);
            return $this->respondServerError('Impossible de récupérer les pointages');
        }
    }

    /**
     * Alias pour le live feed, avec d'éventuels filtres supplémentaires dans le futur
     */
    public function live(Request $request)
    {
        return $this->today($request);
    }

    /**
     * Récupérer l'historique d'un employé spécifique
     */
    public function byEmployee(Request $request, $id)
    {
        try {
            $attendances = Attendance::where('employee_id', $id)
                ->orderBy('checked_in_at', 'desc')
                ->limit(20)
                ->get();

            return $this->respondSuccess(
                AttendanceResource::collection($attendances)
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve employee history', $e);
            return $this->respondServerError("Impossible de récupérer l'historique");
        }
    }
}
