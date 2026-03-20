<?php

namespace App\Services\DTOs;

/**
 * ScheduleData DTO
 * Transfert de données typé pour la création/mise à jour des horaires
 */
readonly class ScheduleData
{
    public function __construct(
        public string $name,
        public string $companyId,
        public array $workDays,
        public string $startTime,
        public string $endTime,
        public int $graceMinutes = 0,
        public string $timezone = 'Africa/Dakar',
    ) {}
}
