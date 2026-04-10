<?php

namespace App\Http\Controllers\Api;

use App\Models\Employee;
use App\Services\LoggingService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class EmployeeNotificationController extends BaseApiController
{
    /**
     * Récupérer le contexte de notification pour un employé
     * Inclut les infos du manager et ses préférences
     */
    public function getNotificationContext(string $employeeId): JsonResponse
    {
        try {
            $employee = Employee::with('department')->findOrFail($employeeId);

            // Chercher le manager du meme departement ou de la meme entreprise
            $manager = Employee::where('company_id', $employee->company_id)
                ->where('role', 'manager')
                ->where('status', 'active')
                ->when($employee->department_id, function ($q) use ($employee) {
                    $q->where('department_id', $employee->department_id);
                })
                ->first();

            // Si pas de manager dans le departement, chercher un admin
            if (! $manager) {
                $manager = Employee::where('company_id', $employee->company_id)
                    ->where('role', 'admin')
                    ->where('status', 'active')
                    ->first();
            }

            return $this->respondSuccess([
                'employee_name' => $employee->first_name . ' ' . $employee->last_name,
                'manager_id' => $manager?->user_id,
                'manager_name' => $manager ? $manager->first_name . ' ' . $manager->last_name : null,
                'manager_email' => $manager?->email,
                'manager_phone' => $manager?->phone,
                'manager_preferences' => [
                    'email_enabled' => true,
                    'whatsapp_enabled' => false,
                    'inapp_enabled' => true,
                    'quiet_hours_start' => '22:00:00',
                    'quiet_hours_end' => '06:00:00',
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->respondError('Employee not found', 404);
        } catch (\Exception $e) {
            LoggingService::error('Failed to get notification context', $e);

            return $this->respondServerError();
        }
    }
}
