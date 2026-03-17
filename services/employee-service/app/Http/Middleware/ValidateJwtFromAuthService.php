<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class ValidateJwtFromAuthService
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token manquant'], 401);
        }

        try {
            // Validation locale avec firebase/php-jwt
            $key = env('JWT_SECRET');
            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($key, 'HS256'));
            $payload = (array) $decoded;

            // Injecter les infos dans la requête
            $request->merge([
                'auth_user_id'     => $payload['sub'],
                'auth_company_id'  => $payload['company_id'],
                'auth_role'        => $payload['role'],
                'auth_permissions' => $payload['permissions'] ?? [],
            ]);

        } catch (\Exception $e) {
            \Log::error('Validation JWT locale échouée: ' . $e->getMessage());
            return response()->json(['error' => 'Token invalide ou expiré'], 401);
        }

        return $next($request);
    }
}
