<?php

namespace App\Observers;

use App\Models\Employee;
use Illuminate\Support\Str;

class EmployeeObserver
{
    public function creating(Employee $employee): void
    {
        // Génère un QR token UUID unique garanti
        if (empty($employee->qr_token)) {
            do {
                $token = (string) Str::uuid();
            } while (Employee::where('qr_token', $token)->exists());
 
            $employee->qr_token = $token;
        }
    }
}
