<?php

declare(strict_types=1);

namespace Tests;

use App\Events\EventPublisher;
use App\Services\RabbitMQService;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Prevent RabbitMQ connection timeouts during tests by mocking the services
        $this->mock(RabbitMQService::class, function ($mock) {
            $mock->shouldReceive('publishEvent')->andReturnNull();
        });

        $this->mock(EventPublisher::class, function ($mock) {
            $mock->shouldReceive('publish')->andReturnNull();
        });
    }

    /**
     * Generate a valid JWT for the given company and employee.
     */
    protected function actingAsCompany(string $companyId = 'comp-123', string $userId = 'user-456'): self
    {
        $payload = [
            'sub' => $userId,
            'company_id' => $companyId,
            'role' => 'employee',
            'permissions' => [],
            'iat' => time(),
            'exp' => time() + 3600,
        ];

        $token = JWT::encode($payload, config('services.auth.jwt_secret'), 'HS256');

        return $this->withToken($token);
    }
}
