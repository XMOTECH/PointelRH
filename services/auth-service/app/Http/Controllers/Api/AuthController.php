<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\JsonResponse;
use App\Models\RefreshToken;
use App\Http\Resources\UserResource;
use App\Services\LoggingService;
use Illuminate\Support\Str;

class AuthController extends BaseApiController
{
    public function ping(): JsonResponse
    {
        return $this->respondSuccess(['status' => 'ready']);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only(['email', 'password']);

        if (!$token = auth('api')->attempt($credentials)) {
            LoggingService::warning('Failed login attempt', ['email' => $credentials['email']]);
            return $this->respondUnauthorized('Identifiants invalides');
        }

        $user = auth('api')->user();

        if (!$user->is_active) {
            LoggingService::warning('Login attempt with inactive account', ['user_id' => $user->id]);
            return $this->respondForbidden('Compte désactivé');
        }

        $rawToken = Str::random(64);

        RefreshToken::create([
            'id'         => Str::uuid(),
            'user_id'    => $user->id,
            'token'      => hash('sha256', $rawToken),
            'device'     => $request->header('User-Agent'),
            'expires_at' => now()->addDays(30),
        ]);

        $user->update(['last_login_at' => now()]);

        LoggingService::info('User logged in successfully', ['user_id' => $user->id]);

        return $this->respondSuccess([
            'access_token'  => $token,
            'token_type'    => 'bearer',
            'expires_in'    => config('jwt.ttl') * 60,
            'refresh_token' => $rawToken,
            'user'          => new UserResource($user),
        ], 'Connexion réussie', 200);
    }


    public function me(): JsonResponse
    {
        return $this->respondSuccess([
            'user' => new UserResource(auth('api')->user())
        ]);
    }

    public function refresh(): JsonResponse
    {
        try {
            return $this->respondSuccess([
                'access_token' => auth('api')->refresh(),
                'token_type'   => 'bearer',
                'expires_in'   => config('jwt.ttl') * 60
            ]);
        } catch (\Exception $e) {
            LoggingService::error('Token refresh failed', $e);
            return $this->respondUnauthorized('Impossible de rafraîchir le token');
        }
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();
        LoggingService::info('User logged out', ['user_id' => auth('api')->user()->id ?? null]);
        return $this->respondSuccess(null, 'Déconnexion réussie');
    }

    public function logoutAll(): JsonResponse
    {
        $user = auth('api')->user();
        
        RefreshToken::where('user_id', $user->id)->update(['revoked_at' => now()]);
        auth('api')->logout();

        LoggingService::info('User logged out from all devices', ['user_id' => $user->id]);
        return $this->respondSuccess(null, 'Déconnecté de tous les appareils');
    }

    public function verify(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();

            return $this->respondSuccess([
                'valid' => true,
                'user'  => new UserResource($user),
            ]);
        } catch (\Exception $e) {
            return $this->respondUnauthorized('Token invalide ou expiré');
        }
    }
}
