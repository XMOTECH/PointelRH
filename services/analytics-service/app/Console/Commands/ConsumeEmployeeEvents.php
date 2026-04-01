<?php

namespace App\Console\Commands;

use App\Models\Department;
use App\Services\KpiCacheService;
use App\Services\SnapshotUpdater;
use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumeEmployeeEvents extends Command
{
    protected $signature = 'rabbitmq:consume-employees';

    protected $description = 'Consume employee events to sync department employee counts';

    public function handle(KpiCacheService $kpiCache)
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

            [$queue_name] = $channel->queue_declare('analytics_employee_queue', false, true, false, false);
            $channel->queue_bind($queue_name, $exchange);

            $this->info(' [*] Analytics Employee Worker waiting for events.');

            $callback = function (AMQPMessage $msg) {
                $payload = json_decode($msg->body, true);
                if (! $payload) {
                    return;
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                $this->info(" [+] Received {$event}");

                switch ($event) {
                    case 'EmployeeCreated':
                        $this->handleEmployeeCreated($data);
                        break;
                    case 'EmployeeDeleted':
                        $this->handleEmployeeDeleted($data);
                        break;
                    case 'EmployeeUpdated':
                        $this->handleEmployeeUpdated($data);
                        break;
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

    private function handleEmployeeCreated(array $data): void
    {
        $deptId = $data['department_id'] ?? null;
        $companyId = $data['company_id'] ?? null;

        if ($deptId && $companyId) {
            $dept = Department::firstOrCreate(
                ['id' => $deptId],
                ['company_id' => $companyId, 'employee_count' => 0]
            );
            $dept->increment('employee_count');

            // Update today's snapshot immediately
            app(SnapshotUpdater::class)->updateSnapshotBaseCount($deptId, $companyId, $dept->employee_count);

            // Invalidate KPI Cache
            app(KpiCacheService::class)->invalidate($companyId, now()->toDateString());

            $this->info(" [v] Incremented employee_count and updated snapshot for department: {$deptId}");
        }
    }

    private function handleEmployeeDeleted(array $data): void
    {
        $deptId = $data['department_id'] ?? null;
        $companyId = $data['company_id'] ?? null;

        if ($deptId) {
            $dept = Department::find($deptId);
            if ($dept && $dept->employee_count > 0) {
                $dept->decrement('employee_count');

                if ($companyId) {
                    app(SnapshotUpdater::class)->updateSnapshotBaseCount($deptId, $companyId, $dept->employee_count);
                    app(KpiCacheService::class)->invalidate($companyId, now()->toDateString());
                }

                $this->info(" [v] Decremented employee_count and updated snapshot for department: {$deptId}");
            }
        }
    }

    private function handleEmployeeUpdated(array $data): void
    {
        // Handle department change
        $newDeptId = $data['department_id'] ?? null;
        $oldDeptId = $data['old_department_id'] ?? null; // Assume we might get this if it changed

        if ($oldDeptId && $newDeptId && $oldDeptId !== $newDeptId) {
            $this->handleEmployeeDeleted(['department_id' => $oldDeptId]);
            $this->handleEmployeeCreated($data);
        }
    }
}
