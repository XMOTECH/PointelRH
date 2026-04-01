<?php

namespace App\Services;

use App\Dto\NotificationData;
use App\Services\Channels\EmailChannel;
use App\Services\Channels\InAppChannel;
use App\Services\Channels\WhatsAppChannel;
use Illuminate\Support\Facades\Log;

class NotificationRouter
{
    public function __construct(
        private readonly EmailChannel $email,
        private readonly WhatsAppChannel $whatsapp,
        private readonly InAppChannel $inapp
    ) {}

    public function send(NotificationData $notif, array $preferences): void
    {
        if ($this->isQuietHours($preferences)) {
            Log::info("Notification skipped due to quiet hours for employee {$notif->recipientId}");

            return;
        }

        // We can persist a master record or multiple records per channel
        // Here we'll persist per channel after successful dispatch or mark as pending

        if ($preferences['email_enabled'] ?? true) {
            $this->email->send($notif);
        }

        if ($preferences['whatsapp_enabled'] ?? true) {
            $this->whatsapp->send($notif);
        }

        if ($preferences['inapp_enabled'] ?? true) {
            $this->inapp->send($notif);
        }
    }

    private function isQuietHours(array $preferences): bool
    {
        $now = now()->format('H:i:s');
        $start = $preferences['quiet_hours_start'] ?? '20:00:00';
        $end = $preferences['quiet_hours_end'] ?? '07:00:00';

        if ($start < $end) {
            return $now >= $start && $now <= $end;
        }

        // Overlap midnight (e.g. 20:00 to 07:00)
        return $now >= $start || $now <= $end;
    }
}
