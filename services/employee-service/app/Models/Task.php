<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasUuids;

    protected $fillable = [
        'company_id',
        'department_id',
        'mission_id',
        'title',
        'description',
        'priority',
        'status',
        'assigned_to',
        'created_by',
        'due_date',
        'recurrence',
        'estimated_minutes',
        'actual_minutes',
        'completed_at',
        'parent_task_id',
        'dependency_task_id',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'estimated_minutes' => 'integer',
        'actual_minutes' => 'integer',
    ];

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function dependency(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'dependency_task_id');
    }

    public function isBlocked(): bool
    {
        if (!$this->dependency_task_id) return false;
        return $this->dependency->status !== 'done';
    }
}
