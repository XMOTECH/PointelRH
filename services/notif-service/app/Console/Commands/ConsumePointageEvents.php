<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use App\Jobs\Consumers\HandleLateArrival;

class ConsumePointageEvents extends Command
{
    protected $signature = 'rabbitmq:consume-notif';
    protected $description = 'Consume pointage events for Notification Service';

    public function handle()
    {
        $host = env('RABBITMQ_HOST', 'rabbitmq');
        $port = env('RABBITMQ_PORT', 5672);
        $user = env('RABBITMQ_USER', 'pointel');
        $pass = env('RABBITMQ_PASSWORD', 'pointel_pass');
        $exchange = 'pointage_events';

        try {
            $connection = new AMQPStreamConnection($host, $port, $user, $pass);
            $channel = $connection->channel();

            $channel->exchange_declare($exchange, 'fanout', false, true, false);
            list($queue_name, ,) = $channel->queue_declare('', false, false, true, false);
            $channel->queue_bind($queue_name, $exchange);

            $this->info(" [*] Notification Worker waiting for pointage events.");

            $callback = function (AMQPMessage $msg) {
                $payload = json_decode($msg->body, true);
                if (!$payload) return;

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                if ($event === 'LateArrivalDetected') {
                    $dispatchPayload = [
                        'event_id'      => md5($msg->body),
                        'employee_id'   => $data['employee_id'] ?? null,
                        'company_id'    => $data['company_id'] ?? null,
                        'late_minutes'  => $data['late_minutes'] ?? 0,
                        'expected_time' => $data['expected_time'] ?? '--:--',
                        'actual_time'   => $data['actual_time'] ?? '--:--',
                        'clock_in_time' => $data['actual_time'] ?? '--:--', // Mapped for HandleLateArrival
                    ];

                    if ($dispatchPayload['employee_id'] && $dispatchPayload['company_id']) {
                        HandleLateArrival::dispatch($dispatchPayload);
                        $this->info(" [v] Dispatched HandleLateArrival for employee: {$dispatchPayload['employee_id']}");
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
