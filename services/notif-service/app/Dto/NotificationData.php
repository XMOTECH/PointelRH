<?php

namespace App\Dto;

use Illuminate\Support\Str;

class NotificationData
{
    public function __construct(
        public string $type,
        public string $recipientId,
        public string $companyId,
        public string $title,
        public string $body,
        public ?string $recipientEmail = null,
        public ?string $recipientPhone = null,
        public array $metadata = []
    ) {}

    public function toArray(): array
    {
        return [
            'id' => Str::uuid(),
            'recipient_id' => $this->recipientId,
            'company_id' => $this->companyId,
            'type' => $this->type,
            'channel' => 'pending', // Will be set by channel
            'title' => $this->title,
            'body' => $this->body,
            'status' => 'pending',
            'metadata' => $this->metadata,
        ];
    }
}
