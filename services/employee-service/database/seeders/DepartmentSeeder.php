<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $company_id = '3a655ab3-1c07-404c-8201-a9226aeda728'; // ID fixe pour les tests

        Department::create(['id' => Str::uuid(), 'name' => 'Direction',    'company_id' => $company_id]);
        Department::create(['id' => Str::uuid(), 'name' => 'Commercial',   'company_id' => $company_id]);
        Department::create(['id' => Str::uuid(), 'name' => 'Technique',    'company_id' => $company_id]);
    }
}
