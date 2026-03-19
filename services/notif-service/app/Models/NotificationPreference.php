<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NotificationPreference extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'employee_id',
        'notification_type',
        'email_enabled',
        'whatsapp_enabled',
        'inapp_enabled',
        'quiet_hours_start',
        'quiet_hours_end',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'whatsapp_enabled' => 'boolean',
        'inapp_enabled' => 'boolean',
    ];
}
