<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\RefreshToken;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumeEmployeeEvents extends Command
{
    protected $signature = 'rabbitmq:consume-security';
    protected $description = 'Consume employee events to enforce security rules (revocation)';

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

            list($queue_name, ,) = $channel->queue_declare('', false, false, true, false);
            $channel->queue_bind($queue_name, $exchange);

            $this->info(" [*] Auth-Service Security Worker waiting for enforcement events.");

            $callback = function (AMQPMessage $msg) {
                $payload = json_decode($msg->body, true);
                if (!$payload) return;

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                if (in_array($event, ['EmployeeSuspended', 'EmployeeDeleted'])) {
                    $this->info(" [!] High priority security event: " . $event);
                    
                    $userId = User::where('employee_id', $data['id'])->value('id');
                    
                    if ($userId) {
                        // Invalidate all tokens universally
                        RefreshToken::where('user_id', $userId)->update(['revoked_at' => now()]);
                        
                        // Disable account if suspended/deleted
                        User::where('id', $userId)->update(['is_active' => false]);

                        $this->info(" [v] Revoked all sessions and locked account for user => {$userId}");
                    }
                }

                if ($event === 'EmployeeUpdated') {
                    $this->info(" [!] Data sync event: " . $event);
                    $user = User::where('employee_id', $data['id'])->first();
                    if ($user) {
                        $user->update([
                            'department_id' => $data['department_id'] ?? $user->department_id,
                            'role' => $data['role'] ?? $user->role,
                        ]);
                        $this->info(" [v] Updated department/role for user => {$user->id}");
                    }
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
            $this->error("Error connecting to RabbitMQ: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
