<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Créer une entreprise par défaut (exactement celle attendue par l'Employee Service)
        $companyId = '3a655ab3-1c07-404c-8201-a9226aeda728';
        
        $company = Company::firstOrCreate(
            ['id' => $companyId],
            ['name' => 'Pointel Test Company']
        );

        // 2. Créer l'utilisateur Admin
        User::updateOrCreate(
            ['email' => 'admin@test.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Admin Pointel',
                'password' => Hash::make('password'),
                'company_id' => $company->id,
                'role' => 'admin',
                'is_active' => true
            ]
        );

        // 3. Créer Optionnellement un utilisateur test générique via factory
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'company_id' => $company->id,
            'role' => 'employee'
        ]);
    }
}
