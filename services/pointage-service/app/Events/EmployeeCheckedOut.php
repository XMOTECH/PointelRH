<?php

namespace App\Events;

use App\Contracts\DomainEvent;
use App\Models\Attendance;

class EmployeeCheckedOut implements DomainEvent
{
    public function __construct(
        public readonly Attendance $attendance,
    ) {}

    public function routingKey(): string
    {
        return 'attendance.checkout';
    }

    public function toArray(): array
    {
        return [
            'event' => 'EmployeeCheckedOut',
            'employee_id' => $this->attendance->employee_id,
            'company_id' => $this->attendance->company_id,
            'department_id' => $this->attendance->department_id,
            'work_minutes' => $this->attendance->work_minutes,
            'overtime_minutes' => $this->attendance->overtime_minutes,
            'checked_out_at' => $this->attendance->checked_out_at->toIso8601String(),
            'published_at' => now()->toIso8601String(),
        ];
    }
}
