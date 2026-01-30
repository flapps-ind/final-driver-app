"use client";

import { useEffect, useState } from 'react';

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
    timestamp: string;
}

const useDriverLocation = (driverId: string | null) => {
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        if (!driverId) return;

        // Check if browser supports geolocation
        if (!('geolocation' in navigator)) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        let watchId: number | null = null;

        const startTracking = () => {
            const options = {
                enableHighAccuracy: true,  // Use GPS instead of WiFi/Cell tower
                timeout: 10000,            // Wait max 10 seconds for location
                maximumAge: 0              // Don't use cached location
            };

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const location: LocationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        speed: position.coords.speed,
                        heading: position.coords.heading,
                        timestamp: new Date(position.timestamp).toISOString()
                    };

                    console.log('Location updated:', location);

                    setCurrentLocation(location);
                    setIsTracking(true);
                    setLocationError(null);

                    // Update location in database
                    updateLocationInDatabase(driverId, location);
                },
                (error) => {
                    let errorMessage = '';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please enable location access.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable. Check your GPS settings.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Retrying...';
                            break;
                        default:
                            errorMessage = 'Unknown error occurred while getting location.';
                    }
                    console.error('Geolocation error:', errorMessage, error);
                    setLocationError(errorMessage);
                    setIsTracking(false);
                },
                options
            );
        };

        const updateLocationInDatabase = async (id: string, location: LocationData) => {
            try {
                // In a real app, you'd send an auth token
                await fetch('/api/driver/update-location', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        driver_id: id,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        accuracy: location.accuracy,
                        speed: location.speed,
                        heading: location.heading
                    })
                });
            } catch (error) {
                console.error('Error updating location in database:', error);
            }
        };

        startTracking();

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                console.log('Stopped location tracking');
            }
        };
    }, [driverId]);

    return {
        currentLocation,
        locationError,
        isTracking
    };
};

export default useDriverLocation;
