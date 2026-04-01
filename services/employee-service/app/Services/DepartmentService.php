<?php

namespace App\Services;

use App\Exceptions\InvalidDataException;
use App\Exceptions\ResourceNotFoundException;
use App\Models\Department;
use Illuminate\Support\Collection;

/**
 * DepartmentService
 * Service métier pour la gestion des départements
 *
 * Responsabilités:
 * - Créer, mettre à jour, supprimer les départements
 * - Valider les règles métier
 * - Lever les exceptions appropriées
 */
class DepartmentService
{
    /**
     * Créer un nouveau département
     *
     * @throws InvalidDataException
     */
    public function create(array $data): Department
    {
        try {
            $department = Department::create($data);
            LoggingService::info('Department created via service', [
                'department_id' => $department->id,
            ]);

            return $department;
        } catch (\Exception $e) {
            LoggingService::error('Failed to create department in service', $e);
            throw new InvalidDataException('Failed to create department');
        }
    }

    /**
     * Récupérer un département par ID
     *
     * @throws ResourceNotFoundException
     */
    public function getById(string $id): Department
    {
        $department = Department::with('manager')->find($id);
        if (! $department) {
            throw new ResourceNotFoundException('Department');
        }

        return $department;
    }

    /**
     * Mettre à jour un département
     *
     * @throws ResourceNotFoundException
     * @throws InvalidDataException
     */
    public function update(string $id, array $data): Department
    {
        try {
            $department = $this->getById($id);
            $department->update($data);

            LoggingService::info('Department updated via service', [
                'department_id' => $id,
                'changed_fields' => array_keys($data),
            ]);

            return $department;
        } catch (\Exception $e) {
            LoggingService::error('Failed to update department in service', $e);
            throw new InvalidDataException('Failed to update department');
        }
    }

    /**
     * Supprimer un département
     *
     * @throws ResourceNotFoundException
     */
    public function delete(string $id): bool
    {
        $department = $this->getById($id);
        $deleted = $department->delete();

        if ($deleted) {
            LoggingService::info('Department deleted via service', [
                'department_id' => $id,
            ]);
        }

        return $deleted;
    }

    /**
     * Lister les départements d'une compagnie
     */
    public function list(string $companyId): Collection
    {
        return Department::with('manager')->where('company_id', $companyId)->get();
    }
}
