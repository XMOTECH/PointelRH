<?php

namespace App\Services\Drivers;

use App\Contracts\ClockInDriver;
use App\Services\DTOs\Employee;
use App\Exceptions\InvalidTokenException;
use Illuminate\Support\Facades\Http;

class QrDriver implements ClockInDriver
{
    public function __construct(
        private readonly string $employeeServiceUrl,
    ) {}

    public function validate(array $payload): bool
    {
        return !empty($payload['qr_token']) && is_string($payload['qr_token']);
    }

    public function resolve(array $payload, string $companyId): Employee
    {
        // Appel HTTP vers le service employee pour récupérer l'employé ET son planning complet (requis pour le pointage)
        $response = Http::timeout(5)
            ->post("{$this->employeeServiceUrl}/employees/resolve-qr", [
                'qr_token' => $payload['qr_token']
            ]);

        if (!$response->successful()) {
            throw new InvalidTokenException("QR token inconnu, invalide ou employé inactif.");
        }

        $resData = $response->json('data');
        $empData = $resData['employee'] ?? null;
        $scheduleData = $resData['schedule'] ?? null;

        if (!$empData) {
            throw new InvalidTokenException("Employé introuvable.");
        }

        if (($empData['status'] ?? 'active') !== 'active') {
            throw new \RuntimeException("Cet employé est désactivé.");
        }

        if (($empData['company_id'] ?? null) !== $companyId) {
            throw new InvalidTokenException("Ce QR Code n'appartient pas à cette entreprise.");
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
                'timezone' => $scheduleData['timezone'] ?? env('APP_TIMEZONE', 'Africa/Dakar')
            ] : null,
        ]);
    }

    public function channelName(): string { return 'qr'; }
}
