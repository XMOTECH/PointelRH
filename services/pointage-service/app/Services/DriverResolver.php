<?php

namespace App\Services;

use App\Contracts\ClockInDriver;
use App\Exceptions\ChannelNotSupportedException;

class DriverResolver
{
    private array $drivers = [];

    public function register(string $channel, ClockInDriver $driver): void
    {
        $this->drivers[$channel] = $driver;
    }

    public function resolve(string $channel): ClockInDriver
    {
        if (!isset($this->drivers[$channel])) {
            throw new ChannelNotSupportedException(
                "Canal '$channel' non supporte. Disponibles: " . implode(', ', array_keys($this->drivers))
            );
        }
        return $this->drivers[$channel];
    }
}
