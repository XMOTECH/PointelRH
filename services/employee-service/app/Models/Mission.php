<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Mission extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'company_id',
        'department_id',
        'title',
        'description',
        'location',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'mission_assignments')
            ->using(MissionAssignment::class)
            ->withPivot(['id', 'status', 'comment', 'assigned_at'])
            ->withTimestamps();
    }
}
