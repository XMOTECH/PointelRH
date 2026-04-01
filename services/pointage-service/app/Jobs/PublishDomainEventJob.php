<?php

namespace App\Jobs;

use App\Contracts\DomainEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PublishDomainEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly DomainEvent $event
    ) {}

    public function handle(): void
    {
        // Dans une architecture complète avec RabbitMQ driver,
        // le simple fait que ce job soit sur la queue 'rabbitmq' avec la bonne routing key
        // suffit à l'envoyer. Si on veut manipuler directement le channel AMQP,
        // on le ferait ici, mais le driver vladimir-yuldashev fait le pont.

        // Note: Le driver RabbitMQ de Vladimir Yuldashev utilise le nom de la queue
        // comme routing key par défaut si on n'utilise pas les échanges.
    }
}
