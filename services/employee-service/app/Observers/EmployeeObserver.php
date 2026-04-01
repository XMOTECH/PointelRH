<?php

namespace App\Observers;

use App\Enums\EmployeeStatus;
use App\Models\Employee;
use App\Services\RabbitMQService;
use Illuminate\Support\Str;

class EmployeeObserver
{
    public function creating(Employee $employee): void
    {
        // Génère un QR token UUID unique garanti
        if (empty($employee->qr_token)) {
            do {
                $token = (string) Str::uuid();
            } while (Employee::where('qr_token', $token)->exists());

            $employee->qr_token = $token;
        }
    }

    public function created(Employee $employee): void
    {
        app(RabbitMQService::class)->publishEvent('EmployeeCreated', $employee->toArray());
    }

    public function updated(Employee $employee): void
    {
        $rabbitMQ = app(RabbitMQService::class);
        $data = $employee->toArray();
        if ($employee->isDirty('department_id')) {
            $data['old_department_id'] = $employee->getOriginal('department_id');
        }
        $rabbitMQ->publishEvent('EmployeeUpdated', $data);

        // Also emit a suspended event if the status changed to inactive/suspended
        if ($employee->isDirty('status') &&
            ($employee->status === EmployeeStatus::INACTIVE || $employee->status === EmployeeStatus::SUSPENDED)) {
            $rabbitMQ->publishEvent('EmployeeSuspended', $employee->toArray());
        }
    }

    public function deleted(Employee $employee): void
    {
        app(RabbitMQService::class)->publishEvent('EmployeeDeleted', [
            'id' => $employee->id,
            'department_id' => $employee->department_id,
            'company_id' => $employee->company_id,
        ]);
    }
}
