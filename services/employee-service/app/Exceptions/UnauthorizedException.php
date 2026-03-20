<?php

namespace App\Exceptions;

class UnauthorizedException extends BaseApiException
{
    protected int $statusCode = 401;

    public function __construct(string $message = 'Unauthorized')
    {
        parent::__construct($message);
    }
}
