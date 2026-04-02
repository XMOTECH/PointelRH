<?php

declare(strict_types=1);

namespace Tests\Feature\ClockIn;

use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ClockInQrTest extends TestCase
{
    use RefreshDatabase;

    public function test_clock_in_qr_success(): void
    {
        // Freeze time to 08:30 (before schedule start + grace) to ensure PRESENT status
        Carbon::setTestNow(Carbon::today('Africa/Dakar')->setTime(8, 30));

        // Mock Employee Service
        Http::fake([
            '*/employees/resolve-qr' => Http::response([
                'data' => [
                    'employee' => [
                        'id' => 'emp-123',
                        'first_name' => 'John',
                        'last_name' => 'Doe',
                        'email' => 'john@example.com',
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
                'channel' => 'qr',
                'payload' => ['qr_token' => 'valid-token'],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['success', 'data', 'message']);

        $this->assertDatabaseHas('attendances', [
            'employee_id' => 'emp-123',
            'company_id' => $companyId,
            'channel' => 'qr',
            'status' => AttendanceStatus::PRESENT->value,
        ]);
    }
}
