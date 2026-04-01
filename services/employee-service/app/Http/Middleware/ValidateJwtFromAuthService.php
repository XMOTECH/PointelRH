<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateJwtFromAuthService
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['error' => 'Token manquant'], 401);
        }

        try {
            // Validation locale avec firebase/php-jwt
            $key = config('services.auth.jwt_secret');
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            $payload = (array) $decoded;

            // Injecter les infos dans la requête
            $request->merge([
                'auth_user_id' => $payload['sub'],
                'auth_company_id' => $payload['company_id'],
                'auth_department_id' => $payload['department_id'] ?? null,
                'auth_role' => $payload['role'],
                'auth_permissions' => $payload['permissions'] ?? [],
            ]);

        } catch (\Exception $e) {
            \Log::error('Validation JWT locale échouée: '.$e->getMessage());

            return response()->json(['error' => 'Token invalide ou expiré'], 401);
        }

        return $next($request);
    }
}
