<?php

namespace Tests\Feature\ClockIn;

use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClockInPinTest extends TestCase
{
    use RefreshDatabase;

    public function test_clock_in_pin_success(): void
    {
        // Mocking the DriverResolver or the PinDriver logic
        // Since PinDriver is currently a placeholder, it might just return a dummy employee

        $companyId = 'comp-123';

        $response = $this->actingAsCompany($companyId)
            ->postJson('/api/clock-in', [
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
