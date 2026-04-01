<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ValidateJwtFromAuthService
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['error' => 'Token manquant'], 401);
        }

        try {
            $authUrl = env('AUTH_SERVICE_URL', 'http://auth-service/api/auth/verify');
            $response = Http::withToken($token)->post($authUrl);

            if (! $response->successful()) {
                Log::warning('Token rejected by auth-service', ['status' => $response->status()]);

                return response()->json(['error' => 'Token invalide ou rejeté par le service Auth'], 401);
            }

            $user = $response->json('data.user');

            if (! $user) {
                return response()->json(['error' => 'Données utilisateur manquantes'], 401);
            }

            $request->merge([
                'auth_user_id' => $user['id'],
                'auth_company_id' => $user['company_id'],
                'auth_department_id' => $user['department_id'] ?? null,
                'auth_role' => $user['role'],
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur communication auth-service: '.$e->getMessage());

            return response()->json(['error' => 'Service d\'authentification injoignable'], 503);
        }

        return $next($request);
    }
}
