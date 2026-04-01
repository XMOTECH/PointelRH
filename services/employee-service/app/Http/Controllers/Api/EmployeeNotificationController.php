<?php

namespace App\Http\Controllers\Api;

use App\Models\Employee;
use App\Services\LoggingService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

/**
 * EmployeeNotificationController
 * Récupère les informations contextuelles pour les notifications
 */
class EmployeeNotificationController extends BaseApiController
{
    /**
     * Récupérer le contexte de notification pour un employé
     * Inclut les infos du manager et ses préférences
     */
    public function getNotificationContext(string $employeeId): JsonResponse
    {
        try {
            $employee = Employee::with(['department', 'company'])->findOrFail($employeeId);

            LoggingService::info('Notification context retrieved', [
                'employee_id' => $employeeId,
                'department_id' => $employee->department_id,
            ]);

            // In a real app, we'd find the manager of the department
            // For this demo, we'll assume the first employee with 'manager' role in the same company/dept
            // or just return some mock data if not found.

            return $this->respondSuccess([
                'employee_name' => $employee->first_name.' '.$employee->last_name,
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
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            LoggingService::warning('Employee not found for notification context', [
                'employee_id' => $employeeId,
            ]);

            return $this->respondError('Employee not found', 404);
        } catch (\Exception $e) {
            LoggingService::error('Failed to get notification context', $e);

            return $this->respondServerError();
        }
    }
}
