<?php

namespace App\Console\Commands;

use App\Services\LeaveRequestService;
use Illuminate\Console\Command;

class EscalatePendingLeaves extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leaves:escalate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Escalate leave requests that have been pending for more than 48 hours';

    /**
     * Execute the console command.
     */
    public function handle(LeaveRequestService $leaveService)
    {
        $this->info('Checking for leave requests to escalate...');

        $requests = $leaveService->getPendingEscalatable();

        if ($requests->isEmpty()) {
            $this->info('No requests found for escalation.');

            return 0;
        }

        foreach ($requests as $request) {
            $leaveService->escalate($request);
            $this->info("Escalated request ID: {$request->id} for employee ID: {$request->employee_id}");
        }

        $this->info('Escalation process completed.');

        return 0;
    }
}
