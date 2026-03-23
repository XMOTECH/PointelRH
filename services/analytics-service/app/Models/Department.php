<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = [
        'id',
        'company_id',
        'employee_count',
    ];

    public $incrementing = false;
    protected $keyType = 'string';
}
