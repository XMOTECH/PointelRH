<?php

namespace App\Exceptions;

class ResourceNotFoundException extends BaseApiException
{
    protected int $statusCode = 404;

    public function __construct(string $resource = 'Resource')
    {
        parent::__construct("{$resource} not found");
    }
}
