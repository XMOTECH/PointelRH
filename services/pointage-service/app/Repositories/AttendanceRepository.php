<?php

namespace App\Repositories;

use App\Models\Attendance;
use Carbon\Carbon;

class AttendanceRepository
{
    public function existsForToday(string $employeeId): bool
    {
        return Attendance::where('employee_id', $employeeId)
            ->where('work_date', Carbon::today())
            ->exists();
    }

    public function create(array $data): Attendance
    {
        return Attendance::create($data);
    }
}
