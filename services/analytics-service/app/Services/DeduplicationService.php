<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class DeduplicationService
{
    public function alreadyProcessed(string $key): bool
    {
        return Cache::has("dedup:{$key}");
    }

    public function markProcessed(string $key, int $ttl = 86400): void
    {
        Cache::put("dedup:{$key}", true, $ttl);
    }
}
