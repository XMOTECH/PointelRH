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
    public function __construct(
        private readonly \App\Repositories\EmployeeRepository $employeeRepository
    ) {}

    /**
     * Créer un nouvel employé
     *
     * @throws InvalidDataException
     */
    public function create(array $data): Employee
    {
        try {
            $employee = $this->employeeRepository->create($data);
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
        $employee = $this->employeeRepository->findById($id);
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
        $deleted = $this->employeeRepository->delete($id);
        
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
        // Priorité au filtre injecté par le middleware ScopeByDepartment pour les managers
        if (request()->has('filter_department_id')) {
            $filters['department_id'] = request()->filter_department_id;
        }

        return $this->employeeRepository->search($companyId, $filters);
    }

    /**
     * Résoudre un employé via un QR token ou son propre ID
     */
    public function resolve(string $identifier): ?Employee
    {
        // Essayer par ID d'abord (format JSON de l'app)
        $decoded = json_decode($identifier, true);
        if (is_array($decoded) && isset($decoded['user_id'])) {
            return Employee::with(['schedule', 'department'])
                ->where('id', $decoded['user_id'])
                ->where('status', \App\Enums\EmployeeStatus::ACTIVE->value)
                ->first();
        }

        // Sinon par QR token brut
        return Employee::with(['schedule', 'department'])
            ->where('qr_token', $identifier)
            ->where('status', \App\Enums\EmployeeStatus::ACTIVE->value)
            ->first();
    }

    /**
     * Résoudre un employé via son code PIN
     */
    public function resolveByPin(string $pin, string $companyId): ?Employee
    {
        // On récupère les candidats potentiels (actifs dans cette entreprise)
        // Note: On ne peut pas filtrer par PIN dans le SQL car il est haché
        $employees = Employee::with(['schedule', 'department'])
            ->where('company_id', $companyId)
            ->where('status', \App\Enums\EmployeeStatus::ACTIVE->value)
            ->get();

        foreach ($employees as $employee) {
            if (\Illuminate\Support\Facades\Hash::check($pin, $employee->pin)) {
                return $employee;
            }
        }

        return null;
    }
}
