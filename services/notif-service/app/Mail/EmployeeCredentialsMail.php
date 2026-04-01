<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class EmployeeCredentialsMail extends Mailable
{
    public function __construct(
        public string $employeeName,
        public string $credentialType, // 'pin' or 'password'
        public string $credentialValue,
        public ?string $password = null,
        public ?string $email = null,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->credentialType === 'pin'
            ? 'PointelRH — Votre code PIN'
            : 'PointelRH — Vos identifiants de connexion';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.employee_credentials',
            with: [
                'employeeName' => $this->employeeName,
                'credentialType' => $this->credentialType,
                'credentialValue' => $this->credentialValue,
                'password' => $this->password,
                'email' => $this->email,
                'loginUrl' => config('app.frontend_url', 'http://localhost:5173').'/login',
            ],
        );
    }
}
