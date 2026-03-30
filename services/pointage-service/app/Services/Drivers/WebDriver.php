<?php

namespace App\Services\Drivers;

use App\Contracts\ClockInDriver;
use App\Services\DTOs\Employee;
use App\Exceptions\InvalidTokenException;
use Illuminate\Support\Facades\Http;

class WebDriver implements ClockInDriver
{
    public function __construct(
        private readonly string $employeeServiceUrl,
    ) {}

    public function validate(array $payload): bool
    {
        return !empty($payload['user_id']) && is_string($payload['user_id']);
    }

    public function resolve(array $payload, string $companyId): Employee
    {
        // On résout l'employé via son user_id (authentifié sur le web)
        $response = Http::timeout(5)
            ->get("{$this->employeeServiceUrl}/employees/by-user/" . ($payload['user_id'] ?? 'none'));

        if (!$response->successful()) {
            throw new InvalidTokenException("Aucun employé lié à cet utilisateur ou service indisponible.");
        }

        $empData = $response->json('data');
        if (!$empData) {
            throw new InvalidTokenException("Données d'employé introuvables.");
        }

        if (($empData['status'] ?? 'active') !== 'active') {
            throw new \RuntimeException("Votre profil employé est désactivé.");
        }

        // Note: Sur le web, l'utilisateur est déjà dans sa session, 
        // on vérifie quand même la cohérence de l'entreprise si nécessaire.
        if (($empData['company_id'] ?? null) !== $companyId) {
            throw new InvalidTokenException("Incohérence d'entreprise détectée.");
        }

        $scheduleData = $empData['schedule'] ?? null;

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

    public function channelName(): string { return 'web'; }
}
