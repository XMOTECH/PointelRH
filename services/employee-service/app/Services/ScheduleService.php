<?php

namespace App\Services;

use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\InvalidDataException;
use App\Models\Schedule;
use Illuminate\Support\Collection;

/**
 * ScheduleService
 * Service métier pour la gestion des horaires
 * 
 * Responsabilités:
 * - Créer, mettre à jour, supprimer les horaires
 * - Valider les règles métier
 * - Lever les exceptions appropriées
 */
class ScheduleService
{
    /**
     * Créer un nouvel horaire
     *
     * @throws InvalidDataException
     */
    public function create(array $data): Schedule
    {
        try {
            $schedule = Schedule::create($data);
            LoggingService::info('Schedule created via service', [
                'schedule_id' => $schedule->id,
            ]);
            return $schedule;
        } catch (\Exception $e) {
            LoggingService::error('Failed to create schedule in service', $e);
            throw new InvalidDataException('Failed to create schedule');
        }
    }

    /**
     * Récupérer un horaire par ID
     *
     * @throws ResourceNotFoundException
     */
    public function getById(string $id): Schedule
    {
        $schedule = Schedule::find($id);
        if (!$schedule) {
            throw new ResourceNotFoundException('Schedule');
        }
        return $schedule;
    }

    /**
     * Mettre à jour un horaire
     *
     * @throws ResourceNotFoundException
     * @throws InvalidDataException
     */
    public function update(string $id, array $data): Schedule
    {
        try {
            $schedule = $this->getById($id);
            $schedule->update($data);
            
            LoggingService::info('Schedule updated via service', [
                'schedule_id' => $id,
                'changed_fields' => array_keys($data),
            ]);
            
            return $schedule;
        } catch (\Exception $e) {
            LoggingService::error('Failed to update schedule in service', $e);
            throw new InvalidDataException('Failed to update schedule');
        }
    }

    /**
     * Supprimer un horaire
     *
     * @throws ResourceNotFoundException
     */
    public function delete(string $id): bool
    {
        $schedule = $this->getById($id);
        $deleted = $schedule->delete();
        
        if ($deleted) {
            LoggingService::info('Schedule deleted via service', [
                'schedule_id' => $id,
            ]);
        }
        
        return $deleted;
    }

    /**
     * Lister les horaires d'une compagnie
     */
    public function list(string $companyId): Collection
    {
        return Schedule::where('company_id', $companyId)->get();
    }
}
