<?php

namespace App\Services\Drivers;

use App\Contracts\ClockInDriver;
use App\Services\DTOs\Employee;

class PinDriver implements ClockInDriver
{
    public function resolve(array $payload, string $companyId): Employee
    {
        return Employee::fromArray([
            'id' => 'emp-pin-123',
            'first_name' => 'Pin',
            'last_name' => 'User',
            'email' => 'pin@example.com',
            'company_id' => $companyId,
            'department_id' => 'dept-pin-456',
            'schedule' => [
                'start_time' => '09:00:00',
                'grace_minutes' => 15,
                'work_days' => [1, 2, 3, 4, 5],
                'timezone' => 'Africa/Dakar'
            ]
        ]);
    }

    public function validate(array $payload): bool
    {
        return isset($payload['pin']);
    }

    public function channelName(): string
    {
        return 'pin';
    }
}
