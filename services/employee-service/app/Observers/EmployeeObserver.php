<?php

namespace App\Observers;

use App\Models\Employee;
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
        $rabbitMQ = new \App\Services\RabbitMQService();
        $rabbitMQ->publishEvent('EmployeeCreated', $employee->toArray());
    }

    public function updated(Employee $employee): void
    {
        $rabbitMQ = new \App\Services\RabbitMQService();
        $data = $employee->toArray();
        if ($employee->isDirty('department_id')) {
            $data['old_department_id'] = $employee->getOriginal('department_id');
        }
        $rabbitMQ->publishEvent('EmployeeUpdated', $data);
        
        // Also emit a suspended event if the status changed to inactive
        if ($employee->isDirty('status') && $employee->status === 'inactive') {
            $rabbitMQ->publishEvent('EmployeeSuspended', $employee->toArray());
        }
    }

    public function deleted(Employee $employee): void
    {
        $rabbitMQ = new \App\Services\RabbitMQService();
        $rabbitMQ->publishEvent('EmployeeDeleted', [
            'id' => $employee->id,
            'department_id' => $employee->department_id,
            'company_id' => $employee->company_id,
        ]);
    }
}
