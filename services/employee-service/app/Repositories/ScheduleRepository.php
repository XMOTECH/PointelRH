<?php

namespace App\Repositories;

use App\Models\Schedule;
use Illuminate\Support\Collection;

/**
 * ScheduleRepository
 * Centralise l'accès aux données des horaires
 */
class ScheduleRepository
{
    /**
     * Trouver un horaire par ID
     */
    public function findById(string $id): ?Schedule
    {
        return Schedule::find($id);
    }

    /**
     * Créer un nouvel horaire
     */
    public function create(array $data): Schedule
    {
        return Schedule::create($data);
    }

    /**
     * Mettre à jour un horaire
     */
    public function update(string $id, array $data): Schedule
    {
        $schedule = $this->findById($id);
        $schedule->update($data);

        return $schedule;
    }

    /**
     * Supprimer un horaire
     */
    public function delete(string $id): bool
    {
        return Schedule::destroy($id) > 0;
    }

    /**
     * Lister les horaires d'une compagnie
     */
    public function findByCompanyId(string $companyId): Collection
    {
        return Schedule::where('company_id', $companyId)->get();
    }

    /**
     * Lister les horaires par TimeZone
     */
    public function findByTimezone(string $timezone): Collection
    {
        return Schedule::where('timezone', $timezone)->get();
    }
}
