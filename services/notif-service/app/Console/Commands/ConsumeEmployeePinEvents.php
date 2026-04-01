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
        $employeeName = $data['employee_name'] ?? 'Employé';
        $employeeId = $data['employee_id'] ?? '';
        $companyId = $data['company_id'] ?? '';

        if (! $email || ! $pin) {
            $this->warn(' [!] PinGenerated event missing email or pin data');

            return;
        }

        try {
            // Persist notification record
            Notification::create([
                'id' => Str::uuid(),
                'recipient_id' => $employeeId,
                'company_id' => $companyId,
                'type' => 'pin_generated',
                'channel' => 'email',
                'title' => 'Code PIN',
                'body' => 'Code PIN envoyé par email',
                'status' => 'pending',
                'metadata' => ['employee_name' => $employeeName],
            ]);

            Mail::to($email)->send(new EmployeeCredentialsMail(
                employeeName: $employeeName,
                credentialType: 'pin',
                credentialValue: $pin,
                password: $password,
                email: $email,
            ));

            $this->info(" [v] PIN email sent for employee: {$employeeId}");
        } catch (\Exception $e) {
            $this->error(" [x] Failed to send PIN email for employee {$employeeId}: ".$e->getMessage());
        }
    }

    private function handleUserCreated(array $data): void
    {
        $email = $data['email'] ?? null;
        $tempPassword = $data['temp_password'] ?? null;
        $pin = $data['pin'] ?? null;
        $employeeName = $data['employee_name'] ?? 'Employé';
        $employeeId = $data['employee_id'] ?? '';
        $companyId = $data['company_id'] ?? '';

        if (! $email || ! $tempPassword) {
            $this->warn(' [!] UserCreated event missing email or temp_password');

            return;
        }

        try {
            Notification::create([
                'id' => Str::uuid(),
                'recipient_id' => $employeeId,
                'company_id' => $companyId,
                'type' => 'user_created',
                'channel' => 'email',
                'title' => 'Identifiants de connexion',
                'body' => 'Identifiants envoyés par email',
                'status' => 'pending',
                'metadata' => ['employee_name' => $employeeName],
            ]);

            if ($pin) {
                Mail::to($email)->send(new EmployeeCredentialsMail(
                    employeeName: $employeeName,
                    credentialType: 'pin',
                    credentialValue: $pin,
                    password: $tempPassword,
                    email: $email,
                ));
                $this->info(" [v] Combined credentials email (PIN + password) sent to {$employeeId}");
            } else {
                Mail::to($email)->send(new EmployeeCredentialsMail(
                    employeeName: $employeeName,
                    credentialType: 'password',
                    credentialValue: $tempPassword,
                    email: $email,
                ));
                $this->info(" [v] Password-only credentials email sent to {$employeeId}");
            }
        } catch (\Exception $e) {
            $this->error(' [x] Failed to send credentials email: '.$e->getMessage());
        }
    }
}
