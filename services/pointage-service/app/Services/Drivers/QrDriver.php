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
        $response = Http::withHeaders(['X-Company-ID' => $companyId])
            ->timeout(3)
            ->post("{$this->employeeServiceUrl}/employees/resolve-qr", [
                'qr_token' => $payload['qr_token'],
            ]);

        if ($response->status() === 404) {
            throw new InvalidTokenException("QR token inconnu");
        }

        if (!$response->successful()) {
            throw new \RuntimeException("Employee Service indisponible");
        }

        return Employee::fromArray($response->json('employee'));
    }

    public function channelName(): string { return 'qr'; }
}
