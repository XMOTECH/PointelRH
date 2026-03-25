<?php

namespace App\Services\DTOs;

class Employee
{
    public function __construct(
        public string $id,
        public string $first_name,
        public string $last_name,
        public string $email,
        public string $company_id,
        public string $department_id,
        public ?string $location_id = null,
        public ?string $location_name = null,
        public ?array $schedule = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            first_name: $data['first_name'],
            last_name: $data['last_name'],
            email: $data['email'] ?? '',
            company_id: $data['company_id'] ?? '',
            department_id: $data['department_id'] ?? ($data['department']['id'] ?? ''),
            location_id: $data['location_id'] ?? null,
            location_name: $data['location_name'] ?? null,
            schedule: $data['schedule'] ?? null,
        );
    }
}
