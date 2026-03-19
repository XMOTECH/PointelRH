<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;

class EmployeeNotificationController extends Controller
{
    public function getNotificationContext(string $employeeId): JsonResponse
    {
        $employee = Employee::with(['department', 'company'])->findOrFail($employeeId);
        
        // In a real app, we'd find the manager of the department
        // For this demo, we'll assume the first employee with 'manager' role in the same company/dept
        // or just return some mock data if not found.
        
        return response()->json([
            'data' => [
                'employee_name' => $employee->first_name . ' ' . $employee->last_name,
                'manager_id' => '00000000-0000-0000-0000-000000000001', // Mock
                'manager_name' => 'Jean Dupont',
                'manager_email' => 'manager@pointel.sn',
                'manager_phone' => '221770000000',
                'manager_preferences' => [
                    'email_enabled' => true,
                    'whatsapp_enabled' => true,
                    'inapp_enabled' => true,
                    'quiet_hours_start' => '22:00:00',
                    'quiet_hours_end' => '06:00:00',
                ]
            ]
        ]);
    }
}
