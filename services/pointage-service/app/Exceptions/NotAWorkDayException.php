<?php

namespace App\Exceptions;

/**
 * Exception levée quand un pointage est tenté un jour qui n'est pas un jour de travail
 */
class NotAWorkDayException extends BaseApiException
{
    protected int $statusCode = 422; // Unprocessable Entity

    public function __construct(string $message = 'Aujourd\'hui n\'est pas un jour de travail')
    {
        parent::__construct($message);
    }
}
