<?php

namespace App\Services;

use App\Models\Attendance;
use App\Repositories\AttendanceRepository;
use App\Events\EventPublisher;
use App\Events\EmployeeCheckedOut;
use Carbon\Carbon;
use App\Exceptions\AttendanceNotFoundException;

class ClockOutService
{
    public function __construct(
        private readonly AttendanceRepository $attendances,
        private readonly EventPublisher       $publisher,
    ) {}

    public function clockOut(string $employeeId, string $companyId): Attendance
    {
        $attendance = Attendance::where('employee_id', $employeeId)
            ->where('company_id', $companyId)
            ->where('work_date', Carbon::today())
            ->whereNull('checked_out_at')
            ->first();

        if (!$attendance) {
            throw new AttendanceNotFoundException("Aucun pointage d'entree trouve pour aujourd'hui");
        }

        $now = now();
        $attendance->checked_out_at = $now;

        // Calcul de la durée de travail en minutes
        $workMinutes = (int) $attendance->checked_in_at->diffInMinutes($now);
        $attendance->work_minutes = $workMinutes;

        // Logique simplifiée pour les heures supplémentaires (ex: > 480 min / 8h)
        $standardWorkMinutes = 480; 
        if ($workMinutes > $standardWorkMinutes) {
            $attendance->overtime_minutes = $workMinutes - $standardWorkMinutes;
        }

        $attendance->save();

        // Publier l'événement
        // $this->publisher->publish(new EmployeeCheckedOut($attendance)); 

        return $attendance;
    }
}
