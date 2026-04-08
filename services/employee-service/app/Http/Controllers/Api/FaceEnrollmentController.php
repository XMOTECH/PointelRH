<?php

namespace App\Http\Controllers\Api;

use App\Models\Employee;
use App\Models\FaceDescriptor;
use App\Services\LoggingService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaceEnrollmentController extends BaseApiController
{
    /**
     * Vérifier si un employé a des données faciales enregistrées.
     * GET /employees/{id}/face-enrollment
     */
    public function show(string $id, Request $request): JsonResponse
    {
        try {
            $employee = Employee::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            $descriptors = $employee->faceDescriptors;

            return $this->respondSuccess([
                'enrolled' => $descriptors->isNotEmpty(),
                'count' => $descriptors->count(),
                'labels' => $descriptors->pluck('label')->toArray(),
            ]);
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Employé non trouvé');
        } catch (\Exception $e) {
            LoggingService::error('Failed to check face enrollment', $e);

            return $this->respondServerError('Impossible de vérifier l\'enregistrement facial');
        }
    }

    /**
     * Enregistrer les descripteurs faciaux d'un employé.
     * POST /employees/{id}/face-enrollment
     *
     * Body: { descriptors: [{ descriptor: number[128], label: string }] }
     */
    public function store(string $id, Request $request): JsonResponse
    {
        try {
            $request->validate([
                'descriptors' => 'required|array|min:1|max:5',
                'descriptors.*.descriptor' => 'required|array|size:128',
                'descriptors.*.descriptor.*' => 'required|numeric',
                'descriptors.*.label' => 'required|string|in:front,left,right,up,down',
            ]);

            $employee = Employee::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            // Supprimer les anciens descripteurs avant de réenregistrer
            $employee->faceDescriptors()->delete();

            $created = [];
            foreach ($request->descriptors as $entry) {
                $created[] = FaceDescriptor::create([
                    'employee_id' => $employee->id,
                    'company_id' => $employee->company_id,
                    'descriptor' => $entry['descriptor'],
                    'label' => $entry['label'],
                ]);
            }

            LoggingService::info('Face enrollment completed', [
                'employee_id' => $id,
                'descriptors_count' => count($created),
            ]);

            return $this->respondSuccess([
                'enrolled' => true,
                'count' => count($created),
            ], 'Données faciales enregistrées avec succès', 201);
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Employé non trouvé');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->respondValidationError($e->errors());
        } catch (\Exception $e) {
            LoggingService::error('Failed to enroll face data', $e);

            return $this->respondServerError('Impossible d\'enregistrer les données faciales');
        }
    }

    /**
     * Supprimer les données faciales d'un employé.
     * DELETE /employees/{id}/face-enrollment
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        try {
            $employee = Employee::where('company_id', $request->auth_company_id)
                ->findOrFail($id);

            $deleted = $employee->faceDescriptors()->delete();

            LoggingService::info('Face data deleted', [
                'employee_id' => $id,
                'deleted_count' => $deleted,
            ]);

            return $this->respondSuccess(null, 'Données faciales supprimées');
        } catch (ModelNotFoundException $e) {
            return $this->respondNotFound('Employé non trouvé');
        } catch (\Exception $e) {
            LoggingService::error('Failed to delete face data', $e);

            return $this->respondServerError('Impossible de supprimer les données faciales');
        }
    }
}
