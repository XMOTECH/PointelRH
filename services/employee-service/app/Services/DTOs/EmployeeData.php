<?php

namespace App\Services\DTOs;

/**
 * EmployeeData DTO
 * Transfert de données typé pour la création/mise à jour des employés
 */
class EmployeeData
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public string $email,
        public string $phone,
        public string $companyId,
        public string $departmentId,
        public string $status = 'active',
        public string $contractType = 'full-time',
        public ?string $jobTitle = null,
        public ?string $hireDate = null,
        public ?string $managerId = null,
    ) {}
}
