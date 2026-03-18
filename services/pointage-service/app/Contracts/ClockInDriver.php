<?php

namespace App\Contracts;

use App\Services\DTOs\Employee;

interface ClockInDriver
{
    /**
     * Resoudre l'identite de l'employe depuis le payload du canal
     * @throws \App\Exceptions\InvalidTokenException
     */
    public function resolve(array $payload, string $companyId): Employee;

    /**
     * Valider le payload avant la resolution
     */
    public function validate(array $payload): bool;

    /**
     * Nom du canal — pour logging et analytics
     */
    public function channelName(): string;
}
