<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Schedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $company_id = '3a655ab3-1c07-404c-8201-a9226aeda728';
        $depts = Department::where('company_id', $company_id)->get();
        $schedules = Schedule::where('company_id', $company_id)->get();

        $employees = [
            // Direction
            ['first_name' => 'Amadou',  'last_name' => 'Diallo',   'email' => 'amadou@pointel.sn',  'dept' => 0, 'sched' => 0],
            ['first_name' => 'Fatou',   'last_name' => 'Sow',      'email' => 'fatou@pointel.sn',   'dept' => 0, 'sched' => 0],
            ['first_name' => 'Moussa',  'last_name' => 'Ba',       'email' => 'moussa@pointel.sn',  'dept' => 0, 'sched' => 2],
            // Commercial
            ['first_name' => 'Aissatou', 'last_name' => 'Diop',     'email' => 'aissatou@pointel.sn', 'dept' => 1, 'sched' => 0],
            ['first_name' => 'Ibrahima', 'last_name' => 'Ndiaye',   'email' => 'ibrahima@pointel.sn', 'dept' => 1, 'sched' => 0],
            ['first_name' => 'Mariama', 'last_name' => 'Balde',    'email' => 'mariama@pointel.sn', 'dept' => 1, 'sched' => 1],
            ['first_name' => 'Ousmane', 'last_name' => 'Camara',   'email' => 'ousmane@pointel.sn', 'dept' => 1, 'sched' => 0],
            ['first_name' => 'Rokhaya', 'last_name' => 'Fall',     'email' => 'rokhaya@pointel.sn', 'dept' => 1, 'sched' => 2],
            // Technique
            ['first_name' => 'Cheikh',  'last_name' => 'Gueye',    'email' => 'cheikh@pointel.sn',  'dept' => 2, 'sched' => 1],
            ['first_name' => 'Dieynaba', 'last_name' => 'Kouyate',  'email' => 'dieynaba@pointel.sn', 'dept' => 2, 'sched' => 0],
            ['first_name' => 'Elhadji', 'last_name' => 'Mbaye',    'email' => 'elhadji@pointel.sn', 'dept' => 2, 'sched' => 1],
            ['first_name' => 'Gnagna',  'last_name' => 'Mendy',    'email' => 'gnagna@pointel.sn',  'dept' => 2, 'sched' => 2],
            ['first_name' => 'Hamidou', 'last_name' => 'Thiaw',    'email' => 'hamidou@pointel.sn', 'dept' => 2, 'sched' => 1],
            ['first_name' => 'Awa',     'last_name' => 'Sarr',     'email' => 'awa@pointel.sn',     'dept' => 2, 'sched' => 0],
            ['first_name' => 'Babacar', 'last_name' => 'Toure',    'email' => 'babacar@pointel.sn', 'dept' => 2, 'sched' => 2],
        ];

        foreach ($employees as $data) {
            Employee::create([
                'id' => (string) Str::uuid(),
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'department_id' => $depts[$data['dept']]->id,
                'schedule_id' => $schedules[$data['sched']]->id,
                'contract_type' => 'cdi',
                'hire_date' => now()->subMonths(rand(3, 36)),
                'status' => 'active',
                'company_id' => $company_id,
                // qr_token généré automatiquement par l'Observer
            ]);
        }
    }
}
