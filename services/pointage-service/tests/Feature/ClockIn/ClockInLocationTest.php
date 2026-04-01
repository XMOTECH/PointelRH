<?php

namespace Tests\Feature\ClockIn;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ClockInLocationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock constant response for Employee resolved from JWT (with 'data' wrapper)
        Http::fake([
            '*/employees/emp-123' => Http::response([
                'data' => [
                    'id' => 'emp-123',
                    'first_name' => 'John',
                    'last_name' => 'Doe',
                    'company_id' => 'comp-123',
                    'department_id' => 'dept-456',
                    'schedule' => [
                        'start_time' => '09:00:00',
                        'grace_minutes' => 15,
                        'work_days' => [1, 2, 3, 4, 5],
                        'timezone' => 'Africa/Dakar',
                    ],
                ],
            ], 200),
        ]);
    }

    public function test_clock_in_location_success(): void
    {
        // Mock both Location and Employee details (with 'data' wrapper manually)
        Http::fake([
            '*/locations/resolve/valid-wall-token' => Http::response([
                'data' => [
                    'location' => [
                        'id' => 'loc-abc',
                        'name' => 'Entrepôt A',
                        'latitude' => 14.7167,
                        'longitude' => -17.4677,
                        'radius_meters' => 100,
                    ],
                ],
            ], 200),
            '*/employees/emp-123' => Http::response([
                'data' => [
                    'id' => 'emp-123',
                    'first_name' => 'John',
                    'last_name' => 'Doe',
                    'company_id' => 'comp-123',
                    'department_id' => 'dept-456',
                    'schedule' => [
                        'start_time' => '09:00:00',
                        'grace_minutes' => 15,
                        'work_days' => [1, 2, 3, 4, 5],
                        'timezone' => 'Africa/Dakar',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAsCompany('comp-123', 'emp-123')
            ->postJson('/api/pointage/clock-in', [
                'channel' => 'qr_location',
                'payload' => [
                    'location_token' => 'valid-wall-token',
                    'latitude' => 14.7168, // Very close
                    'longitude' => -17.4678,
                ],
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('attendances', [
            'employee_id' => 'emp-123',
            'location_id' => 'loc-abc',
            'channel' => 'qr_location',
        ]);
    }

    public function test_clock_in_location_too_far(): void
    {
        Http::fake([
            '*/locations/resolve/valid-wall-token' => Http::response([
                'data' => [
                    'location' => [
                        'id' => 'loc-abc',
                        'latitude' => 14.7167,
                        'longitude' => -17.4677,
                        'radius_meters' => 100,
                    ],
                ],
            ], 200),
            '*/employees/emp-123' => Http::response([
                'data' => ['id' => 'emp-123'],
            ], 200),
        ]);

        $response = $this->actingAsCompany('comp-123', 'emp-123')
            ->postJson('/api/pointage/clock-in', [
                'channel' => 'qr_location',
                'payload' => [
                    'location_token' => 'valid-wall-token',
                    'latitude' => 15.0, // Over 30km away
                    'longitude' => -17.0,
                ],
            ]);

        $response->assertStatus(404);
        $response->assertJsonFragment(['error' => 'Vous êtes trop loin du point de passage (59322.03m > 100m).']);
    }

    public function test_clock_in_location_missing_gps(): void
    {
        Http::fake([
            '*/locations/resolve/valid-wall-token' => Http::response([
                'data' => ['location' => ['id' => 'loc-abc']],
            ], 200),
            '*/employees/emp-123' => Http::response(['data' => ['id' => 'emp-123']], 200),
        ]);

        $response = $this->actingAsCompany('comp-123', 'emp-123')
            ->postJson('/api/pointage/clock-in', [
                'channel' => 'qr_location',
                'payload' => [
                    'location_token' => 'valid-wall-token',
                    // Missing lat/lng
                ],
            ]);

        $response->assertStatus(404);
        $response->assertJsonFragment(['error' => 'Coordonnées GPS manquantes.']);
    }
}
