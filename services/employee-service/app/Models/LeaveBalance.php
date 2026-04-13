<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveBalance extends Model
{
    use HasUuids;

    protected $fillable = [
        'employee_id',
        'company_id',
        'leave_type_id',
        'year',
        'allocated',
        'used',
        'pending',
    ];

    protected $casts = [
        'year' => 'integer',
        'allocated' => 'decimal:2',
        'used' => 'decimal:2',
        'pending' => 'decimal:2',
    ];

    protected $appends = ['remaining'];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function getRemainingAttribute(): float
    {
        return round($this->allocated - $this->used - $this->pending, 2);
    }
}
