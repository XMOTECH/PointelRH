<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumeMissionEvents extends Command
{
    protected $signature = 'rabbitmq:consume-missions';

    protected $description = 'Consume mission and task events and create in-app notifications';

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

            $this->info(' [*] Mission/Task Worker waiting for events.');

            $callback = function (AMQPMessage $msg) {
                $payload = json_decode($msg->body, true);
                if (! $payload) {
                    $msg->ack();

                    return;
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                if ($event === 'MissionAssigned') {
                    $this->handleMissionAssigned($data);
                } elseif ($event === 'TaskAssigned') {
                    $this->handleTaskAssigned($data);
                } elseif ($event === 'TaskCompleted') {
                    $this->handleTaskCompleted($data);
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

    private function handleMissionAssigned(array $data): void
    {
        $userId = $data['user_id'] ?? null;
        $companyId = $data['company_id'] ?? null;
        $missionTitle = $data['mission_title'] ?? 'Mission';
        $missionLocation = $data['mission_location'] ?? '';
        $missionStartDate = $data['mission_start_date'] ?? '';
        $employeeName = $data['employee_name'] ?? 'Employe';
        $missionId = $data['mission_id'] ?? '';

        if (! $userId || ! $companyId) {
            $this->warn(' [!] MissionAssigned event missing user_id or company_id');

            return;
        }

        $body = "Vous avez été assigné(e) à la mission \"{$missionTitle}\"";
        if ($missionLocation) {
            $body .= " à {$missionLocation}";
        }
        if ($missionStartDate) {
            $body .= " (début: {$missionStartDate})";
        }

        Notification::create([
            'id' => Str::uuid(),
            'recipient_id' => $userId,
            'company_id' => $companyId,
            'type' => 'mission_assigned',
            'channel' => 'in_app',
            'title' => 'Nouvelle mission assignée',
            'body' => $body,
            'status' => 'sent',
            'sent_at' => now(),
            'metadata' => [
                'mission_id' => $missionId,
                'employee_name' => $employeeName,
                'link' => '/my-missions',
            ],
        ]);

        $this->info(" [v] Mission notification created for user {$userId}: {$missionTitle}");
    }

    private function handleTaskAssigned(array $data): void
    {
        $userId = $data['user_id'] ?? null;
        $companyId = $data['company_id'] ?? null;
        $taskTitle = $data['task_title'] ?? 'Tache';
        $creatorName = $data['creator_name'] ?? '';
        $taskId = $data['task_id'] ?? '';
        $priority = $data['task_priority'] ?? 'medium';
        $dueDate = $data['task_due_date'] ?? '';

        if (! $userId || ! $companyId) {
            $this->warn(' [!] TaskAssigned event missing user_id or company_id');

            return;
        }

        $body = "{$creatorName} vous a assigne la tache \"{$taskTitle}\"";
        if ($dueDate) {
            $body .= " (echeance: {$dueDate})";
        }

        Notification::create([
            'id' => Str::uuid(),
            'recipient_id' => $userId,
            'company_id' => $companyId,
            'type' => 'task_assigned',
            'channel' => 'in_app',
            'title' => 'Nouvelle tache assignee',
            'body' => $body,
            'status' => 'sent',
            'sent_at' => now(),
            'metadata' => [
                'task_id' => $taskId,
                'priority' => $priority,
                'link' => '/my-tasks',
            ],
        ]);

        $this->info(" [v] Task notification created for user {$userId}: {$taskTitle}");
    }

    private function handleTaskCompleted(array $data): void
    {
        $userId = $data['user_id'] ?? null;
        $companyId = $data['company_id'] ?? null;
        $taskTitle = $data['task_title'] ?? 'Tache';
        $completedBy = $data['completed_by'] ?? 'Un employe';
        $taskId = $data['task_id'] ?? '';

        if (! $userId || ! $companyId) {
            $this->warn(' [!] TaskCompleted event missing user_id or company_id');

            return;
        }

        Notification::create([
            'id' => Str::uuid(),
            'recipient_id' => $userId,
            'company_id' => $companyId,
            'type' => 'task_completed',
            'channel' => 'in_app',
            'title' => 'Tache terminee',
            'body' => "{$completedBy} a termine la tache \"{$taskTitle}\"",
            'status' => 'sent',
            'sent_at' => now(),
            'metadata' => [
                'task_id' => $taskId,
                'link' => '/team-tasks',
            ],
        ]);

        $this->info(" [v] Task completed notification for user {$userId}: {$taskTitle}");
    }
}
