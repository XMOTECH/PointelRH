<?php

namespace App\Http\Controllers\Api;

use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends BaseApiController
{
    /**
     * Resolve a location by its QR token.
     * GET /api/locations/resolve/{token}
     */
    public function resolve(string $token): JsonResponse
    {
        $location = Location::where('qr_token', $token)
            ->where('is_active', true)
            ->first();

        if (!$location) {
            return $this->respondNotFound('Point de passage introuvable ou inactif.');
        }

        return $this->respondSuccess([
            'location' => $location
        ]);
    }
}
