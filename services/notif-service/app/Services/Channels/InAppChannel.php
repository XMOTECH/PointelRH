<?php

namespace App\Services\Channels;

use App\Dto\NotificationData;
use Illuminate\Support\Facades\Log;

class InAppChannel
{
    public function send(NotificationData $data): void
    {
        // Placeholder for Pusher/WebSockets
        Log::info("In-App Notification dispatched: {$data->title}");
    }
}
