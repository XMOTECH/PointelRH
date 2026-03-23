<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    use HasUuids;

    protected $fillable = [
        'employee_id',
        'company_id',
        'department_id',
        'leave_type',
        'start_date',
        'end_date',
        'reason',
        'status', // pending, approved, rejected, escalated
        'notified_at',
        'escalated_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'notified_at' => 'datetime',
        'escalated_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
