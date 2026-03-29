<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class LinkUsersToEmployees extends Command
{
    protected $signature = 'employees:link-users';
    protected $description = 'Auto-link all employees to their auth-service user accounts by matching email addresses';

    public function handle(): int
    {
        $this->info('🔗 Linking employees to user accounts...');

        // Get all employees (with or without user_id)
        $employees = Employee::all();
        $linked = 0;
        $skipped = 0;
        $notFound = 0;

        foreach ($employees as $employee) {
            if ($employee->user_id) {
                $this->line("  ⏭  {$employee->email} — already linked (user_id: {$employee->user_id})");
                $skipped++;
                continue;
            }

            if (!$employee->email) {
                $this->warn("  ⚠  Employee {$employee->id} has no email, skipping.");
                $notFound++;
                continue;
            }

            // Call auth-service internally to find user by email
            try {
                $response = Http::get('http://auth-service/api/auth/users/by-email', [
                    'email' => $employee->email,
                ]);

                if ($response->successful()) {
                    $userData = $response->json('data') ?? $response->json();
                    $userId = $userData['id'] ?? null;

                    if ($userId) {
                        $employee->user_id = $userId;
                        $employee->save();
                        $this->info("  ✅ {$employee->email} → linked to user {$userId}");
                        $linked++;
                        continue;
                    }
                }
            } catch (\Exception $e) {
                // HTTP call failed, try direct DB fallback
            }

            // Fallback: try direct DB query on auth-db
            try {
                $user = \Illuminate\Support\Facades\DB::connection('auth_db')
                    ->table('users')
                    ->where('email', $employee->email)
                    ->first();

                if ($user) {
                    $employee->user_id = $user->id;
                    $employee->save();
                    $this->info("  ✅ {$employee->email} → linked to user {$user->id} (via DB)");
                    $linked++;
                    continue;
                }
            } catch (\Exception $e) {
                // DB connection unavailable
            }

            $this->warn("  ❌ {$employee->email} — no matching user found");
            $notFound++;
        }

        $this->newLine();
        $this->info("📊 Results: {$linked} linked, {$skipped} already linked, {$notFound} no match");
        return 0;
    }
}
