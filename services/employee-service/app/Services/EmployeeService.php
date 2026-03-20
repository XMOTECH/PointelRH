<?php

namespace App\Services;

use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidDataException;
use App\Models\Employee;
use Illuminate\Support\Collection;

/**
 * EmployeeService
 * Service métier pour la gestion des employés
 * 
 * Responsabilités:
 * - Créer, mettre à jour, supprimer les employés
 * - Valider les règles métier
 * - Lever les exceptions appropriées
 */
class EmployeeService
{
    /**
     * Créer un nouvel employé
     *
     * @throws InvalidDataException
     */
    public function create(array $data): Employee
    {
        try {
            $employee = Employee::create($data);
            LoggingService::info('Employee created via service', [
                'employee_id' => $employee->id,
            ]);
            return $employee;
        } catch (\Exception $e) {
            LoggingService::error('Failed to create employee in service', $e);
            throw new InvalidDataException('Failed to create employee');
        }
    }

    /**
     * Récupérer un employé par ID
     *
     * @throws ResourceNotFoundException
     */
    public function getById(string $id): Employee
    {
        $employee = Employee::find($id);
        if (!$employee) {
            throw new ResourceNotFoundException('Employee');
        }
        return $employee;
    }

    /**
     * Mettre à jour un employé
     *
     * @throws ResourceNotFoundException
     * @throws InvalidDataException
     */
    public function update(string $id, array $data): Employee
    {
        try {
            $employee = $this->getById($id);
            $employee->update($data);
            
            LoggingService::info('Employee updated via service', [
                'employee_id' => $id,
                'changed_fields' => array_keys($data),
            ]);
            
            return $employee;
        } catch (\Exception $e) {
            LoggingService::error('Failed to update employee in service', $e);
            throw new InvalidDataException('Failed to update employee');
        }
    }

    /**
     * Supprimer un employé
     *
     * @throws ResourceNotFoundException
     */
    public function delete(string $id): bool
    {
        $employee = $this->getById($id);
        $deleted = $employee->delete();
        
        if ($deleted) {
            LoggingService::info('Employee deleted via service', [
                'employee_id' => $id,
            ]);
        }
        
        return $deleted;
    }

    /**
     * Lister les employés d'une compagnie avec filtrage
     */
    public function list(string $companyId, array $filters = []): Collection
    {
        $query = Employee::where('company_id', $companyId);

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['contract_type'])) {
            $query->where('contract_type', $filters['contract_type']);
        }

        return $query->get();
    }
}
