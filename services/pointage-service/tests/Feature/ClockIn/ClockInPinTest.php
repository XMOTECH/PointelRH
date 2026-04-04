<?php

declare(strict_types=1);

namespace Tests\Feature\ClockIn;

use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ClockInPinTest extends TestCase
{
    use RefreshDatabase;

    public function test_clock_in_pin_success(): void
    {
        // Freeze time to a Wednesday at 08:30 (before schedule start + grace) to ensure PRESENT status
        Carbon::setTestNow(Carbon::parse('next wednesday', 'Africa/Dakar')->setTime(8, 30));

        // Mocking the PinDriver Http lookup
        Http::fake([
            '*/employees/resolve-pin' => Http::response([
                'data' => [
                    'employee' => [
                        'id' => 'emp-pin-123',
                        'first_name' => 'John',
                        'last_name' => 'Pin',
                        'company_id' => 'comp-123',
                        'department_id' => 'dept-456',
                    ],
                    'schedule' => [
                        'id' => 'sch-123',
                        'start_time' => '09:00:00',
                        'grace_minutes' => 15,
                        'work_days' => [1, 2, 3, 4, 5],
                        'timezone' => 'Africa/Dakar',
                    ],
                ],
            ], 200),
        ]);

        $companyId = 'comp-123';

        $response = $this->actingAsCompany($companyId)
            ->postJson('/api/pointage/clock-in', [
                'channel' => 'pin',
                'payload' => ['pin' => '1234'],
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('attendances', [
            'employee_id' => 'emp-pin-123',
            'company_id' => $companyId,
            'channel' => 'pin',
            'status' => AttendanceStatus::PRESENT->value,
        ]);
    }
}
