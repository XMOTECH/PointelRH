<?php

namespace App\Http\Controllers\Api;

use App\Services\NotificationService;
use App\Services\LoggingService;
use App\Exceptions\NotificationSendException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * NotificationController
 * Gère les opérations sur les notifications
 * 
 * Responsabilités:
 * - Valider les entrées
 * - Appeler les services métier
 * - Retourner les réponses formatées
 * - Tracer les opérations
 */
class NotificationController extends BaseApiController
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * Envoyer une notification
     * POST /api/notifications/send
     * 
     * Body:
     * {
     *   "recipient_id": "uuid",
     *   "type": "late_arrival|absence_alert",
     *   "title": "...",
     *   "body": "...",
     *   "payload": {...}
     * }
     */
    public function send(Request $request): JsonResponse
    {
        try {
            $notification = $request->validate([
                'recipient_id' => 'required|uuid',
                'type' => 'required|string|in:late_arrival,absence_alert,shift_reminder,schedule_update',
                'title' => 'required|string|max:255',
                'body' => 'required|string',
                'payload' => 'nullable|array',
            ]);

            $result = $this->notificationService->send($notification);

            return $this->respondSuccess(
                ['sent' => $result],
                'Notification sent successfully',
                200
            );
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when sending notification', ['errors' => $e->errors()]);
            return $this->respondValidationError($e->errors());
        } catch (NotificationSendException $e) {
            LoggingService::warning('Failed to send notification', ['error' => $e->getMessage()]);
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            LoggingService::error('Failed to send notification', $e);
            return $this->respondServerError();
        }
    }

    /**
     * Envoyer des notifications en masse
     * POST /api/notifications/send-bulk
     * 
     * Body:
     * {
     *   "recipients": [{ "id": "uuid" }],
     *   "type": "late_arrival",
     *   "title": "...",
     *   "body": "...",
     *   "payload": {...}
     * }
     */
    public function sendBulk(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'recipients' => 'required|array|min:1',
                'recipients.*.id' => 'required|uuid',
                'type' => 'required|string|in:late_arrival,absence_alert,shift_reminder,schedule_update',
                'title' => 'required|string|max:255',
                'body' => 'required|string',
                'payload' => 'nullable|array',
            ]);

            $sent = $this->notificationService->sendBulk(
                $data['recipients'],
                [
                    'type' => $data['type'],
                    'title' => $data['title'],
                    'body' => $data['body'],
                    'payload' => $data['payload'] ?? [],
                ]
            );

            return $this->respondSuccess(
                ['sent' => $sent, 'total' => count($data['recipients'])],
                "Bulk notifications sent: {$sent}/" . count($data['recipients']),
                200
            );
        } catch (ValidationException $e) {
            LoggingService::warning('Validation failed when sending bulk notifications', ['errors' => $e->errors()]);
            return $this->respondValidationError($e->errors());
        } catch (\Exception $e) {
            LoggingService::error('Failed to send bulk notifications', $e);
            return $this->respondServerError();
        }
    }
}
