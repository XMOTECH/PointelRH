<?php

namespace App\Mail;

use App\Dto\NotificationData;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LateArrivalMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public NotificationData $data
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->data->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.late_arrival',
            with: [
                'employeeName' => $this->data->metadata['employee_name'] ?? 'Employé',
                'managerName' => $this->data->metadata['manager_name'] ?? 'Manager',
                'clockInTime' => $this->data->metadata['clock_in_time'] ?? '--:--',
                'expectedTime' => $this->data->metadata['expected_time'] ?? '--:--',
                'lateMinutes' => $this->data->metadata['late_minutes'] ?? 0,
                'dashboardUrl' => config('app.frontend_url', 'http://localhost:3000').'/dashboard',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
