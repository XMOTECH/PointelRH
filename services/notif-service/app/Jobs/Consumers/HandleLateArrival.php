<?php

namespace App\Jobs\Consumers;

use App\Dto\NotificationData;
use App\Services\DeduplicationService;
use App\Services\NotificationRouter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HandleLateArrival implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public array $payload) {}

    public function handle(
        NotificationRouter $router,
        DeduplicationService $dedup,
    ): void {
        $eventId = $this->payload['event_id'] ?? md5(json_encode($this->payload));
        
        if ($dedup->alreadyProcessed("late:{$eventId}")) {
            return;
        }

        $employeeId = $this->payload['employee_id'];
        $companyId = $this->payload['company_id'];
        $lateMinutes = $this->payload['late_minutes'];

        $context = $this->resolveContext($employeeId, $companyId);

        if (!$context) {
            Log::error("Could not resolve context for employee {$employeeId}");
            return;
        }

        $notification = new NotificationData(
            type: 'late',
            recipientId: $context['manager_id'],
            companyId: $companyId,
            title: "Retard — {$context['employee_name']}",
            body: "{$context['employee_name']} a pointé avec {$lateMinutes} min de retard.",
            recipientEmail: $context['manager_email'],
            recipientPhone: $context['manager_phone'],
            metadata: array_merge($this->payload, [
                'employee_name' => $context['employee_name'],
                'manager_name' => $context['manager_name'],
                'clock_in_time' => $this->payload['clock_in_time'] ?? '--:--',
                'expected_time' => $this->payload['expected_time'] ?? '--:--',
            ]),
        );

        $router->send($notification, $context['manager_preferences']);

        $dedup->markProcessed("late:{$eventId}");
    }

    private function resolveContext(string $employeeId, string $companyId): ?array
    {
        try {
            $baseUrl = config('services.employee_service.url');
            $response = Http::timeout(5)->get("{$baseUrl}/employees/{$employeeId}/notification-context");

            if ($response->successful()) {
                return $response->json('data');
            }
        } catch (\Exception $e) {
            Log::error("Error resolving context from Employee Service: " . $e->getMessage());
        }

        return null;
    }
}
