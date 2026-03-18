<?php

namespace App\Events;

use App\Contracts\DomainEvent;
use App\Jobs\PublishDomainEventJob;

class EventPublisher
{
    public function publish(DomainEvent $event): void
    {
        PublishDomainEventJob::dispatch($event)
            ->onConnection('rabbitmq')
            ->onQueue($event->routingKey());
    }
}
