<?php

namespace App\Exceptions;

/**
 * Exception levée quand un employé tente de pointer alors qu'il a déjà pointé
 */
class AlreadyClockedInException extends BaseApiException
{
    protected int $statusCode = 409; // Conflict

    public function __construct(
        string $message = 'Employé a déjà pointé aujourd\'hui',
        public readonly ?string $employeeId = null,
    ) {
        parent::__construct($message);
    }
}
