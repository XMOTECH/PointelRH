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

            $attendances = Attendance::where('company_id', $companyId)
                ->where('work_date', Carbon::today())
                ->orderBy('checked_in_at', 'desc')
                ->get();

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
}
