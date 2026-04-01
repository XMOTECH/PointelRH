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
            // Note: Validation du JWT et récupération du company_id via le middleware Kong ou Auth
            $companyId = $request->header('X-Company-Id', '00000000-0000-0000-0000-000000000001');

            // Optionally, the frontend might send an employee_id or manager_id header
            // to filter notifications specific to the authenticated user.

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
