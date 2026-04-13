<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\Employee;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MissionService
{
    public function __construct(
        private readonly ConflictService $conflictService,
        private readonly RabbitMQService $rabbitMQ
    ) {}

    /**
     * Assign employees to a mission and generate shifts.
     */
    public function assignEmployees(Mission $mission, array $employeeIds, ?string $comment = null): void
    {
        DB::transaction(function () use ($mission, $employeeIds, $comment) {
            // 1. Sync assignments
            $mission->employees()->syncWithPivotValues($employeeIds, [
                'status' => 'assigned',
                'comment' => $comment,
                'assigned_at' => now(),
            ]);

            // 2. Generate Shifts for the mission duration
            $startDate = Carbon::parse($mission->start_date);
            $endDate = $mission->end_date ? Carbon::parse($mission->end_date) : $startDate;

            $currentDate = $startDate->copy();
            while ($currentDate->lte($endDate)) {
                foreach ($employeeIds as $employeeId) {
                    // Check for conflicts before creating shift
                    $conflicts = $this->conflictService->checkOverlap($employeeId, $currentDate->startOfDay(), $currentDate->endOfDay());
                    
                    // Even with conflicts, we might want to create it but mark it as 'pending' or flag it
                    // For now, let's create it as 'confirmed' but log the conflict
                    $shift = Shift::create([
                        'id' => (string) Str::uuid(),
                        'company_id' => $mission->company_id,
                        'employee_id' => $employeeId,
                        'mission_id' => $mission->id,
                        'start_at' => $currentDate->copy()->setHour(9)->setMinute(0), // Default 9:00
                        'end_at' => $currentDate->copy()->setHour(17)->setMinute(0),  // Default 17:00
                        'status' => empty($conflicts) ? 'confirmed' : 'pending',
                        'comment' => !empty($conflicts) ? 'Conflit détecté lors de la génération automatique' : null,
                        'type' => 'regular'
                    ]);

                    $this->rabbitMQ->publishEvent('ShiftCreated', [
                        'shift_id' => $shift->id,
                        'employee_id' => $employeeId,
                        'start' => $shift->start_at->toIso8601String(),
                        'end' => $shift->end_at->toIso8601String(),
                        'status' => $shift->status,
                    ], 'employee_events');
                }
                $currentDate->addDay();
            }

            // 3. Notify
            $employees = Employee::whereIn('id', $employeeIds)->get();
            foreach ($employees as $employee) {
                $this->rabbitMQ->publishEvent('MissionAssigned', [
                    'employee_id' => $employee->id,
                    'user_id' => $employee->user_id,
                    'employee_name' => $employee->first_name.' '.$employee->last_name,
                    'company_id' => $mission->company_id,
                    'mission_id' => $mission->id,
                    'mission_title' => $mission->title,
                    'mission_location' => $mission->location,
                    'mission_start_date' => $mission->start_date?->toDateString(),
                ], 'employee_events');
            }
        });
    }
}
