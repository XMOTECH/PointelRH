<?php

namespace App\Exceptions;

/**
 * Exception levée quand un enregistrement de pointage n'est pas trouvé
 */
class AttendanceNotFoundException extends BaseApiException
{
    protected int $statusCode = 404; // Not Found

    public function __construct(string $message = 'Enregistrement de pointage non trouvé')
    {
        parent::__construct($message);
    }
}
