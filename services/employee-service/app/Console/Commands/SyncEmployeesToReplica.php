<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Services\RabbitMQService;
use Illuminate\Console\Command;

class SyncEmployeesToReplica extends Command
{
    protected $signature = 'employees:sync-to-pointage';

    protected $description = 'Re-publish all employees to RabbitMQ to re-populate employees_replica in pointage-service';

    public function handle(): int
    {
        $employees = Employee::all();
        $rabbitMQ = new RabbitMQService;
        $count = 0;

        $this->info("Syncing {$employees->count()} employees to RabbitMQ...");

        foreach ($employees as $employee) {
            $rabbitMQ->publishEvent('EmployeeCreated', $employee->toArray());
            $count++;
            $this->line("  ✔ Published employee {$employee->id} ({$employee->first_name} {$employee->last_name})");
        }

        $this->info("Done. {$count} employees published.");

        return 0;
    }
}
