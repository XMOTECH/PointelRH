<?php

namespace App\Domain;

class GeofencingService
{
    private const EARTH_RADIUS_METERS = 6371000;
    private const GPS_BUFFER_METERS = 20; // Tolerance for GPS inaccuracy

    /**
     * Verify if the user is within the geofence of a location.
     */
    public static function isWithinZone(
        float $userLat, 
        float $userLng, 
        float $siteLat, 
        float $siteLng, 
        int $radiusMeters
    ): bool {
        $distance = self::calculateDistance($userLat, $userLng, $siteLat, $siteLng);
        
        return $distance <= ($radiusMeters + self::GPS_BUFFER_METERS);
    }

    /**
     * Calculate distance between two points using Haversine formula.
     */
    public static function calculateDistance(
        float $lat1, 
        float $lng1, 
        float $lat2, 
        float $lng2
    ): float {
        $lat1Rad = deg2rad($lat1);
        $lng1Rad = deg2rad($lng1);
        $lat2Rad = deg2rad($lat2);
        $lng2Rad = deg2rad($lng2);

        $dLat = $lat2Rad - $lat1Rad;
        $dLng = $lng2Rad - $lng1Rad;

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS_METERS * $c;
    }
}
