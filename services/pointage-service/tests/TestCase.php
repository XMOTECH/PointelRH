<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
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

        $token = \Firebase\JWT\JWT::encode($payload, config('services.auth.jwt_secret'), 'HS256');

        return $this->withToken($token);
    }
}
