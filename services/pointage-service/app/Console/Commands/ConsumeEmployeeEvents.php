<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumeEmployeeEvents extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'rabbitmq:consume-employees';

    /**
     * The console command description.
     */
    protected $description = 'Consume employee events from RabbitMQ to maintain local replica';

    /**
     * Execute the console command.
     */
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

            $this->info(' [*] Waiting for employee events in pointage-service. To exit press CTRL+C');

            $callback = function (AMQPMessage $msg) {
                $payload = json_decode($msg->body, true);
                if (! $payload) {
                    return;
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                $this->info(' [x] Received event: '.$event);

                if (in_array($event, ['EmployeeCreated', 'EmployeeUpdated'])) {
                    DB::table('employees_replica')->updateOrInsert(
                        ['id' => $data['id']],
                        [
                            'name' => $data['first_name'].' '.$data['last_name'],
                            'qr_token' => $data['qr_token'] ?? '',
                            'company_id' => $data['company_id'],
                            'department_id' => $data['department_id'] ?? null,
                            'schedule_id' => $data['schedule_id'] ?? null,
                            'is_active' => ($data['status'] ?? 'active') === 'active',
                            'updated_at' => now(),
                        ]
                    );
                    $this->info(" [v] Synced employee replica for {$data['id']}");
                } elseif (in_array($event, ['LocationCreated', 'LocationUpdated'])) {
                    DB::table('locations')->updateOrInsert(
                        ['id' => $data['id']],
                        [
                            'latitude' => $data['latitude'],
                            'longitude' => $data['longitude'],
                            'radius_meters' => $data['radius_meters'],
                            'company_id' => $data['company_id'],
                            'updated_at' => now(),
                        ]
                    );
                    $this->info(" [v] Synced location data for {$data['id']}");
                } elseif ($event === 'LocationDeleted') {
                    DB::table('locations')->where('id', $data['id'])->delete();
                    $this->info(" [v] Deleted location data for {$data['id']}");
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
}
