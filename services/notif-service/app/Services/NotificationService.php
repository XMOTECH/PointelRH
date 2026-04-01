<?php

namespace App\Services;

use App\Exceptions\NotificationSendException;

/**
 * NotificationService
 * Service métier pour la gestion des notifications
 *
 * Responsabilités:
 * - Routeur les notifications
 * - Envoyer les notifications via les différents canaux
 * - Tracer les opérations
 * - Lever les exceptions appropriées
 */
class NotificationService
{
    public function __construct(
        private readonly NotificationRouter $router,
        private readonly LoggingService $logger,
    ) {}

    /**
     * Envoyer une notification
     *
     * @throws NotificationSendException
     */
    public function send(array $notification): bool
    {
        try {
            $this->logger->info('Sending notification', [
                'recipient_id' => $notification['recipient_id'] ?? null,
                'type' => $notification['type'] ?? null,
            ]);

            $result = $this->router->route($notification);

            $this->logger->info('Notification sent successfully', [
                'recipient_id' => $notification['recipient_id'] ?? null,
            ]);

            return $result;
        } catch (\Exception $e) {
            $this->logger->error('Failed to send notification', $e);
            throw new NotificationSendException('Failed to send notification');
        }
    }

    /**
     * Envoyer des notifications en masse
     *
     * @return int Nombre de notifications envoyées
     */
    public function sendBulk(array $recipients, array $notification): int
    {
        $sent = 0;

        foreach ($recipients as $recipient) {
            try {
                $notif = array_merge($notification, ['recipient_id' => $recipient['id']]);
                if ($this->send($notif)) {
                    $sent++;
                }
            } catch (\Exception $e) {
                $this->logger->warning('Failed to send notification to recipient', [
                    'recipient_id' => $recipient['id'],
                    'error' => $e->getMessage(),
                ]);
                // Continue to next recipient
            }
        }

        $this->logger->info('Bulk notifications completed', [
            'total' => count($recipients),
            'sent' => $sent,
        ]);

        return $sent;
    }
}
