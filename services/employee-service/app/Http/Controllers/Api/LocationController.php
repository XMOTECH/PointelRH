<?php

namespace App\Http\Controllers\Api;

use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends BaseApiController
{
    /**
     * List all locations for the company.
     * GET /api/locations
     */
    public function index(Request $request): JsonResponse
    {
        $locations = Location::where('company_id', $request->auth_company_id)
            ->orderBy('name')
            ->get();

        return $this->respondSuccess($locations);
    }

    /**
     * Create a new location.
     * POST /api/locations
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $validated['company_id'] = $request->auth_company_id;
        $validated['qr_token'] = bin2hex(random_bytes(16)); // Generate a unique token

        $location = Location::create($validated);

        return $this->respondSuccess($location, 'Site créé avec succès', 201);
    }

    /**
     * Update a location.
     * PUT /api/locations/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $location = Location::where('company_id', $request->auth_company_id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'radius_meters' => 'sometimes|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $location->update($validated);

        return $this->respondSuccess($location, 'Site mis à jour');
    }

    /**
     * Delete a location.
     * DELETE /api/locations/{id}
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $location = Location::where('company_id', $request->auth_company_id)
            ->findOrFail($id);

        $location->delete();

        return $this->respondSuccess(null, 'Site supprimé');
    }

    /**
     * Generate a QR code for the location.
     * GET /api/locations/{id}/qr
     */
    public function generateQr(Request $request, string $id): JsonResponse
    {
        $location = Location::where('company_id', $request->auth_company_id)
            ->findOrFail($id);

        // In a real scenario, we would generate a PNG/PDF here using a library.
        // For now, we return the token and instructions for the frontend to render it.
        return $this->respondSuccess([
            'qr_token' => $location->qr_token,
            'name' => $location->name,
            'instructions' => "Use the qr_token to render a QR code on the client side or print it."
        ]);
    }

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
