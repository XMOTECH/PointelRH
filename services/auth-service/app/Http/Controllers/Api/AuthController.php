<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Models\RefreshToken;
use App\Http\Resources\UserResource;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only(['email', 'password']);

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Identifiants invalides'], 401);
        }

        $user = auth('api')->user();

        if (!$user->is_active) {
            return response()->json(['error' => 'Compte désactivé'], 403);
        }

        $rawToken = Str::random(64);

        $refreshToken = RefreshToken::create([
            'id'         => Str::uuid(),
            'user_id'    => $user->id,
            'token'      => hash('sha256', $rawToken),
            'device'     => $request->header('User-Agent'),
            'expires_at' => now()->addDays(30),
        ]);

        $user->update(['last_login_at' => now()]);

        return response()->json([
            'access_token'  => $token,
            'token_type'    => 'bearer',
            'expires_in'    => config('jwt.ttl') * 60,
            'refresh_token' => $rawToken,
            'user'          => new UserResource($user),
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json([
            'user' => new UserResource(auth('api')->user())
        ]);
    }

    public function refresh(): JsonResponse
    {
        try {
            return response()->json([
                'access_token' => auth('api')->refresh(),
                'token_type'   => 'bearer',
                'expires_in'   => config('jwt.ttl') * 60
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors du rafraîchissement du token'], 401);
        }
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function logoutAll(): JsonResponse
    {
        $user = auth('api')->user();
        
        // Revoke all refresh tokens
        RefreshToken::where('user_id', $user->id)->update(['revoked_at' => now()]);
        
        auth('api')->logout();

        return response()->json(['message' => 'Déconnecté de tous les appareils']);
    }

    public function verify(Request $request): JsonResponse
    {
        try {
            $token = JWTAuth::parseToken()->authenticate();

            return response()->json([
                'valid'      => true,
                'user_id'    => $token->id,
                'company_id' => $token->company_id,
                'role'       => $token->role,
                'permissions'=> $token->getAllPermissions()->pluck('name'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['valid' => false, 'error' => $e->getMessage()], 401);
        }
    }
}
