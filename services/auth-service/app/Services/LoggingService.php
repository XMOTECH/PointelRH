<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Service centralisé pour les logs applicatifs
 * Évite les logs de debug dispersés dans le code
 */
class LoggingService
{
    /**
     * Log une action métier importante en production
     */
    public static function info(string $message, array $context = []): void
    {
        Log::info($message, $context);
    }

    /**
     * Log une erreur de traitement
     */
    public static function error(string $message, ?\Throwable $exception = null, array $context = []): void
    {
        if ($exception) {
            $context['exception'] = $exception->getMessage();
            $context['stack_trace'] = $exception->getTraceAsString();
        }

        Log::error($message, $context);
    }

    /**
     * Log un avertissement (accès refusé, données invalides, etc.)
     */
    public static function warning(string $message, array $context = []): void
    {
        Log::warning($message, $context);
    }
}
