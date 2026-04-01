<?php

namespace App\Events;

use App\Contracts\DomainEvent;
use App\Models\Attendance;
use App\Services\DTOs\Employee;

class LateArrivalDetected implements DomainEvent
{
    public function __construct(
        public readonly Attendance $attendance,
        public readonly Employee $employee,
        public readonly int $lateMinutes
    ) {}

    public function routingKey(): string
    {
        return 'attendance.late';
    }

    public function toArray(): array
    {
        return [
            'event' => 'LateArrivalDetected',
            'employee_id' => $this->attendance->employee_id,
            'company_id' => $this->attendance->company_id,
            'late_minutes' => $this->lateMinutes,
            'expected_time' => $this->employee->schedule['start_time'],
            'actual_time' => $this->attendance->checked_in_at->toIso8601String(),
            'published_at' => now()->toIso8601String(),
        ];
    }
}
