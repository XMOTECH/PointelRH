<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'manager_id',
        'parent_id',
        'location',
        'company_id',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
