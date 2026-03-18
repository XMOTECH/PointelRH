<?php

namespace Tests\Unit\Domain;

use PHPUnit\Framework\TestCase;
use App\Domain\LateMatcher;
use Carbon\Carbon;

class LateMatcherTest extends TestCase
{
    // Cas 1 : a l'heure exacte
    public function test_employee_on_time_returns_zero(): void
    {
        $clockIn = Carbon::parse('2024-01-15 09:00:00', 'Africa/Dakar');
        $this->assertEquals(0, LateMatcher::calculate($clockIn, '09:00:00', graceMinutes: 0));
    }
 
    // Cas 2 : dans la tolerance grace_minutes
    public function test_within_grace_period_returns_zero(): void
    {
        $clockIn = Carbon::parse('2024-01-15 09:08:00', 'Africa/Dakar');
        $this->assertEquals(0, LateMatcher::calculate($clockIn, '09:00:00', graceMinutes: 10),
            '8 min dans une grace de 10 min → pas de retard');
    }
 
    // Cas 3 : retard reel apres grace
    public function test_late_arrival_calculates_correct_minutes(): void
    {
        $clockIn = Carbon::parse('2024-01-15 09:25:00', 'Africa/Dakar');
        $this->assertEquals(15, LateMatcher::calculate($clockIn, '09:00:00', graceMinutes: 10),
            '25min - grace(10min) = 15 min de retard');
    }
 
    // Cas 4 : retard important
    public function test_very_late_arrival(): void
    {
        $clockIn = Carbon::parse('2024-01-15 11:00:00', 'Africa/Dakar');
        $this->assertEquals(115, LateMatcher::calculate($clockIn, '09:00:00', graceMinutes: 5));
    }
 
    // Cas 5 : arrive avant l'heure — jamais negatif
    public function test_early_arrival_returns_zero(): void
    {
        $clockIn = Carbon::parse('2024-01-15 08:45:00', 'Africa/Dakar');
        $this->assertEquals(0, LateMatcher::calculate($clockIn, '09:00:00', graceMinutes: 0));
    }
 
    // Cas 6 : dimanche n'est pas un jour de travail
    public function test_sunday_is_not_a_work_day(): void
    {
        $sunday = Carbon::parse('2024-01-14');  // dimanche
        $this->assertFalse(LateMatcher::isWorkDay($sunday, [1,2,3,4,5]));
    }
}
