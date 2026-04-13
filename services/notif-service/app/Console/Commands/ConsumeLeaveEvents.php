<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumeLeaveEvents extends Command
{
    protected $signature = 'rabbitmq:consume-leaves';

    protected $description = 'Consume leave events and create in-app notifications';

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

            $this->info(' [*] Leave Worker waiting for events.');

            $callback = function (AMQPMessage $msg) {
                $payload = json_decode($msg->body, true);
                if (! $payload) {
                    $msg->ack();

                    return;
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                match ($event) {
                    'LeaveRequested' => $this->handleLeaveRequested($data),
                    'LeaveApproved' => $this->handleLeaveApproved($data),
                    'LeaveRejected' => $this->handleLeaveRejected($data),
                    default => null,
                };

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

    private function handleLeaveRequested(array $data): void
    {
        $managerUserId = $data['manager_user_id'] ?? null;
        $companyId = $data['company_id'] ?? null;
        $employeeName = $data['employee_name'] ?? 'Un employé';
        $leaveTypeName = $data['leave_type_name'] ?? 'Congé';
        $startDate = $data['start_date'] ?? '';
        $endDate = $data['end_date'] ?? '';
        $daysCount = $data['days_count'] ?? '';
        $leaveId = $data['leave_request_id'] ?? '';

        if (! $managerUserId || ! $companyId) {
            $this->warn(' [!] LeaveRequested: missing manager_user_id or company_id');

            return;
        }

        $body = "{$employeeName} demande un congé {$leaveTypeName} du {$startDate} au {$endDate}";
        if ($daysCount) {
            $body .= " ({$daysCount} jours)";
        }

        Notification::create([
            'id' => Str::uuid(),
            'recipient_id' => $managerUserId,
            'company_id' => $companyId,
            'type' => 'leave_requested',
            'channel' => 'in_app',
            'title' => 'Nouvelle demande de congé',
            'body' => $body,
            'status' => 'sent',
            'sent_at' => now(),
            'metadata' => [
                'leave_request_id' => $leaveId,
                'employee_name' => $employeeName,
                'link' => '/leaves',
            ],
        ]);

        $this->info(" [v] Leave request notification for manager {$managerUserId}: {$employeeName}");
    }

    private function handleLeaveApproved(array $data): void
    {
        $userId = $data['user_id'] ?? null;
        $companyId = $data['company_id'] ?? null;
        $leaveTypeName = $data['leave_type_name'] ?? 'Congé';
        $startDate = $data['start_date'] ?? '';
        $endDate = $data['end_date'] ?? '';
        $leaveId = $data['leave_request_id'] ?? '';

        if (! $userId || ! $companyId) {
            $this->warn(' [!] LeaveApproved: missing user_id or company_id');

            return;
        }

        Notification::create([
            'id' => Str::uuid(),
            'recipient_id' => $userId,
            'company_id' => $companyId,
            'type' => 'leave_approved',
            'channel' => 'in_app',
            'title' => 'Congé approuvé',
            'body' => "Votre demande de congé {$leaveTypeName} du {$startDate} au {$endDate} a été approuvée.",
            'status' => 'sent',
            'sent_at' => now(),
            'metadata' => [
                'leave_request_id' => $leaveId,
                'link' => '/my-leaves',
            ],
        ]);

        $this->info(" [v] Leave approved notification for user {$userId}");
    }

    private function handleLeaveRejected(array $data): void
    {
        $userId = $data['user_id'] ?? null;
        $companyId = $data['company_id'] ?? null;
        $leaveTypeName = $data['leave_type_name'] ?? 'Congé';
        $startDate = $data['start_date'] ?? '';
        $endDate = $data['end_date'] ?? '';
        $rejectionReason = $data['rejection_reason'] ?? '';
        $leaveId = $data['leave_request_id'] ?? '';

        if (! $userId || ! $companyId) {
            $this->warn(' [!] LeaveRejected: missing user_id or company_id');

            return;
        }

        $body = "Votre demande de congé {$leaveTypeName} du {$startDate} au {$endDate} a été refusée.";
        if ($rejectionReason) {
            $body .= " Motif : {$rejectionReason}";
        }

        Notification::create([
            'id' => Str::uuid(),
            'recipient_id' => $userId,
            'company_id' => $companyId,
            'type' => 'leave_rejected',
            'channel' => 'in_app',
            'title' => 'Congé refusé',
            'body' => $body,
            'status' => 'sent',
            'sent_at' => now(),
            'metadata' => [
                'leave_request_id' => $leaveId,
                'rejection_reason' => $rejectionReason,
                'link' => '/my-leaves',
            ],
        ]);

        $this->info(" [v] Leave rejected notification for user {$userId}");
    }
}
