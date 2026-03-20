<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\AttendanceStatus;

class Attendance extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'employee_id',
        'employee_name',
        'company_id',
        'department_id',
        'channel',
        'checked_in_at',
        'checked_out_at',
        'work_date',
        'late_minutes',
        'work_minutes',
        'overtime_minutes',
        'status',
        'latitude',
        'longitude',
        'metadata',
    ];

    protected $casts = [
        'checked_in_at'  => 'datetime',
        'checked_out_at' => 'datetime',
        'work_date'      => 'date',
        'status'         => AttendanceStatus::class,
        'metadata'       => 'array',
        'late_minutes'   => 'integer',
        'work_minutes'   => 'integer',
        'overtime_minutes' => 'integer',
    ];

    public function isLate(): bool
    {
        return $this->late_minutes > 0;
    }

    public function hasCheckedOut(): bool
    {
        return !is_null($this->checked_out_at);
    }
}
