<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Services\LoggingService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends BaseApiController
{
    /**
     * Récupérer le pointage du jour pour un employé donné
     */
    public function myToday(Request $request)
    {
        try {
            $employeeId = $request->query('employee_id');
            if (! $employeeId) {
                return $this->respondError('employee_id est requis', 422);
            }

            $attendance = Attendance::where('employee_id', $employeeId)
                ->where('work_date', Carbon::today())
                ->first();

            return $this->respondSuccess(
                $attendance ? new AttendanceResource($attendance) : null
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve today status', $e);

            return $this->respondServerError('Impossible de récupérer le statut du jour');
        }
    }

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

            if ($request->has('filter_department_id')) {
                $query->where('department_id', $request->filter_department_id);
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

    /**
     * Récupérer les pointages du jour pour une liste d'employés.
     * GET /pointage/attendances/by-employees?ids=uuid1,uuid2,...
     */
    public function byEmployees(Request $request)
    {
        try {
            $ids = $request->query('ids');
            if (! $ids) {
                return $this->respondError('ids est requis (liste de UUID séparés par des virgules)', 422);
            }

            $employeeIds = explode(',', $ids);

            $date = $request->query('date') ?? Carbon::today()->toDateString();

            $attendances = Attendance::whereIn('employee_id', $employeeIds)
                ->where('work_date', $date)
                ->get();

            return $this->respondSuccess(
                AttendanceResource::collection($attendances)
            );
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve bulk attendance', $e);

            return $this->respondServerError('Impossible de récupérer les pointages');
        }
    }
}
