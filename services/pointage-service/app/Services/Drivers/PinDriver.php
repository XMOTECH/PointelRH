<?php

namespace App\Services\Drivers;

use App\Contracts\ClockInDriver;
use App\Exceptions\InvalidTokenException;
use App\Services\DTOs\Employee;
use Illuminate\Support\Facades\Http;

class PinDriver implements ClockInDriver
{
    public function __construct(
        private readonly string $employeeServiceUrl,
    ) {}

    public function resolve(array $payload, string $companyId): Employee
    {
        $response = Http::timeout(5)
            ->post("{$this->employeeServiceUrl}/employees/resolve-pin", [
                'pin' => $payload['pin_code'] ?? $payload['pin'] ?? null,
                'company_id' => $companyId,
            ]);

        if (! $response->successful()) {
            throw new InvalidTokenException('Code PIN inconnu, invalide ou employé inactif.');
        }

        $resData = $response->json('data');
        $empData = $resData['employee'] ?? null;
        $scheduleData = $resData['schedule'] ?? null;

        if (! $empData) {
            throw new InvalidTokenException('Employé introuvable.');
        }

        return Employee::fromArray([
            'id' => $empData['id'],
            'first_name' => $empData['first_name'] ?? 'Inconnu',
            'last_name' => $empData['last_name'] ?? '',
            'company_id' => $empData['company_id'],
            'department_id' => $empData['department_id'] ?? null,
            'schedule' => $scheduleData ? [
                'id' => $scheduleData['id'],
                'start_time' => $scheduleData['start_time'],
                'end_time' => $scheduleData['end_time'],
                'grace_minutes' => $scheduleData['grace_minutes'],
                'work_days' => $scheduleData['work_days'],
                'timezone' => $scheduleData['timezone'] ?? env('APP_TIMEZONE', 'Africa/Dakar'),
            ] : null,
        ]);
    }

    public function validate(array $payload): bool
    {
        return (isset($payload['pin']) || isset($payload['pin_code'])) &&
               (is_string($payload['pin'] ?? '') || is_string($payload['pin_code'] ?? ''));
    }

    public function channelName(): string
    {
        return 'pin';
    }
}
