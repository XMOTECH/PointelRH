<?php

namespace App\Exceptions;

class ConflictException extends BaseApiException
{
    protected int $statusCode = 409;

    public function __construct(string $message = 'Conflict')
    {
        parent::__construct($message);
    }
}
