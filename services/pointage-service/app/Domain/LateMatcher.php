<?php

namespace App\Domain;

use Carbon\Carbon;

final class LateMatcher
{
    public static function calculate(
        Carbon $clockIn,
        string $startTime,
        int $graceMinutes,
        string $timezone = 'Africa/Dakar'
    ): int {
        $expected = Carbon::parse($startTime, $timezone)
            ->setDate($clockIn->year, $clockIn->month, $clockIn->day)
            ->addMinutes($graceMinutes);

        // Si dans la tolerance → retard = 0, jamais negatif
        if ($clockIn->lte($expected)) {
            return 0;
        }

        return (int) $clockIn->diffInMinutes($expected, true);
    }

    public static function isWorkDay(Carbon $date, array $workDays): bool
    {
        // Carbon ISO-8601 : 1=lundi, 7=dimanche
        return in_array($date->dayOfWeekIso, $workDays);
    }
}
