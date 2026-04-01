<?php

namespace App\Services\Channels;

use App\Dto\NotificationData;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class SmsChannel
{
    private string $sid;

    private string $token;

    private string $from;

    public function __construct()
    {
        $this->sid = config('services.twilio.sid');
        $this->token = config('services.twilio.token');
        $this->from = config('services.twilio.from');
    }

    public function send(NotificationData $data): void
    {
        if (! $data->recipientPhone) {
            Log::warning("SMS skipped: No phone for {$data->recipientId}");

            return;
        }

        try {
            $notif = Notification::create(array_merge($data->toArray(), [
                'channel' => 'sms',
                'status' => 'pending',
            ]));

            $client = new Client($this->sid, $this->token);

            $message = $client->messages->create(
                $data->recipientPhone,
                [
                    'from' => $this->from,
                    'body' => $data->body,
                ]
            );

            $notif->update([
                'status' => 'sent',
                'sent_at' => now(),
                'metadata' => array_merge($notif->metadata ?? [], ['sms_sid' => $message->sid]),
            ]);

        } catch (\Exception $e) {
            Log::error("SMS failed for {$data->recipientPhone}: ".$e->getMessage());
            if (isset($notif)) {
                $notif->update([
                    'status' => 'failed',
                    'metadata' => array_merge($notif->metadata ?? [], ['error' => $e->getMessage()]),
                ]);
            }
        }
    }
}
