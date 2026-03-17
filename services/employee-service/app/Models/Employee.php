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
        'qr_token', 'hire_date', 'status', 'company_id',
    ];
 
    protected $casts = [
        'hire_date' => 'date',
    ];
 
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
