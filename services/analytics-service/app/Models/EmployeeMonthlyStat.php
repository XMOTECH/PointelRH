<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployeeMonthlyStat extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'employee_id',
        'company_id',
        'month',
        'year',
        'present_days',
        'absent_days',
        'late_days',
        'total_late_minutes',
        'total_work_minutes',
        'overtime_minutes',
        'leave_days',
    ];
}
