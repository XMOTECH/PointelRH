<?php

namespace App\Console\Commands;

use App\Services\KpiCacheService;
use App\Services\SnapshotUpdater;
use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumePointageEvents extends Command
{
    protected $signature = 'rabbitmq:consume-analytics';

    protected $description = 'Consume pointage events to invalidate Redis caches immediately';

    public function handle(KpiCacheService $kpiCache)
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

            [$queue_name] = $channel->queue_declare('', false, false, true, false);
            $channel->queue_bind($queue_name, $exchange);

            $this->info(' [*] Analytics Worker waiting for clock-in/out events.');

            $callback = function (AMQPMessage $msg) use ($kpiCache) {
                $payload = json_decode($msg->body, true);
                if (! $payload) {
                    return;
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                if (in_array($event, ['EmployeeCheckedIn', 'EmployeeCheckedOut'])) {
                    $companyId = $data['company_id'] ?? null;
                    $date = $data['date'] ?? null;

                    if ($companyId && $date) {
                        // 1. Generate KPIs in Database FIRST
                        $data['event'] = $event; // SnapshotUpdater expects 'event' inside payload
                        app(SnapshotUpdater::class)->updateFromAttendance($data);
                        $this->info(" [v] Generated DailySnapshot stats for company: {$companyId}");

                        // 2. Clear Redis caches immediately
                        $kpiCache->invalidate($companyId, $date);
                        $this->info(" [v] Flushed Redis Dashboard cache for company_id: {$companyId} on {$date}");
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
            $this->error('Error connecting to RabbitMQ: '.$e->getMessage());

            return 1;
        }

        return 0;
    }
}
