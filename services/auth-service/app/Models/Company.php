<?php

namespace App\Models;

use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    /** @use HasFactory<CompanyFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'plan',
        'is_active',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
