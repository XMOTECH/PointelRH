<?php

namespace App\Services\Channels;

use App\Dto\NotificationData;
use App\Models\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    private string $apiUrl;
    private string $token;
    private string $phoneId;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.url', 'https://graph.facebook.com/v19.0');
        $this->token = config('services.whatsapp.token');
        $this->phoneId = config('services.whatsapp.phone_id');
    }

    public function send(NotificationData $data): void
    {
        if (!$data->recipientPhone) {
            Log::warning("WhatsApp skipped: No phone for {$data->recipientId}");
            return;
        }

        try {
            $notif = Notification::create(array_merge($data->toArray(), [
                'channel' => 'whatsapp',
                'status' => 'pending',
            ]));

            $response = Http::withToken($this->token)
                ->post("{$this->apiUrl}/{$this->phoneId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to' => $this->formatPhone($data->recipientPhone),
                    'type' => 'template',
                    'template' => [
                        'name' => 'late_arrival_alert',
                        'language' => ['code' => 'fr'],
                        'components' => [[
                            'type' => 'body',
                            'parameters' => [
                                ['type' => 'text', 'text' => $data->metadata['employee_name'] ?? 'Employé'],
                                ['type' => 'text', 'text' => (string)($data->metadata['late_minutes'] ?? 0)],
                            ],
                        ]],
                    ],
                ]);

            if ($response->successful()) {
                $notif->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'metadata' => array_merge($notif->metadata ?? [], ['wa_id' => $response->json('messages.0.id')]),
                ]);
            } else {
                throw new \Exception("WhatsApp API error: " . $response->body());
            }

        } catch (\Exception $e) {
            Log::error("WhatsApp failed for {$data->recipientPhone}: " . $e->getMessage());
            if (isset($notif)) {
                $notif->update([
                    'status' => 'failed',
                    'metadata' => array_merge($notif->metadata ?? [], ['error' => $e->getMessage()]),
                ]);
            }
        }
    }

    private function formatPhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', ltrim($phone, '+'));
    }
}
