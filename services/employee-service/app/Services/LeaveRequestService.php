<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LeaveRequestService
{
    /**
     * Calcule le nombre de jours ouvrés entre deux dates.
     */
    public function calculateDaysCount(Carbon $start, Carbon $end, bool $halfDay = false): float
    {
        if ($halfDay) {
            return 0.5;
        }

        $count = 0;
        $current = $start->copy();
        while ($current->lte($end)) {
            if ($current->isWeekday()) {
                $count++;
            }
            $current->addDay();
        }

        return (float) $count;
    }

    /**
     * Crée une demande de congé avec vérifications.
     */
    public function create(array $data): LeaveRequest
    {
        $startDate = Carbon::parse($data['start_date']);
        $endDate = Carbon::parse($data['end_date']);
        $halfDay = $data['half_day'] ?? false;

        $daysCount = $this->calculateDaysCount($startDate, $endDate, $halfDay);
        $data['days_count'] = $daysCount;

        // Vérifier le chevauchement avec des congés existants
        $this->checkOverlap($data['employee_id'], $startDate, $endDate, $halfDay);

        // Vérifier et déduire le solde si leave_type_id est fourni
        if (! empty($data['leave_type_id'])) {
            $this->checkAndDeductBalance($data['employee_id'], $data['company_id'], $data['leave_type_id'], $daysCount, $startDate->year);
        }

        // Copier le nom du type dans leave_type (rétro-compat)
        if (! empty($data['leave_type_id']) && empty($data['leave_type'])) {
            $leaveType = LeaveType::find($data['leave_type_id']);
            $data['leave_type'] = $leaveType?->name ?? 'other';
        }

        $data['status'] = 'pending';
        $leave = LeaveRequest::create($data);

        // Publier l'événement pour notification au manager
        $this->publishLeaveEvent('LeaveRequested', $leave);

        return $leave->load(['employee', 'leaveType']);
    }

    /**
     * Liste des congés (admin/manager).
     */
    public function index(string $companyId, ?string $departmentId = null): Collection
    {
        $query = LeaveRequest::with(['employee', 'leaveType', 'approver'])
            ->where('company_id', $companyId);

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        return $query->latest()->get();
    }

    /**
     * Mise à jour du statut (approbation/rejet).
     */
    public function update(LeaveRequest $leaveRequest, array $data): LeaveRequest
    {
        $newStatus = $data['status'];

        if ($newStatus === 'approved') {
            $this->approveLeave($leaveRequest, $data);
        } elseif ($newStatus === 'rejected') {
            $this->rejectLeave($leaveRequest, $data);
        } else {
            $leaveRequest->update($data);
        }

        return $leaveRequest->fresh(['employee', 'leaveType', 'approver']);
    }

    /**
     * Les congés de l'employé connecté.
     */
    public function getMyLeaves(string $employeeId, string $companyId): Collection
    {
        return LeaveRequest::with(['leaveType', 'approver'])
            ->where('employee_id', $employeeId)
            ->where('company_id', $companyId)
            ->latest()
            ->get();
    }

    /**
     * Les soldes de congé de l'employé pour une année donnée.
     */
    public function getMyBalance(string $employeeId, string $companyId, int $year): Collection
    {
        return LeaveBalance::with('leaveType')
            ->where('employee_id', $employeeId)
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->get();
    }

    /**
     * Types de congé actifs pour une entreprise.
     */
    public function getLeaveTypes(string $companyId): Collection
    {
        return LeaveType::where('company_id', $companyId)
            ->where('is_active', true)
            ->get();
    }

    /**
     * Annuler une demande pending.
     */
    public function cancel(LeaveRequest $leaveRequest): void
    {
        if ($leaveRequest->status !== 'pending') {
            throw new \RuntimeException('Seules les demandes en attente peuvent être annulées.');
        }

        // Restaurer le solde pending
        if ($leaveRequest->leave_type_id && $leaveRequest->days_count) {
            $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->where('year', $leaveRequest->start_date->year)
                ->first();

            if ($balance) {
                $balance->decrement('pending', $leaveRequest->days_count);
            }
        }

        $leaveRequest->delete();
    }

    /**
     * Escalader les demandes en attente depuis plus de 48h.
     */
    public function getPendingEscalatable(): Collection
    {
        return LeaveRequest::where('status', 'pending')
            ->where('created_at', '<=', now()->subHours(48))
            ->whereNull('escalated_at')
            ->get();
    }

    public function escalate(LeaveRequest $leaveRequest): void
    {
        $leaveRequest->update([
            'status' => 'escalated',
            'escalated_at' => now(),
        ]);

        app(RabbitMQService::class)->publishEvent('LeaveEscalated', [
            'leave_request_id' => $leaveRequest->id,
            'employee_id' => $leaveRequest->employee_id,
            'company_id' => $leaveRequest->company_id,
        ], 'notifications');
    }

    // ── Private helpers ──────────────────────────────────────

    private function checkOverlap(string $employeeId, Carbon $start, Carbon $end, bool $halfDay): void
    {
        $query = LeaveRequest::where('employee_id', $employeeId)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('start_date', [$start, $end])
                    ->orWhereBetween('end_date', [$start, $end])
                    ->orWhere(function ($q2) use ($start, $end) {
                        $q2->where('start_date', '<=', $start)
                            ->where('end_date', '>=', $end);
                    });
            });

        if ($query->exists()) {
            throw new \RuntimeException('Une demande de congé existe déjà sur cette période.');
        }
    }

    private function checkAndDeductBalance(string $employeeId, string $companyId, string $leaveTypeId, float $daysCount, int $year): void
    {
        DB::transaction(function () use ($employeeId, $companyId, $leaveTypeId, $daysCount, $year) {
            $leaveType = LeaveType::findOrFail($leaveTypeId);

            // Types illimités : pas de vérification de solde
            if ($leaveType->max_days_per_year === null) {
                return;
            }

            $balance = LeaveBalance::where('employee_id', $employeeId)
                ->where('leave_type_id', $leaveTypeId)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if (! $balance) {
                // Créer le solde s'il n'existe pas
                $balance = LeaveBalance::create([
                    'employee_id' => $employeeId,
                    'company_id' => $companyId,
                    'leave_type_id' => $leaveTypeId,
                    'year' => $year,
                    'allocated' => $leaveType->max_days_per_year,
                    'used' => 0,
                    'pending' => 0,
                ]);
            }

            if ($balance->remaining < $daysCount) {
                throw new \RuntimeException(
                    "Solde insuffisant. Restant : {$balance->remaining} jours, demandé : {$daysCount} jours."
                );
            }

            $balance->increment('pending', $daysCount);
        });
    }

    private function approveLeave(LeaveRequest $leaveRequest, array $data): void
    {
        DB::transaction(function () use ($leaveRequest, $data) {
            $updateData = [
                'status' => 'approved',
                'approved_by' => $data['approved_by'] ?? null,
                'approved_at' => now(),
            ];

            $leaveRequest->update($updateData);

            // Transférer pending → used dans le solde
            if ($leaveRequest->leave_type_id && $leaveRequest->days_count) {
                $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                    ->where('leave_type_id', $leaveRequest->leave_type_id)
                    ->where('year', $leaveRequest->start_date->year)
                    ->lockForUpdate()
                    ->first();

                if ($balance) {
                    $balance->decrement('pending', $leaveRequest->days_count);
                    $balance->increment('used', $leaveRequest->days_count);
                }
            }

            $this->publishLeaveEvent('LeaveApproved', $leaveRequest);
        });
    }

    private function rejectLeave(LeaveRequest $leaveRequest, array $data): void
    {
        DB::transaction(function () use ($leaveRequest, $data) {
            $updateData = [
                'status' => 'rejected',
                'rejection_reason' => $data['rejection_reason'] ?? null,
                'approved_by' => $data['approved_by'] ?? null,
                'approved_at' => now(),
            ];

            $leaveRequest->update($updateData);

            // Restaurer le solde pending
            if ($leaveRequest->leave_type_id && $leaveRequest->days_count) {
                $balance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                    ->where('leave_type_id', $leaveRequest->leave_type_id)
                    ->where('year', $leaveRequest->start_date->year)
                    ->lockForUpdate()
                    ->first();

                if ($balance) {
                    $balance->decrement('pending', $leaveRequest->days_count);
                }
            }

            $this->publishLeaveEvent('LeaveRejected', $leaveRequest);
        });
    }

    private function publishLeaveEvent(string $eventName, LeaveRequest $leave): void
    {
        $leave->loadMissing(['employee', 'leaveType']);

        $payload = [
            'leave_request_id' => $leave->id,
            'employee_id' => $leave->employee_id,
            'user_id' => $leave->employee?->user_id,
            'employee_name' => $leave->employee?->full_name,
            'company_id' => $leave->company_id,
            'department_id' => $leave->department_id,
            'leave_type_name' => $leave->leaveType?->name ?? $leave->leave_type,
            'start_date' => $leave->start_date->toDateString(),
            'end_date' => $leave->end_date->toDateString(),
            'days_count' => $leave->days_count,
            'reason' => $leave->reason,
            'rejection_reason' => $leave->rejection_reason,
        ];

        // Résoudre le manager du département pour LeaveRequested
        if ($eventName === 'LeaveRequested') {
            $manager = Employee::where('department_id', $leave->department_id)
                ->where('company_id', $leave->company_id)
                ->where('role', 'manager')
                ->first();
            $payload['manager_user_id'] = $manager?->user_id;
        }

        try {
            app(RabbitMQService::class)->publishEvent($eventName, $payload, 'employee_events');
        } catch (\Exception $e) {
            // Log mais ne pas bloquer la requête
            \Illuminate\Support\Facades\Log::error("Failed to publish {$eventName}: " . $e->getMessage());
        }
    }
}
