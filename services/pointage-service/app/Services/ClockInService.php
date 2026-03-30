<?php

namespace App\Services;

use App\Services\DTOs\ClockInData;
use App\Models\Attendance;
use App\Domain\LateMatcher;
use App\Repositories\AttendanceRepository;
use App\Exceptions\AlreadyClockedInException;
use App\Exceptions\NotAWorkDayException;
use App\Enums\AttendanceStatus;
use App\Events\EventPublisher;
use App\Events\EmployeeCheckedIn;
use App\Events\LateArrivalDetected;
use Illuminate\Support\Str;

class ClockInService
{
    public function __construct(
        private readonly DriverResolver       $driverResolver,
        private readonly AttendanceRepository $attendances,
        private readonly EventPublisher       $publisher,
    ) {}
 
    public function clockIn(ClockInData $data): Attendance
    {
        // Etape 1 — Resoudre l'employe via le bon driver
        $driver   = $this->driverResolver->resolve($data->channel);
        $employee = $driver->resolve($data->payload, $data->companyId);
 
        // Etape 2 — Verifier l'unicite du pointage
        if ($this->attendances->existsForToday($employee->id)) {
            throw new AlreadyClockedInException(
                "{$employee->first_name} {$employee->last_name} a deja pointe aujourd'hui",
                $employee->id,
            );
        }
 
        // Etape 3 — Verifier le jour de travail
        if (!LateMatcher::isWorkDay(now(), $employee->schedule['work_days'])) {
            throw new NotAWorkDayException("Aujourd'hui n'est pas un jour de travail");
        }
 
        // Etape 4 — Calculer le retard (domaine pur)
        $lateMinutes = LateMatcher::calculate(
            clockIn:      now(),
            startTime:    $employee->schedule['start_time'],
            graceMinutes: $employee->schedule['grace_minutes'],
            timezone:     $employee->schedule['timezone'],
        );

        // Etape 4.5 — Verifier le géo-fencing (si coordonnées fournies)
        $isWithinZone = true;
        if ($data->latitude && $data->longitude && $employee->location_id) {
            $location = \App\Models\Location::find($employee->location_id);
            if ($location) {
                $isWithinZone = \App\Domain\GeofencingService::isWithinZone(
                    $data->latitude,
                    $data->longitude,
                    $location->latitude,
                    $location->longitude,
                    $location->radius_meters
                );
            }
        }

        // Etape 5 — Persister
        $attendance = $this->attendances->create([
            'id'            => (string) Str::uuid(),
            'employee_id'   => $employee->id,
            'employee_name' => trim($employee->first_name . ' ' . $employee->last_name),
            'company_id'    => $employee->company_id, // Utiliser la company_id renvoyée par l'employé
            'department_id' => $employee->department_id,
            'location_id'   => $employee->location_id,
            'location_name' => $employee->location_name,
            'channel'       => $data->channel,
            'checked_in_at' => now(),
            'work_date'     => today(),
            'late_minutes'  => $lateMinutes,
            'status'        => $isWithinZone 
                               ? ($lateMinutes > 0 ? AttendanceStatus::LATE : AttendanceStatus::PRESENT)
                               : AttendanceStatus::BAD_LOCATION, // Need to add this enum?
            'metadata'      => [
                'latitude' => $data->latitude,
                'longitude' => $data->longitude,
                'is_within_zone' => $isWithinZone,
            ]
        ]);
 
        // Etape 6 — Publier evenements RabbitMQ
        $this->publisher->publish(new EmployeeCheckedIn($attendance, $employee));
        if ($lateMinutes > 0) {
            $this->publisher->publish(new LateArrivalDetected($attendance, $employee, $lateMinutes));
        }
 
        return $attendance;
    }
}
