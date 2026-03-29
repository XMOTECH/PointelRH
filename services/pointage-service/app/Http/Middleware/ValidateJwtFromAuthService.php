<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateJwtFromAuthService
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return $next($request);
        }

        try {
            $key = config('services.auth.jwt_secret');
            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($key, 'HS256'));
            $payload = (array) $decoded;

            $request->merge([
                'auth_user_id'     => $payload['sub'],
                'auth_company_id'  => $payload['company_id'],
                'auth_department_id' => $payload['department_id'] ?? null,
                'auth_role'        => $payload['role'],
                'auth_permissions' => $payload['permissions'] ?? [],
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Token invalide ou expiré'], 401);
        }

        return $next($request);
    }
}
