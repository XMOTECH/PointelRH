<?php

namespace App\Services;

use App\Enums\EmployeeStatus;
use App\Exceptions\InvalidDataException;
use App\Exceptions\ResourceNotFoundException;
use App\Models\Employee;
use App\Repositories\EmployeeRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

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
        private readonly EmployeeRepository $employeeRepository
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
        if (! $employee) {
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
                ->where('status', EmployeeStatus::ACTIVE->value)
                ->first();
        }

        // Sinon par QR token brut
        return Employee::with(['schedule', 'department'])
            ->where('qr_token', $identifier)
            ->where('status', EmployeeStatus::ACTIVE->value)
            ->first();
    }

    /**
     * Résoudre un employé via son code PIN
     *
     * Optimisation: on utilise pin_prefix (2 premiers caractères stockés en clair)
     * pour pré-filtrer en SQL avant de faire Hash::check() sur les candidats.
     * Réduit le nombre de vérifications bcrypt de O(n) à O(petit sous-ensemble).
     */
    public function resolveByPin(string $pin, string $companyId): ?Employee
    {
        $prefix = substr($pin, 0, 2);

        // Pré-filtrage par prefix — réduit drastiquement les candidats
        $candidates = Employee::with(['schedule', 'department'])
            ->where('company_id', $companyId)
            ->where('status', EmployeeStatus::ACTIVE->value)
            ->where(function ($query) use ($prefix) {
                $query->where('pin_prefix', $prefix)
                    ->orWhereNull('pin_prefix'); // Fallback pour les PINs générés avant la migration
            })
            ->whereNotNull('pin')
            ->get();

        foreach ($candidates as $employee) {
            if (Hash::check($pin, $employee->pin)) {
                // Backfill pin_prefix si absent (migration progressive)
                if ($employee->pin_prefix === null) {
                    $employee->timestamps = false;
                    $employee->pin_prefix = $prefix;
                    $employee->saveQuietly();
                }

                return $employee;
            }
        }

        return null;
    }
}
