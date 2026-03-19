<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'recipient_id',
        'company_id',
        'type',
        'channel',
        'title',
        'body',
        'status',
        'metadata',
        'read_at',
        'sent_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'read_at' => 'datetime',
        'sent_at' => 'datetime',
    ];
}
