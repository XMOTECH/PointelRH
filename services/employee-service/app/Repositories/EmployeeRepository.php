<?php

namespace App\Repositories;

use App\Models\Employee;
use Illuminate\Support\Collection;

/**
 * EmployeeRepository
 * Centralise l'accès aux données des employés
 */
class EmployeeRepository
{
    /**
     * Trouver un employé par ID
     */
    public function findById(string $id): ?Employee
    {
        return Employee::find($id);
    }

    /**
     * Trouver un employé par email
     */
    public function findByEmail(string $email): ?Employee
    {
        return Employee::where('email', $email)->first();
    }

    /**
     * Créer un nouvel employé
     */
    public function create(array $data): Employee
    {
        return Employee::create($data);
    }

    /**
     * Mettre à jour un employé
     */
    public function update(string $id, array $data): Employee
    {
        $employee = $this->findById($id);
        $employee->update($data);
        return $employee;
    }

    /**
     * Supprimer un employé
     */
    public function delete(string $id): bool
    {
        return Employee::destroy($id) > 0;
    }

    /**
     * Lister les employés d'une compagnie
     */
    public function findByCompanyId(string $companyId): Collection
    {
        return Employee::where('company_id', $companyId)->get();
    }

    /**
     * Lister les employés d'un département
     */
    public function findByDepartmentId(string $departmentId): Collection
    {
        return Employee::where('department_id', $departmentId)->get();
    }

    /**
     * Lister les employés actifs
     */
    public function findActiveByCompanyId(string $companyId): Collection
    {
        return Employee::where('company_id', $companyId)
            ->where('status', \App\Enums\EmployeeStatus::ACTIVE)
            ->get();
    }

    /**
     * Filtrer les employés avec des critères multiples
     */
    public function search(string $companyId, array $filters): Collection
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

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        return $query->get();
    }
}
