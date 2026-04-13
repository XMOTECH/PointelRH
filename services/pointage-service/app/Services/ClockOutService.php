<?php

namespace App\Services;

use App\Events\EmployeeCheckedOut;
use App\Events\EventPublisher;
use App\Exceptions\AttendanceNotFoundException;
use App\Models\Attendance;
use App\Repositories\AttendanceRepository;
use Carbon\Carbon;

class ClockOutService
{
    public function __construct(
        private readonly AttendanceRepository $attendances,
        private readonly EventPublisher $publisher,
    ) {}

    public function clockOut(string $employeeId, string $companyId): Attendance
    {
        $attendance = Attendance::where('employee_id', $employeeId)
            ->where('company_id', $companyId)
            ->where('work_date', Carbon::today())
            ->whereNull('checked_out_at')
            ->first();

        if (! $attendance) {
            throw new AttendanceNotFoundException("Aucun pointage d'entree trouve pour aujourd'hui");
        }

        $now = now();
        $attendance->checked_out_at = $now;

        // Calcul de la duree de travail en minutes
        $workMinutes = (int) $attendance->checked_in_at->diffInMinutes($now);
        $attendance->work_minutes = $workMinutes;

        // Calcul heures sup base sur le planning stocke au clock-in
        $schedule = $attendance->metadata['schedule'] ?? null;
        $standardWorkMinutes = $this->resolveStandardWorkMinutes($schedule);

        $attendance->overtime_minutes = max(0, $workMinutes - $standardWorkMinutes);

        $attendance->save();

        $this->publisher->publish(new EmployeeCheckedOut($attendance));

        return $attendance;
    }

    private function resolveStandardWorkMinutes(?array $schedule): int
    {
        if (! $schedule || empty($schedule['start_time']) || empty($schedule['end_time'])) {
            return 480; // 8h par defaut si aucun schedule (cas legacy)
        }

        $start = Carbon::parse($schedule['start_time']);
        $end = Carbon::parse($schedule['end_time']);

        // Gerer le cas ou end < start (travail de nuit)
        if ($end->lte($start)) {
            $end->addDay();
        }

        return (int) $start->diffInMinutes($end);
    }
}
