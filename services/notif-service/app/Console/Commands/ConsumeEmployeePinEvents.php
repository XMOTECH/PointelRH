<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use App\Services\Channels\SmsChannel;
use App\Dto\NotificationData;

class ConsumeEmployeePinEvents extends Command
{
    protected $signature = 'rabbitmq:consume-pin';
    protected $description = 'Consume employee PIN events and send SMS notifications';

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

            $this->info(" [*] PIN Worker waiting for employee events.");

            $smsChannel = new SmsChannel();

            $callback = function (AMQPMessage $msg) use ($smsChannel) {
                $payload = json_decode($msg->body, true);
                if (!$payload) return;

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                if ($event === 'PinGenerated') {
                    $phone = $data['phone'] ?? null;
                    $pin = $data['pin'] ?? null;
                    $employeeName = $data['employee_name'] ?? 'Employé';
                    $employeeId = $data['employee_id'] ?? '';
                    $companyId = $data['company_id'] ?? '';

                    if ($phone && $pin) {
                        $notificationData = new NotificationData(
                            type: 'pin_generated',
                            recipientId: $employeeId,
                            companyId: $companyId,
                            title: 'Code PIN',
                            body: "PointelRH - Votre code PIN est : {$pin}. Ne le partagez avec personne.",
                            recipientPhone: $phone,
                            metadata: [
                                'employee_name' => $employeeName,
                            ]
                        );

                        $smsChannel->send($notificationData);
                        $this->info(" [v] SMS PIN sent to {$phone} for employee: {$employeeId}");
                    } else {
                        $this->warn(" [!] PinGenerated event missing phone or pin data");
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
