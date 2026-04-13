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
        'leave_type_id',
        'start_date',
        'end_date',
        'reason',
        'status', // pending, approved, rejected, escalated
        'approved_by',
        'approved_at',
        'rejection_reason',
        'attachment_path',
        'half_day',
        'half_day_period', // morning, afternoon
        'days_count',
        'notified_at',
        'escalated_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
        'half_day' => 'boolean',
        'days_count' => 'decimal:2',
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

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'approved_by');
    }
}
