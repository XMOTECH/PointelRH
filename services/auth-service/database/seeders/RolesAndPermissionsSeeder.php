<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions granulaires
        $permissions = [
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
            'attendance.view', 'attendance.create', 'attendance.edit',
            'analytics.view', 'reports.export',
            'leaves.view', 'leaves.approve', 'leaves.manage',
            'company.settings',
        ];
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Super Admin — tout
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin — gère son entreprise
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->givePermissionTo([
            'employees.view','employees.create','employees.edit',
            'attendance.view','analytics.view','reports.export',
            'leaves.view','leaves.approve','leaves.manage','company.settings',
        ]);

        // Manager — son département uniquement
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->givePermissionTo([
            'employees.view','attendance.view','analytics.view',
            'leaves.view','leaves.approve',
        ]);

        // Employee — ses propres données
        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->givePermissionTo([
            'attendance.create','leaves.view',
        ]);

        // Créer un admin de test
        $company = Company::create(['id' => Str::uuid(), 'name' => 'PME Test', 'plan' => 'pro']);
        $user = User::create([
            'id' => Str::uuid(), 
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'company_id' => $company->id, 
            'role' => 'admin', 
            'is_active' => true,
        ]);
        $user->assignRole('admin');
    }
}
