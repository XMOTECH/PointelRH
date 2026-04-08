<?php

namespace App\Models;

use App\Enums\ContractType;
use App\Enums\EmployeeStatus;
use App\Observers\EmployeeObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\FaceDescriptor;
use Illuminate\Support\Facades\Hash;

#[ObservedBy([EmployeeObserver::class])]
class Employee extends Model
{
    use HasUuids;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone',
        'department_id', 'schedule_id', 'contract_type',
        'qr_token', 'pin', 'pin_prefix', 'hire_date', 'status', 'role', 'company_id', 'user_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'pin',
        'pin_prefix',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'status' => EmployeeStatus::class,
        'contract_type' => ContractType::class,
    ];

    /**
     * Hash the PIN before saving and store the prefix for fast lookup.
     */
    protected function setPinAttribute($value)
    {
        if ($value) {
            $this->attributes['pin'] = Hash::make($value);
            $this->attributes['pin_prefix'] = substr($value, 0, 2);
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

    public function scheduleOverrides(): HasMany
    {
        return $this->hasMany(ScheduleOverride::class);
    }

    public function faceDescriptors(): HasMany
    {
        return $this->hasMany(FaceDescriptor::class);
    }

    public function missions(): BelongsToMany
    {
        return $this->belongsToMany(Mission::class, 'mission_assignments')
            ->withPivot(['id', 'status', 'comment', 'assigned_at'])
            ->withTimestamps();
    }

    // ── Full name accessor ─────────────────────────────────
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
