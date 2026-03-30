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

        // Calcul heures sup basé sur le planning (metadata.schedule) ou 480min par défaut
        $standardWorkMinutes = 480;
        $schedule = $attendance->metadata['schedule'] ?? null;
        if ($schedule && isset($schedule['start_time'], $schedule['end_time'])) {
            $start = Carbon::parse($schedule['start_time']);
            $end   = Carbon::parse($schedule['end_time']);
            $standardWorkMinutes = (int) $start->diffInMinutes($end);
        }

        $attendance->overtime_minutes = max(0, $workMinutes - $standardWorkMinutes);

        $attendance->save();

        // Publier l'événement
        $this->publisher->publish(new EmployeeCheckedOut($attendance));

        return $attendance;
    }
}
