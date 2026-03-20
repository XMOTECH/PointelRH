<?php

namespace App\Exceptions;

/**
 * Exception levée quand on tente de faire un clock-out sans avoir fait de clock-in
 */
class NotClockedInException extends BaseApiException
{
    protected int $statusCode = 409; // Conflict

    public function __construct(string $message = 'Employé pas pointé pour cette journée')
    {
        parent::__construct($message);
    }
}
