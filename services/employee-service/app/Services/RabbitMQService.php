<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQService
{
    private $connection;

    private $channel;

    public function __construct()
    {
        try {
            $this->connection = new AMQPStreamConnection(
                env('RABBITMQ_HOST', 'rabbitmq'),
                env('RABBITMQ_PORT', 5672),
                env('RABBITMQ_USER', 'pointel'),
                env('RABBITMQ_PASSWORD', 'pointel_pass')
            );
            $this->channel = $this->connection->channel();
        } catch (\Exception $e) {
            Log::error('RabbitMQ connection failed: '.$e->getMessage());
        }
    }

    public function publishEvent(string $eventName, array $data, string $exchange = 'employee_events')
    {
        if (! $this->channel) {
            return;
        }

        try {
            // Setup the fanout exchange (all connected consumers will receive it)
            $this->channel->exchange_declare($exchange, 'fanout', false, true, false);

            $payload = json_encode([
                'event' => $eventName,
                'data' => $data,
                'timestamp' => now()->toIso8601String(),
            ]);

            $deliveryMode = defined('PhpAmqpLib\Message\AMQPMessage::DELIVERY_MODE_PERSISTENT')
                ? AMQPMessage::DELIVERY_MODE_PERSISTENT
                : 2;
            $msg = new AMQPMessage($payload, ['delivery_mode' => $deliveryMode]);

            $this->channel->basic_publish($msg, $exchange);
            Log::info("Published $eventName to RabbitMQ");
        } catch (\Exception $e) {
            Log::error('Failed to publish RabbitMQ event: '.$e->getMessage());
        }
    }

    public function __destruct()
    {
        if ($this->channel) {
            $this->channel->close();
        }
        if ($this->connection) {
            $this->connection->close();
        }
    }
}
