<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RabbitMQService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Create a new user (Usually called by employee-service or a BFF orchestrator)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email'       => 'required|email|unique:users,email',
            'name'        => 'required|string|max:255',
            'role'        => 'required|string|in:admin,manager,employee',
            'company_id'  => 'required|uuid',
            'employee_id' => 'required|uuid', // Essential for the 1:1 mapping
        ]);

        // Generate a random temporary password if not provided
        $password = Str::random(12);

        $user = User::create([
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'password'    => Hash::make($password),
            'role'        => $validated['role'],
            'company_id'  => $validated['company_id'],
            'employee_id' => $validated['employee_id'],
            'is_active'   => true,
        ]);

        // Assign Spatie role
        try {
            $user->assignRole($validated['role']);
        } catch (\Exception $e) {
            // Ignore if role doesn't exist, though it should be seeded
        }

        // Publish event to send credentials by email
        try {
            $rabbitMQ = new RabbitMQService();
            $rabbitMQ->publishEvent('UserCreated', [
                'employee_id' => $validated['employee_id'],
                'employee_name' => $validated['name'],
                'email' => $validated['email'],
                'temp_password' => $password,
                'company_id' => $validated['company_id'],
            ]);
        } catch (\Exception $e) {
            // Non-blocking: credentials email failure shouldn't fail user creation
            \Illuminate\Support\Facades\Log::warning('Failed to publish UserCreated event: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data'    => [
                'id'            => $user->id,
                'email'         => $user->email,
                'employee_id'   => $user->employee_id,
                'temp_password' => $password,
            ]
        ], 201);
    }
}
