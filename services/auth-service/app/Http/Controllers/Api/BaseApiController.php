<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Contrôleur de base pour toutes les API
 * Fournit des méthodes utilitaires pour les réponses JSON standardisées
 */
abstract class BaseApiController extends Controller
{
    /**
     * Réponse succès
     */
    protected function respondSuccess(mixed $data = null, string $message = null, int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $statusCode);
    }

    /**
     * Réponse erreur
     */
    protected function respondError(string $message, int $statusCode = 400, ?array $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'error' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Réponse erreur de validation
     */
    protected function respondValidationError(array $errors): JsonResponse
    {
        return $this->respondError('Validation failed', 422, $errors);
    }

    /**
     * Réponse non authentifié
     */
    protected function respondUnauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->respondError($message, 401);
    }

    /**
     * Réponse non autorisé
     */
    protected function respondForbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->respondError($message, 403);
    }

    /**
     * Réponse non trouvé
     */
    protected function respondNotFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->respondError($message, 404);
    }

    /**
     * Réponse conflit
     */
    protected function respondConflict(string $message): JsonResponse
    {
        return $this->respondError($message, 409);
    }

    /**
     * Réponse erreur serveur
     */
    protected function respondServerError(string $message = 'Internal server error'): JsonResponse
    {
        return $this->respondError($message, 500);
    }
}
