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
            department_id: $data['department_id'],
            schedule: $data['schedule'] ?? null,
        );
    }
}
