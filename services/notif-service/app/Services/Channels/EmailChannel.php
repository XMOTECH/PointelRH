<?php

namespace App\Services\Channels;

use App\Dto\NotificationData;
use App\Mail\LateArrivalMail;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailChannel
{
    public function send(NotificationData $data): void
    {
        if (! $data->recipientEmail) {
            Log::warning("Email channel skipped: No recipient email provided for {$data->recipientId}");

            return;
        }

        try {
            // Persist as pending
            $notif = Notification::create(array_merge($data->toArray(), [
                'channel' => 'email',
                'status' => 'pending',
            ]));

            Mail::to($data->recipientEmail)->send(new LateArrivalMail($data));

            $notif->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

        } catch (\Exception $e) {
            Log::error("Email failed for recipient {$data->recipientEmail}: ".$e->getMessage());
            if (isset($notif)) {
                $notif->update([
                    'status' => 'failed',
                    'metadata' => array_merge($notif->metadata ?? [], ['error' => $e->getMessage()]),
                ]);
            }
        }
    }
}
