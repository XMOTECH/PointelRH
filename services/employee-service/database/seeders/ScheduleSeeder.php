<?php

namespace Database\Seeders;

use App\Models\Schedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $company_id = '3a655ab3-1c07-404c-8201-a9226aeda728';

        Schedule::create(['id' => Str::uuid(), 'name' => 'Standard 9h-17h',
            'work_days' => [1, 2, 3, 4, 5],
            'start_time' => '09:00:00', 'end_time' => '17:00:00',
            'grace_minutes' => 10, 'timezone' => 'Africa/Dakar',
            'company_id' => $company_id]);

        Schedule::create(['id' => Str::uuid(), 'name' => 'Tôt 8h-16h',
            'work_days' => [1, 2, 3, 4, 5],
            'start_time' => '08:00:00', 'end_time' => '16:00:00',
            'grace_minutes' => 5, 'timezone' => 'Africa/Dakar',
            'company_id' => $company_id]);

        Schedule::create(['id' => Str::uuid(), 'name' => 'Décalé 10h-18h',
            'work_days' => [1, 2, 3, 4, 5],
            'start_time' => '10:00:00', 'end_time' => '18:00:00',
            'grace_minutes' => 15, 'timezone' => 'Africa/Dakar',
            'company_id' => $company_id]);
    }
}
