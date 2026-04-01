<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Schedule extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'work_days', 'start_time', 'end_time',
        'grace_minutes', 'timezone', 'company_id',
    ];

    protected $casts = [
        'work_days' => 'array',    // JSON [1,2,3,4,5] → array PHP
        'start_time' => 'string',
        'end_time' => 'string',
        'grace_minutes' => 'integer',
    ];

    // Vérifie si un jour donné est un jour de travail (1=lundi, 7=dimanche)
    public function isWorkDay(int $dayOfWeek): bool
    {
        return in_array($dayOfWeek, $this->work_days);
    }

    // Calcule les minutes de retard pour une heure de pointage donnée
    public function lateMinutes(Carbon $clockIn): int
    {
        $expected = Carbon::parse($this->start_time)
            ->addMinutes($this->grace_minutes);

        return max(0, $clockIn->diffInMinutes($expected, false) * -1);
    }
}
