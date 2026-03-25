<?php

namespace App\Services\Drivers;

use App\Contracts\ClockInDriver;
use App\Services\DTOs\Employee;
use App\Exceptions\InvalidTokenException;
use Illuminate\Support\Facades\Http;

class LocationQrDriver implements ClockInDriver
{
    public function __construct(
        private readonly string $employeeServiceUrl,
    ) {}

    public function resolve(array $payload, string $companyId): Employee
    {
        // 1. Résoudre le point de passage (Location)
        $locationResponse = Http::timeout(5)
            ->get("{$this->employeeServiceUrl}/locations/resolve/{$payload['location_token']}");

        if (!$locationResponse->successful()) {
            throw new InvalidTokenException("Point de passage invalide ou inaccessible.");
        }

        $location = $locationResponse->json('data.location');

        // 2. Valider la Géo-localisation
        $userLat = $payload['latitude'] ?? null;
        $userLng = $payload['longitude'] ?? null;

        if ($userLat === null || $userLng === null) {
            throw new InvalidTokenException("Coordonnées GPS manquantes.");
        }

        $distance = $this->calculateDistance(
            $userLat, $userLng,
            $location['latitude'], $location['longitude']
        );

        if ($distance > $location['radius_meters']) {
            throw new InvalidTokenException(sprintf(
                "Vous êtes trop loin du point de passage (%.2fm > %dm).",
                $distance,
                $location['radius_meters']
            ));
        }

        // 3. Résoudre l'employé (Puisque c'est un Scan Mural, l'employé est l'utilisateur authentifié)
        // Dans ce driver, on suppose que l'ID de l'employé est passé dans le payload (via le middleware JWT)
        $employeeId = $payload['auth_user_id'] ?? null;

        if (!$employeeId) {
             throw new InvalidTokenException("Identité de l'employé non résolue.");
        }

        // Appel pour récupérer les détails complets (planning, etc.)
        $empResponse = Http::timeout(5)
            ->get("{$this->employeeServiceUrl}/employees/by-user/{$employeeId}");

        if (!$empResponse->successful()) {
            throw new InvalidTokenException("Impossible de récupérer les détails de l'employé.");
        }

        $empData = $empResponse->json('data');

        return Employee::fromArray([
            'id'            => $empData['id'],
            'first_name'    => $empData['first_name'],
            'last_name'     => $empData['last_name'],
            'company_id'    => $empData['company_id'],
            'department_id' => $empData['department_id'],
            'schedule'      => $empData['schedule'],
            'location_id'   => $location['id'],
            'location_name' => $location['name'],
        ]);
    }

    public function validate(array $payload): bool
    {
        return isset($payload['location_token']);
    }

    public function channelName(): string
    {
        return 'qr_location';
    }

    /**
     * Haversine formula to calculate distance between two points in meters.
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371000; // meters

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
