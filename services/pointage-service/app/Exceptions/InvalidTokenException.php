<?php

namespace App\Exceptions;

/**
 * Exception levée quand un QR token est invalide ou expiré
 */
class InvalidTokenException extends BaseApiException
{
    protected int $statusCode = 404; // Not Found

    public function __construct(string $message = 'QR token invalide ou expiré')
    {
        parent::__construct($message);
    }
}
