<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\LoggingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Récupérer les notifications récentes pour la compagnie
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $companyId = $request->auth_company_id;

            if (! $companyId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise',
                ], 401);
            }

            $notifications = Notification::where('company_id', $companyId)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $notifications,
            ]);
        } catch (\Exception $e) {
            LoggingService::error('Failed to retrieve notifications', $e);

            return response()->json([
                'success' => false,
                'message' => 'Impossible de récupérer les notifications',
            ], 500);
        }
    }
}
