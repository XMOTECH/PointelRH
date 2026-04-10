<?php

namespace App\Services\Channels;

use App\Dto\NotificationData;
use App\Models\Notification;
use App\Services\LoggingService;

class InAppChannel
{
    public function send(NotificationData $data): void
    {
        try {
            Notification::create([
                'recipient_id' => $data->recipientId,
                'company_id' => $data->companyId,
                'type' => $data->type,
                'channel' => 'inapp',
                'title' => $data->title,
                'body' => $data->body,
                'status' => 'sent',
                'metadata' => $data->metadata,
                'sent_at' => now(),
            ]);

            LoggingService::info('In-App notification persisted', [
                'recipient_id' => $data->recipientId,
                'type' => $data->type,
            ]);
        } catch (\Exception $e) {
            LoggingService::error('Failed to persist in-app notification', $e);
        }
    }
}
