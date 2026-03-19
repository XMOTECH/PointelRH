<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DailySnapshot extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'snapshot_date',
        'company_id',
        'department_id',
        'total_employees',
        'present_count',
        'late_count',
        'absent_count',
        'excused_count',
        'avg_late_minutes',
        'total_late_minutes',
        'total_work_minutes',
        'total_overtime_minutes',
        'presence_rate',
        'punctuality_rate',
        'last_updated_at',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'last_updated_at' => 'datetime',
    ];
}
