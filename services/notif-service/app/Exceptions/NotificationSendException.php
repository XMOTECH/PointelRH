<?php

namespace App\Exceptions;

class NotificationSendException extends BaseApiException
{
    protected int $statusCode = 500;

    public function __construct(string $message = 'Failed to send notification')
    {
        parent::__construct($message);
    }
}
