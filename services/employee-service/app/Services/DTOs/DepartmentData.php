<?php

namespace App\Services\DTOs;

/**
 * DepartmentData DTO
 * Transfert de données typé pour la création/mise à jour des départements
 */
readonly class DepartmentData
{
    public function __construct(
        public string $name,
        public string $companyId,
        public ?string $managerId = null,
        public ?string $parentId = null,
        public ?string $location = null,
    ) {}
}
