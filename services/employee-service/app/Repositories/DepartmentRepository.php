<?php

namespace App\Repositories;

use App\Models\Department;
use Illuminate\Support\Collection;

/**
 * DepartmentRepository
 * Centralise l'accès aux données des départements
 */
class DepartmentRepository
{
    /**
     * Trouver un département par ID
     */
    public function findById(string $id): ?Department
    {
        return Department::find($id);
    }

    /**
     * Créer un nouveau département
     */
    public function create(array $data): Department
    {
        return Department::create($data);
    }

    /**
     * Mettre à jour un département
     */
    public function update(string $id, array $data): Department
    {
        $department = $this->findById($id);
        $department->update($data);

        return $department;
    }

    /**
     * Supprimer un département
     */
    public function delete(string $id): bool
    {
        return Department::destroy($id) > 0;
    }

    /**
     * Lister les départements d'une compagnie
     */
    public function findByCompanyId(string $companyId): Collection
    {
        return Department::where('company_id', $companyId)->get();
    }

    /**
     * Lister les départements racines (no parent_id)
     */
    public function findRootByCompanyId(string $companyId): Collection
    {
        return Department::where('company_id', $companyId)
            ->whereNull('parent_id')
            ->get();
    }

    /**
     * Lister les sous-départements
     */
    public function findChildrenOf(string $parentId): Collection
    {
        return Department::where('parent_id', $parentId)->get();
    }
}
