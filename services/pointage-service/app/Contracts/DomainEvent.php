<?php

namespace App\Contracts;

interface DomainEvent
{
    public function routingKey(): string;

    public function toArray(): array;
}
