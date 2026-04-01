<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Structure seeder only: roles & permissions.
     * No test data here — that belongs in DatabaseSeeder.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ── Permissions granulaires ──────────────────────────
        $permissions = [
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
            'attendance.view', 'attendance.create', 'attendance.edit',
            'analytics.view', 'reports.export',
            'leaves.view', 'leaves.approve', 'leaves.manage',
            'company.settings',
            'platform.manage', // super admin: gestion de la plateforme
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'api']);
        }

        // ── Super Admin — tout ───────────────────────────────
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'api']);
        $superAdmin->syncPermissions(Permission::all());

        // ── Admin — gère son entreprise ──────────────────────
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $admin->syncPermissions([
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
            'attendance.view', 'attendance.edit',
            'analytics.view', 'reports.export',
            'leaves.view', 'leaves.approve', 'leaves.manage',
            'company.settings',
        ]);

        // ── Manager — son département ────────────────────────
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'api']);
        $manager->syncPermissions([
            'employees.view',
            'attendance.view',
            'analytics.view',
            'leaves.view', 'leaves.approve',
        ]);

        // ── Employee — ses propres données ───────────────────
        $employee = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'api']);
        $employee->syncPermissions([
            'attendance.create',
            'leaves.view',
        ]);
    }
}
