<?php

namespace App\Services\DTOs;

class ClockInData
{
    public function __construct(
        public readonly string $channel,
        public readonly array  $payload,
        public readonly string $companyId,
    ) {}
}
