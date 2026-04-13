<?php

namespace App\Exceptions;

/**
 * Exception levée quand un employé tente de pointer sans planning assigné
 */
class MissingScheduleException extends BaseApiException
{
    protected int $statusCode = 422;

    public function __construct(string $message = 'Aucun planning assigné à cet employé')
    {
        parent::__construct($message);
    }
}
