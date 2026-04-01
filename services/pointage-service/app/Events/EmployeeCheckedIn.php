<?php

namespace App\Events;

use App\Contracts\DomainEvent;
use App\Models\Attendance;
use App\Services\DTOs\Employee;

class EmployeeCheckedIn implements DomainEvent
{
    public function __construct(
        public readonly Attendance $attendance,
        public readonly Employee $employee,
    ) {}

    public function routingKey(): string
    {
        return 'attendance.checkin';
    }

    public function toArray(): array
    {
        return [
            'event' => 'EmployeeCheckedIn',
            'employee_id' => $this->attendance->employee_id,
            'company_id' => $this->attendance->company_id,
            'department_id' => $this->attendance->department_id,
            'channel' => $this->attendance->channel,
            'checked_in_at' => $this->attendance->checked_in_at->toIso8601String(),
            'late_minutes' => $this->attendance->late_minutes,
            'status' => $this->attendance->status->value,
            'employee_name' => $this->employee->first_name.' '.$this->employee->last_name,
            'published_at' => now()->toIso8601String(),
        ];
    }
}
