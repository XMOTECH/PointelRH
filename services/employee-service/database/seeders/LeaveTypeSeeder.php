<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use App\Models\Employee;
use App\Models\LeaveBalance;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = '3a655ab3-1c07-404c-8201-a9226aeda728';

        $types = [
            ['name' => 'Congés Payés',       'max_days_per_year' => 25,   'requires_attachment' => false, 'paid' => true,  'color' => '#10B981'],
            ['name' => 'RTT',                 'max_days_per_year' => 10,   'requires_attachment' => false, 'paid' => true,  'color' => '#3B82F6'],
            ['name' => 'Maladie',             'max_days_per_year' => null, 'requires_attachment' => true,  'paid' => true,  'color' => '#EF4444'],
            ['name' => 'Sans Solde',          'max_days_per_year' => null, 'requires_attachment' => false, 'paid' => false, 'color' => '#6B7280'],
            ['name' => 'Événement Familial',  'max_days_per_year' => 5,    'requires_attachment' => false, 'paid' => true,  'color' => '#8B5CF6'],
        ];

        $createdTypes = [];
        foreach ($types as $type) {
            $createdTypes[] = LeaveType::firstOrCreate(
                ['company_id' => $companyId, 'name' => $type['name']],
                array_merge($type, ['company_id' => $companyId])
            );
        }

        // Allouer les soldes pour chaque employé de cette company (année courante)
        $year = now()->year;
        $employees = Employee::where('company_id', $companyId)->get();

        foreach ($employees as $employee) {
            foreach ($createdTypes as $leaveType) {
                if ($leaveType->max_days_per_year === null) {
                    continue; // Pas de solde pour les types illimités
                }

                LeaveBalance::firstOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'leave_type_id' => $leaveType->id,
                        'year' => $year,
                    ],
                    [
                        'company_id' => $companyId,
                        'allocated' => $leaveType->max_days_per_year,
                        'used' => 0,
                        'pending' => 0,
                    ]
                );
            }
        }
    }
}
