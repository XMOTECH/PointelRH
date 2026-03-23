<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Enums\EmployeeStatus;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class LeaveRequestService
{
    public function create(array $data): LeaveRequest
    {
        return LeaveRequest::create($data);
    }

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

        // Ici, on pourrait déclencher un événement RabbitMQ pour informer le NotificationService
        app(RabbitMQService::class)->publishEvent('LeaveEscalated', [
            'leave_request_id' => $leaveRequest->id,
            'employee_id' => $leaveRequest->employee_id,
            'company_id' => $leaveRequest->company_id,
        ], 'notifications');
    }
}
