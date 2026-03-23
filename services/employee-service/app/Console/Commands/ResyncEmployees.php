<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Employee;
use App\Services\RabbitMQService;

class ResyncEmployees extends Command
{
    protected $signature = 'rabbitmq:resync-employees';
    protected $description = 'Broadcast all employees to RabbitMQ to sync other services';

    public function handle(RabbitMQService $rabbitMQ)
    {
        $employees = Employee::all();
        $this->info("Found {$employees->count()} employees to sync.");

        foreach ($employees as $employee) {
            $rabbitMQ->publishEvent('EmployeeCreated', $employee->toArray());
            $this->info("Synced employee: {$employee->email}");
        }

        $this->info("Resync complete!");
        return 0;
    }
}
