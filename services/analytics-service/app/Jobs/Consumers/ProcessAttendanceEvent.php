<?php

namespace App\Jobs\Consumers;

use App\Services\SnapshotUpdater;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAttendanceEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public array $payload) {}

    public function handle(SnapshotUpdater $updater): void
    {
        Log::info("Processing attendance event for analytics", ['event_id' => $this->payload['event_id'] ?? 'unknown']);

        try {
            $updater->updateFromAttendance($this->payload);
        } catch (\Exception $e) {
            Log::error("Failed to process analytics event: " . $e->getMessage());
            throw $e;
        }
    }
}
