
import { useState, useEffect, useCallback } from 'react';
import { BACKEND_CONFIG } from '@/lib/config';

export interface Emergency {
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    latitude: number;
    longitude: number;
    time: string;
    address?: string;
    description?: string;
    reporter?: string;
}

export function useEmergencyStream() {
    const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
    const [recentAlerts, setRecentAlerts] = useState<Emergency[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);

    const fetchUpdates = useCallback(async () => {
        try {
            // For now using polling as standard on Vercel unless WS/SSE confirmed
            const url = `${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.API_ENDPOINTS.ALERTS}`;
            const res = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Accept': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Add when auth is implemented
                }
            });

            if (!res.ok) throw new Error(`Backend returned ${res.status}`);

            const data = await res.json();

            // Expected structure based on local API or standard requirements
            // Adapt as needed if backend structure differs
            if (data.location && (data.location.latitude !== activeEmergency?.latitude || data.location.longitude !== activeEmergency?.longitude)) {
                const newEmergency: Emergency = {
                    id: data.id || `EMG-${Date.now()}`,
                    type: data.type || 'Medical Emergency',
                    severity: data.severity?.toLowerCase() || 'high',
                    latitude: data.location.latitude,
                    longitude: data.location.longitude,
                    time: data.updated_at || new Date().toISOString(),
                    address: data.address || 'Unknown Location',
                    description: data.description || 'Live SOS received. Proceed immediately.',
                };
                setActiveEmergency(newEmergency);

                // Add to recent alerts
                setRecentAlerts(prev => [newEmergency, ...prev.slice(0, 4)]);
            } else if (!data.location) {
                setActiveEmergency(null);
            }

            setError(null);
            setIsConnecting(false);
        } catch (err: any) {
            console.error('Failed to connect to LifeLink backend:', err);
            setError(err.message);
            setIsConnecting(false);
        }
    }, [activeEmergency]);

    useEffect(() => {
        const interval = setInterval(fetchUpdates, BACKEND_CONFIG.POLLING_INTERVAL);
        fetchUpdates(); // Initial call
        return () => clearInterval(interval);
    }, [fetchUpdates]);

    const updateStatus = async (endpoint: string, emergencyId: string) => {
        try {
            const url = `${BACKEND_CONFIG.BASE_URL}${endpoint}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emergencyId, timestamp: new Date().toISOString() }),
            });
            return res.ok;
        } catch (err) {
            console.error(`Failed to update status at ${endpoint}:`, err);
            return false;
        }
    };

    return {
        activeEmergency,
        recentAlerts,
        error,
        isConnecting,
        updateStatus
    };
}
