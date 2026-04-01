<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumeAuthEvents extends Command
{
    protected $signature = 'employees:consume-auth-events';

    protected $description = 'Consume auth-service events to sync user_id on employees';

    public function handle(): int
    {
        $host = env('RABBITMQ_HOST', 'rabbitmq');
        $port = env('RABBITMQ_PORT', 5672);
        $user = env('RABBITMQ_USER', 'pointel');
        $pass = env('RABBITMQ_PASSWORD', 'pointel_pass');
        $exchange = 'auth_events';
        $queueName = 'employee_service.auth_sync';

        try {
            $connection = new AMQPStreamConnection($host, $port, $user, $pass);
            $channel = $connection->channel();

            // Declare the exchange (must match auth-service's publish)
            $channel->exchange_declare($exchange, 'fanout', false, true, false);

            // Durable named queue — survives consumer restarts, no message loss
            $channel->queue_declare($queueName, false, true, false, false);
            $channel->queue_bind($queueName, $exchange);

            $this->info(" [*] Employee-Service Auth Sync Worker waiting for events on '{$exchange}'...");

            $callback = function (AMQPMessage $msg) {
                $payload = json_decode($msg->body, true);
                if (! $payload) {
                    $msg->ack();

                    return;
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                $this->processEvent($event, $data);

                $msg->ack();
            };

            // Prefetch 1 message at a time for reliable processing
            $channel->basic_qos(null, 1, null);
            $channel->basic_consume($queueName, '', false, false, false, false, $callback);

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

    private function processEvent(string $event, array $data): void
    {
        match ($event) {
            'UserCreated' => $this->handleUserCreated($data),
            default => $this->info(" [?] Ignored event: {$event}"),
        };
    }

    private function handleUserCreated(array $data): void
    {
        $userId = $data['user_id'] ?? null;
        $employeeId = $data['employee_id'] ?? null;
        $email = $data['email'] ?? null;

        if (! $userId) {
            $this->warn(' [!] UserCreated event missing user_id, skipping.');

            return;
        }

        // Priority 1: match by employee_id (most reliable)
        $employee = null;
        if ($employeeId) {
            $employee = Employee::find($employeeId);
        }

        // Priority 2: fallback to email match
        if (! $employee && $email) {
            $employee = Employee::where('email', $email)->first();
        }

        if (! $employee) {
            $this->warn(" [!] No employee found for user_id={$userId} (employee_id={$employeeId}, email={$email})");

            return;
        }

        // Idempotent: skip if already linked to the same user
        if ($employee->user_id === $userId) {
            $this->info(" [=] Employee {$employee->id} already linked to user {$userId}");

            return;
        }

        $employee->user_id = $userId;
        $employee->saveQuietly(); // Quiet to avoid triggering EmployeeObserver re-publish

        $this->info(" [v] Linked employee {$employee->id} ({$employee->email}) to user {$userId}");
    }
}
