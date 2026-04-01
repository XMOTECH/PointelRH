<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Always seed roles & permissions first
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. System company for the super admin
        $systemCompany = Company::firstOrCreate(
            ['name' => 'Pointel Plateforme'],
            ['plan' => 'enterprise', 'is_active' => true]
        );

        // 3. Super Admin (production-ready, change password after first login)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@pointel.rh'],
            [
                'name'       => 'Super Admin',
                'password'   => 'ChangeMe@2026!',
                'role'       => 'super_admin',
                'company_id' => $systemCompany->id,
                'is_active'  => true,
            ]
        );
        $superAdmin->syncRoles('super_admin');

        // 4. Test company (development/staging only)
        if (app()->environment('local', 'staging', 'testing')) {
            $testCompany = Company::firstOrCreate(
                ['name' => 'Pointel Test Company'],
                ['plan' => 'pro', 'is_active' => true]
            );

            $admin = User::firstOrCreate(
                ['email' => 'admin@test.com'],
                [
                    'name'       => 'Admin Pointel',
                    'password'   => 'password',
                    'role'       => 'admin',
                    'company_id' => $testCompany->id,
                    'is_active'  => true,
                ]
            );
            $admin->syncRoles('admin');

            $testUser = User::firstOrCreate(
                ['email' => 'test@example.com'],
                [
                    'name'       => 'Test User',
                    'password'   => 'password',
                    'role'       => 'employee',
                    'company_id' => $testCompany->id,
                    'is_active'  => true,
                ]
            );
            $testUser->syncRoles('employee');
        }
    }
}
