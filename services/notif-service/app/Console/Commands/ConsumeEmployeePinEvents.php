<?php

namespace App\Console\Commands;

use App\Mail\EmployeeCredentialsMail;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumeEmployeePinEvents extends Command
{
    protected $signature = 'rabbitmq:consume-pin';

    protected $description = 'Consume employee PIN/password events and send email notifications';

    public function handle()
    {
        $host = env('RABBITMQ_HOST', 'rabbitmq');
        $port = env('RABBITMQ_PORT', 5672);
        $user = env('RABBITMQ_USER', 'pointel');
        $pass = env('RABBITMQ_PASSWORD', 'pointel_pass');
        $exchange = 'employee_events';

        try {
            $connection = new AMQPStreamConnection($host, $port, $user, $pass);
            $channel = $connection->channel();

            $channel->exchange_declare($exchange, 'fanout', false, true, false);
            [$queue_name] = $channel->queue_declare('', false, false, true, false);
            $channel->queue_bind($queue_name, $exchange);

            $this->info(' [*] PIN/Password Worker waiting for employee events.');

            $callback = function (AMQPMessage $msg) {
                $payload = json_decode($msg->body, true);
                if (! $payload) {
                    $msg->ack();

                    return;
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                if ($event === 'PinGenerated') {
                    $this->handlePinGenerated($data);
                } elseif ($event === 'UserCreated') {
                    $this->handleUserCreated($data);
                }

                $msg->ack();
            };

            $channel->basic_consume($queue_name, '', false, false, false, false, $callback);

            while ($channel->is_open()) {
                $channel->wait();
            }

            $channel->close();
            $connection->close();

        } catch (\Exception $e) {
            $this->error('Error connecting to RabbitMQ: '.$e->getMessage());

            return 1;
        }

        return 0;
    }

    private function handlePinGenerated(array $data): void
    {
        $email = $data['email'] ?? null;
        $pin = $data['pin'] ?? null;
        $password = $data['password'] ?? null;
        $employeeName = $data['employee_name'] ?? 'Employe';
        $employeeId = $data['employee_id'] ?? '';
        $companyId = $data['company_id'] ?? '';

        if (! $email || ! $pin) {
            $this->warn(' [!] PinGenerated event missing email or pin data');

            return;
        }

        $notification = Notification::create([
            'id' => Str::uuid(),
            'recipient_id' => $employeeId,
            'company_id' => $companyId,
            'type' => 'pin_generated',
            'channel' => 'email',
            'title' => 'Code PIN et identifiants',
            'body' => "Code PIN et mot de passe envoyes par email a {$email}",
            'status' => 'pending',
            'metadata' => ['employee_name' => $employeeName],
        ]);

        $this->sendWithRetry($notification, $email, function () use ($email, $employeeName, $pin, $password) {
            Mail::to($email)->send(new EmployeeCredentialsMail(
                employeeName: $employeeName,
                credentialType: 'pin',
                credentialValue: $pin,
                password: $password,
                email: $email,
            ));
        }, "PIN email for {$employeeId}");
    }

    private function handleUserCreated(array $data): void
    {
        $email = $data['email'] ?? null;
        $tempPassword = $data['temp_password'] ?? null;
        $pin = $data['pin'] ?? null;
        $employeeName = $data['employee_name'] ?? 'Employe';
        $employeeId = $data['employee_id'] ?? '';
        $companyId = $data['company_id'] ?? '';

        if (! $email || ! $tempPassword) {
            $this->warn(' [!] UserCreated event missing email or temp_password');

            return;
        }

        $notification = Notification::create([
            'id' => Str::uuid(),
            'recipient_id' => $employeeId,
            'company_id' => $companyId,
            'type' => 'user_created',
            'channel' => 'email',
            'title' => 'Identifiants de connexion',
            'body' => "Identifiants de connexion envoyes par email a {$email}",
            'status' => 'pending',
            'metadata' => ['employee_name' => $employeeName],
        ]);

        if ($pin) {
            $this->sendWithRetry($notification, $email, function () use ($email, $employeeName, $pin, $tempPassword) {
                Mail::to($email)->send(new EmployeeCredentialsMail(
                    employeeName: $employeeName,
                    credentialType: 'pin',
                    credentialValue: $pin,
                    password: $tempPassword,
                    email: $email,
                ));
            }, "Combined credentials for {$employeeId}");
        } else {
            $this->sendWithRetry($notification, $email, function () use ($email, $employeeName, $tempPassword) {
                Mail::to($email)->send(new EmployeeCredentialsMail(
                    employeeName: $employeeName,
                    credentialType: 'password',
                    credentialValue: $tempPassword,
                    email: $email,
                ));
            }, "Password credentials for {$employeeId}");
        }
    }

    /**
     * Envoyer un email avec 3 tentatives et mettre a jour le statut de la notification.
     */
    private function sendWithRetry(Notification $notification, string $email, callable $sendFn, string $label, int $maxRetries = 3): void
    {
        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $sendFn();

                $notification->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                $this->info(" [v] {$label} sent to {$email} (attempt {$attempt})");

                return;
            } catch (\Exception $e) {
                $this->error(" [x] Attempt {$attempt}/{$maxRetries} failed for {$label}: ".$e->getMessage());

                if ($attempt < $maxRetries) {
                    sleep(2 * $attempt);
                }
            }
        }

        $notification->update([
            'status' => 'failed',
            'metadata' => array_merge($notification->metadata ?? [], [
                'error' => 'Email send failed after '.$maxRetries.' attempts',
            ]),
        ]);

        $this->error(" [X] FINAL FAILURE: {$label} to {$email}");
    }
}
