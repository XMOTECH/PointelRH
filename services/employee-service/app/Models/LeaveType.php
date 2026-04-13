<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id',
        'name',
        'max_days_per_year',
        'requires_attachment',
        'paid',
        'color',
        'is_active',
    ];

    protected $casts = [
        'max_days_per_year' => 'integer',
        'requires_attachment' => 'boolean',
        'paid' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
