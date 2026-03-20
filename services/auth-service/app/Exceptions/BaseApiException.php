<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception de base pour toutes les exceptions applicatives
 */
abstract class BaseApiException extends Exception
{
    protected int $statusCode = 400;

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function toArray(): array
    {
        return [
            'error' => $this->message,
            'code' => $this->code,
        ];
    }
}
