<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use App\Observers\EmployeeObserver;

#[ObservedBy([EmployeeObserver::class])]
class Employee extends Model
{
    use HasUuids;
 
    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone',
        'department_id', 'schedule_id', 'contract_type',
        'qr_token', 'pin', 'hire_date', 'status', 'company_id', 'user_id',
    ];
 
    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'pin',
    ];

    protected $casts = [
        'hire_date'     => 'date',
        'status'        => \App\Enums\EmployeeStatus::class,
        'contract_type' => \App\Enums\ContractType::class,
    ];

    /**
     * Hash the PIN before saving.
     */
    protected function setPinAttribute($value)
    {
        if ($value) {
            $this->attributes['pin'] = \Illuminate\Support\Facades\Hash::make($value);
        }
    }

    // ── Relations ──────────────────────────────────────────
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
 
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }
 
    // ── Full name accessor ─────────────────────────────────
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
