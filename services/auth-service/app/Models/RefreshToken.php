<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RefreshToken extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'token',
        'device',
        'expires_at',
        'revoked_at',
    ];

    protected $casts = [
        'revoked_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
