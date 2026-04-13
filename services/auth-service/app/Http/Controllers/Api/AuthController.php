<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\RefreshToken;
use App\Models\User;
use App\Services\LoggingService;
use Google_Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        if (! $token = auth('api')->attempt($credentials)) {
            LoggingService::warning('Failed login attempt', ['email' => $credentials['email']]);

            return $this->respondUnauthorized('Identifiants invalides');
        }

        $user = auth('api')->user();

        if (! $user->is_active) {
            LoggingService::warning('Login attempt with inactive account', ['user_id' => $user->id]);

            return $this->respondForbidden('Compte désactivé');
        }

        $rawToken = Str::random(64);

        RefreshToken::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'token' => hash('sha256', $rawToken),
            'device' => $request->header('User-Agent'),
            'expires_at' => now()->addDays(30),
        ]);

        $user->update(['last_login_at' => now()]);

        LoggingService::info('User logged in successfully', ['user_id' => $user->id]);

        return $this->respondSuccess([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'refresh_token' => $rawToken,
            'user' => new UserResource($user),
        ], 'Connexion réussie', 200);
    }

    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate(['id_token' => 'required|string']);

        $client = new Google_Client(['client_id' => config('services.google.client_id')]);

        $payload = $client->verifyIdToken($request->id_token);

        if (! $payload) {
            return $this->respondUnauthorized('Token Google invalide');
        }

        $googleId = $payload['sub'];
        $email = $payload['email'] ?? null;

        $user = User::where('google_id', $googleId)->first();

        if (! $user && $email) {
            $user = User::where('email', $email)->first();
        }

        if (! $user) {
            return $this->respondNotFound('Aucun compte associé à cet email Google');
        }

        if (! $user->is_active) {
            return $this->respondForbidden('Compte désactivé');
        }

        if (! $user->google_id) {
            $user->update(['google_id' => $googleId]);
        }

        $token = auth('api')->login($user);

        $rawToken = Str::random(64);

        RefreshToken::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'token' => hash('sha256', $rawToken),
            'device' => $request->header('User-Agent'),
            'expires_at' => now()->addDays(30),
        ]);

        $user->update(['last_login_at' => now()]);

        LoggingService::info('User logged in via Google', ['user_id' => $user->id]);

        return $this->respondSuccess([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'refresh_token' => $rawToken,
            'user' => new UserResource($user),
        ], 'Connexion Google réussie', 200);
    }

    public function me(): JsonResponse
    {
        return $this->respondSuccess([
            'user' => new UserResource(auth('api')->user()),
        ]);
    }

    public function refresh(): JsonResponse
    {
        try {
            return $this->respondSuccess([
                'access_token' => auth('api')->refresh(),
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
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
                'user' => new UserResource($user),
            ]);
        } catch (\Exception $e) {
            return $this->respondUnauthorized('Token invalide ou expiré');
        }
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth('api')->user();

        if (! \Hash::check($request->current_password, $user->password)) {
            return $this->respondError('Le mot de passe actuel est incorrect', 422);
        }

        $user->update([
            'password' => \Hash::make($request->new_password),
        ]);

        LoggingService::info('User changed password', ['user_id' => $user->id]);

        return $this->respondSuccess(null, 'Mot de passe modifie avec succes');
    }
}
