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
     * Récupérer les notifications récentes pour l'utilisateur
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $companyId = $request->auth_company_id;
            $userId = $request->auth_user_id;

            if (! $companyId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentification requise',
                ], 401);
            }

            $notifications = Notification::where('company_id', $companyId)
                ->where(function ($q) use ($userId) {
                    $q->where('recipient_id', $userId)
                      ->orWhereNull('recipient_id');
                })
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(fn ($n) => $this->formatNotification($n));

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

    /**
     * Marquer une notification comme lue
     * POST /api/notifications/{id}/read
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            $notification = Notification::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            $notification->update([
                'read_at' => now(),
                'status' => 'read',
            ]);

            return response()->json([
                'success' => true,
                'data' => $this->formatNotification($notification),
            ]);
        } catch (\Exception $e) {
            LoggingService::error('Failed to mark notification as read', $e);

            return response()->json([
                'success' => false,
                'message' => 'Notification introuvable',
            ], 404);
        }
    }

    /**
     * Marquer toutes les notifications comme lues
     * POST /api/notifications/read-all
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            Notification::where('company_id', $request->auth_company_id)
                ->where(function ($q) use ($request) {
                    $q->where('recipient_id', $request->auth_user_id)
                      ->orWhereNull('recipient_id');
                })
                ->whereNull('read_at')
                ->update([
                    'read_at' => now(),
                    'status' => 'read',
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications ont été marquées comme lues',
            ]);
        } catch (\Exception $e) {
            LoggingService::error('Failed to mark all as read', $e);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
            ], 500);
        }
    }

    /**
     * Supprimer une notification
     * DELETE /api/notifications/{id}
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $notification = Notification::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification supprimée',
            ]);
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete notification', $e);

            return response()->json([
                'success' => false,
                'message' => 'Notification introuvable',
            ], 404);
        }
    }

    /**
     * Formater une notification pour le frontend
     */
    private function formatNotification(Notification $n): array
    {
        // Mapper les types backend vers les types frontend
        $typeMap = [
            'late' => 'warning',
            'absent' => 'error',
            'leave_approved' => 'success',
            'leave_rejected' => 'error',
            'report' => 'info',
            'mission_assigned' => 'info',
            'task_assigned' => 'info',
            'task_completed' => 'success',
        ];

        return [
            'id' => $n->id,
            'title' => $n->title,
            'message' => $n->body,
            'type' => $typeMap[$n->type] ?? 'info',
            'is_read' => $n->read_at !== null,
            'created_at' => $n->created_at->toISOString(),
            'link' => $n->metadata['link'] ?? null,
        ];
    }
}
