<?php

namespace App\Services\Drivers;

use App\Contracts\ClockInDriver;
use App\Exceptions\InvalidTokenException;
use App\Services\DTOs\Employee;
use Illuminate\Support\Facades\Http;

class FaceDriver implements ClockInDriver
{
    public function __construct(
        private readonly string $employeeServiceUrl,
    ) {}

    public function validate(array $payload): bool
    {
        return ! empty($payload['descriptor'])
            && is_array($payload['descriptor'])
            && count($payload['descriptor']) === 128;
    }

    public function resolve(array $payload, string $companyId): Employee
    {
        $response = Http::timeout(10)
            ->post("{$this->employeeServiceUrl}/employees/resolve-face", [
                'descriptor' => $payload['descriptor'],
                'company_id' => $companyId,
            ]);

        if (! $response->successful()) {
            throw new InvalidTokenException('Visage non reconnu ou aucune donnée faciale enregistrée.');
        }

        $resData = $response->json('data');
        $empData = $resData['employee'] ?? null;
        $scheduleData = $resData['schedule'] ?? null;

        if (! $empData) {
            throw new InvalidTokenException('Employé introuvable.');
        }

        if (($empData['status'] ?? 'active') !== 'active') {
            throw new \RuntimeException('Cet employé est désactivé.');
        }

        if (($empData['company_id'] ?? null) !== $companyId) {
            throw new InvalidTokenException("Ce visage n'appartient pas à cette entreprise.");
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
                'grace_minutes' => $scheduleData['grace_minutes'],
                'work_days' => $scheduleData['work_days'],
                'timezone' => $scheduleData['timezone'] ?? env('APP_TIMEZONE', 'Africa/Dakar'),
            ] : null,
        ]);
    }

    public function channelName(): string
    {
        return 'face';
    }
}
