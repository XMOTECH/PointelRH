<?php

namespace App\Exceptions;

class ForbiddenException extends BaseApiException
{
    protected int $statusCode = 403;

    public function __construct(string $message = 'Forbidden')
    {
        parent::__construct($message);
    }
}
