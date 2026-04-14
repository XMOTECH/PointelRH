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
        private readonly PlanningService $planningService,
        private readonly RabbitMQService $rabbitMQ
    ) {}

    /**
     * Assign employees to a mission and generate shifts based on their actual schedule.
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

            // 2. Generate shifts for the mission duration using each employee's real schedule
            $startDate = Carbon::parse($mission->start_date);
            $endDate = $mission->end_date ? Carbon::parse($mission->end_date) : $startDate;

            $employees = Employee::with('schedule')->whereIn('id', $employeeIds)->get()->keyBy('id');

            foreach ($employeeIds as $employeeId) {
                $employee = $employees->get($employeeId);
                if (! $employee) {
                    continue;
                }

                // Get the effective planning (template + overrides + leaves)
                $planning = $this->planningService->getEmployeePlanning(
                    $employeeId,
                    $startDate->toDateString(),
                    $endDate->toDateString()
                );

                foreach ($planning as $day) {
                    // Skip non-work days (rest, leave, off)
                    if ($day['status'] !== 'work') {
                        continue;
                    }

                    $dayDate = Carbon::parse($day['date']);
                    $dayStartTime = $day['start_time'] ?? '09:00';
                    $dayEndTime = $day['end_time'] ?? '17:00';

                    // Parse hours from schedule
                    $shiftStart = $dayDate->copy()->setTimeFromTimeString($dayStartTime);
                    $shiftEnd = $dayDate->copy()->setTimeFromTimeString($dayEndTime);

                    // Check for conflicts
                    $conflicts = $this->conflictService->checkOverlap(
                        $employeeId,
                        $shiftStart,
                        $shiftEnd
                    );

                    Shift::create([
                        'id' => (string) Str::uuid(),
                        'company_id' => $mission->company_id,
                        'employee_id' => $employeeId,
                        'mission_id' => $mission->id,
                        'start_at' => $shiftStart,
                        'end_at' => $shiftEnd,
                        'status' => empty($conflicts) ? 'confirmed' : 'pending',
                        'comment' => ! empty($conflicts) ? 'Conflit detecte lors de la generation automatique' : null,
                        'type' => 'regular',
                    ]);
                }
            }

            // 3. Notify assigned employees
            $employees = Employee::whereIn('id', $employeeIds)->get();
            foreach ($employees as $employee) {
                $this->rabbitMQ->publishEvent('MissionAssigned', [
                    'employee_id' => $employee->id,
                    'user_id' => $employee->user_id,
                    'employee_name' => $employee->first_name . ' ' . $employee->last_name,
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
