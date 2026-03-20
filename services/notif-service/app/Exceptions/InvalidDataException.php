<?php

namespace App\Exceptions;

class InvalidDataException extends BaseApiException
{
    protected int $statusCode = 422;

    public function __construct(string $message = 'Invalid data provided')
    {
        parent::__construct($message);
    }
}
