"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    Bell,
    MapPin,
    Navigation,
    Power,
    Search,
    User,
    Shield,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useDriverLocation from "@/hooks/useDriverLocation";

// Dynamic import for Map to disable SSR
const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-background/50 flex items-center justify-center animate-pulse">Initializing GPS...</div>
});

type DriverStatus = "OFF_DUTY" | "AVAILABLE" | "EN_ROUTE" | "AT_SCENE";

interface Emergency {
    id: string;
    address: string;
    details: string;
    coords: [number, number];
    distance: string;
    eta: string;
    arrivedAt?: string;
    emergency_type?: string;
    priority?: string;
    caller_info?: {
        name?: string;
        phone?: string;
    };
    notes?: string;
}

export default function DashboardPage() {
    const [status, setStatus] = useState<DriverStatus>("OFF_DUTY");
    const [emergency, setEmergency] = useState<Emergency | null>(null);
    const [showDispatchAlert, setShowDispatchAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // REAL GPS Tracking (with fallback to simulated NYC if needed)
    const { currentLocation, locationError, isTracking } = useDriverLocation("DRV-101");

    // Unified Location (Prefer real GPS)
    const driverLocation: [number, number] = currentLocation
        ? [currentLocation.latitude, currentLocation.longitude]
        : [40.7128, -74.0060];

    // Simulated Destination (Default)
    const defaultDestination: [number, number] = [40.7248, -73.9960];

    // Fallback Polling for "External Dispatch" simulation
    // Since we don't have a real Socket.io server running in this environment
    useEffect(() => {
        if (status !== "AVAILABLE" || emergency) return;

        const checkDispatch = async () => {
            // In a real app, this would be a WebSocket listener.
            // Here we simulate checking a "global dispatch state"
            try {
                // Simulating checking if an emergency was assigned to this driver
                // We'll use a timeout to represent a dispatch coming from the external API
                // (In the real flow, the External API would trigger a state change)
            } catch (e) { }
        };

        const interval = setInterval(checkDispatch, 5000);
        return () => clearInterval(interval);
    }, [status, emergency]);

    const handleArrivalAtScene = async () => {
        if (!emergency || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/emergency/arrive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emergency_id: emergency.id,
                    driver_id: "DRV-101", // Match mock DRV id
                    arrival_time: new Date().toISOString(),
                    location: {
                        latitude: driverLocation[0],
                        longitude: driverLocation[1]
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to mark arrival');
            }

            setStatus("AT_SCENE");
            setEmergency(prev => prev ? ({ ...prev, arrivedAt: data.data.arrived_at }) : null);

        } catch (error) {
            console.error("Failed to arrive:", error);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = (newStatus: DriverStatus) => {
        setStatus(newStatus);
        if (newStatus === "OFF_DUTY") {
            setEmergency(null);
            setShowDispatchAlert(false);
        } else if (newStatus === "AVAILABLE") {
            // Simulate Local Dispatch Demo after 2 seconds
            setTimeout(() => {
                if (!emergency) setShowDispatchAlert(true);
            }, 2000);
        }
    };

    const acceptDispatch = (manualEmergency?: Emergency) => {
        setShowDispatchAlert(false);

        const newEmergency = manualEmergency || {
            id: "EMG-2024-001234",
            address: "123 Medical Way, New York, NY",
            details: "Proceed with caution on 5th Ave. Patient reporting chest pains.",
            coords: defaultDestination,
            distance: "1.2 mi",
            eta: "04:32",
            priority: "high"
        };

        setEmergency(newEmergency);
        setStatus("EN_ROUTE");

        // Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New Emergency Dispatch", {
                body: `Emergency at ${newEmergency.address}`,
            });
        }
    };

    const routeCoords: [number, number][] = emergency ? [
        driverLocation,
        [driverLocation[0] + 0.002, driverLocation[1] + 0.004],
        [emergency.coords[0] - 0.002, emergency.coords[1] - 0.004],
        emergency.coords
    ] : [];

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            {/* HEADER */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shrink-0 z-50 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <Shield className="text-primary fill-primary/20" />
                        <span>RAPID<span className="text-primary">RESPONSE</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-xs font-mono border border-border">
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            status === "OFF_DUTY" ? "bg-muted" : "bg-green-500 animate-pulse"
                        )}></span>
                        <span>UNIT 402 • {status.replace('_', ' ')}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* GPS Status Indicator */}
                    <div className={cn(
                        "hidden md:flex items-center gap-2 text-xs font-bold transition-all px-3 py-1.5 rounded-lg border",
                        isTracking
                            ? "text-green-400 bg-green-500/10 border-green-500/20"
                            : locationError
                                ? "text-destructive bg-destructive/10 border-destructive/20"
                                : "text-muted-foreground bg-muted/10 border-border"
                    )}>
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isTracking ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-muted"
                        )}></div>
                        {isTracking ? "GPS ACTIVE" : (locationError ? "GPS ERROR" : "GPS INITIALIZING...")}
                        {currentLocation?.accuracy && (
                            <span className="text-[10px] text-muted-foreground ml-1">±{Math.round(currentLocation.accuracy)}m</span>
                        )}
                    </div>

                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border hover:border-primary transition-colors cursor-pointer">
                        <Bell size={16} />
                    </div>

                    <Link href="/" className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all cursor-pointer" title="Logout">
                        <Power size={16} />
                    </Link>

                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                        JD
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT PANEL */}
                <aside className="w-full md:w-[400px] flex flex-col border-r border-border bg-card/50 backdrop-blur-sm z-40">

                    {/* Status Toggle */}
                    <div className="p-4 border-b border-border">
                        <div className="grid grid-cols-2 gap-2 bg-background p-1 rounded-xl border border-border">
                            <button
                                onClick={() => handleToggleStatus("AVAILABLE")}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all",
                                    status !== "OFF_DUTY"
                                        ? "bg-success text-success-foreground shadow-lg shadow-success/20"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <CheckCircle2 size={18} />
                                AVAILABLE
                            </button>
                            <button
                                onClick={() => handleToggleStatus("OFF_DUTY")}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all",
                                    status === "OFF_DUTY"
                                        ? "bg-muted text-white shadow-inner"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <XCircle size={18} />
                                OFF-DUTY
                            </button>
                        </div>
                    </div>

                    {/* Emergency Info Panel */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {status === "OFF_DUTY" && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                                <Power size={48} />
                                <p>System Offline</p>
                            </div>
                        )}

                        {(status === "AVAILABLE" && !emergency) && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 animate-in fade-in duration-500">
                                <div className="relative">
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></span>
                                    <Navigation size={48} className="text-primary/50" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-white">Scanning for Dispatches</p>
                                    <p className="text-xs mt-1">Standby in current location</p>
                                </div>
                            </div>
                        )}

                        {emergency && (
                            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                                {/* Current Emergency Header */}
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                            {emergency.emergency_type || "Current Emergency"}
                                        </span>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded border animate-pulse",
                                            emergency.priority === "critical"
                                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                        )}>
                                            PRIORITY {emergency.priority?.toUpperCase() || "HIGH"}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white leading-tight">{emergency.address}</h2>
                                    <p className="text-sm text-muted-foreground mt-2">{emergency.details}</p>

                                    {emergency.notes && (
                                        <div className="mt-3 p-3 bg-background/50 rounded-lg border border-border/50 text-xs text-muted-foreground italic">
                                            Note: {emergency.notes}
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Instructions */}
                                <div className="bg-background border border-border rounded-xl p-0 overflow-hidden">
                                    <div className="p-4 flex gap-4 items-center bg-muted/30">
                                        <ArrowIcon direction="left" />
                                        <div>
                                            <div className="text-xs uppercase text-muted-foreground font-bold">Next Turn</div>
                                            <div className="text-lg font-bold text-white">Left on Main St</div>
                                            <div className="text-primary font-mono font-bold">In 400 yards</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                                        <div className="p-4 text-center">
                                            <div className="text-xs uppercase text-muted-foreground">Est. Arrival</div>
                                            <div className="text-xl font-bold text-green-400">{emergency.eta}</div>
                                            <div className="text-[10px] text-green-500/80">-12% traffic</div>
                                        </div>
                                        <div className="p-4 text-center">
                                            <div className="text-xs uppercase text-muted-foreground">Distance</div>
                                            <div className="text-xl font-bold text-white">{emergency.distance}</div>
                                            <div className="text-[10px] text-muted-foreground">Fastest path</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3 pt-4">
                                    {status === "AT_SCENE" ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                            {/* Arrival Confirmation */}
                                            <div className="bg-green-900/40 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
                                                <div className="bg-green-500/20 p-2 rounded-full">
                                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white leading-tight">Arrived at Scene</p>
                                                    <p className="text-sm text-green-200/60">
                                                        {emergency.arrivedAt ? new Date(emergency.arrivedAt).toLocaleTimeString() : "Just now"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Completion Options */}
                                            <button
                                                onClick={() => {
                                                    setEmergency(null);
                                                    setStatus("AVAILABLE");
                                                }}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>COMPLETE EMERGENCY</span>
                                            </button>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-200 py-3 rounded-lg text-sm font-semibold transition-all">
                                                    Contact Hospital
                                                </button>
                                                <button className="bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 text-amber-200 py-3 rounded-lg text-sm font-semibold transition-all">
                                                    Request Backup
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleArrivalAtScene}
                                                disabled={isLoading || status !== "EN_ROUTE"}
                                                className={cn(
                                                    "w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all",
                                                    isLoading
                                                        ? "bg-muted text-muted-foreground cursor-wait"
                                                        : "bg-primary hover:bg-primary/90 text-white shadow-primary/20 hover:scale-[1.02]"
                                                )}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        <span>UPDATING...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin size={20} />
                                                        <span>ARRIVED AT SCENE</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                disabled={isLoading}
                                                className="w-full bg-card hover:bg-muted border border-border text-muted-foreground text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Navigation size={16} />
                                                <span>Recalculate Route</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    <div className="p-4 border-t border-border bg-background">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                type="text"
                                placeholder="Enter dispatch code..."
                                className="w-full bg-input/50 pl-10 pr-4 py-2.5 rounded-lg border border-input text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </div>
                </aside>

                {/* MAP AREA */}
                <main className="flex-1 relative bg-neutral-900">
                    <Map
                        driverLocation={driverLocation}
                        destination={emergency?.coords || null}
                        routeCoords={emergency ? routeCoords : undefined}
                    />

                    {/* Overlays */}
                    <div className="absolute top-4 right-4 z-[400]">
                        {/* Dispatch Alert Notification */}
                        {showDispatchAlert && (
                            <div className="w-80 bg-primary text-white rounded-xl shadow-2xl p-4 overflow-hidden animate-in slide-in-from-top duration-300 border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                        New Dispatch Msg
                                    </div>
                                    <button onClick={() => setShowDispatchAlert(false)} className="text-white/50 hover:text-white"><XCircle size={16} /></button>
                                </div>
                                <p className="font-semibold text-lg mb-1 leading-tight">Medical Emergency</p>
                                <p className="text-sm text-blue-100 mb-4 line-clamp-2">Proceed with caution on 5th Ave. Patient reporting chest pains...</p>

                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setShowDispatchAlert(false)} className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                        Decline
                                    </button>
                                    <button onClick={() => acceptDispatch()} className="bg-white text-primary hover:bg-white/90 py-2 rounded-lg text-sm font-bold shadow-lg transition-colors">
                                        Accept & Go
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hazard Button */}
                    <button className="absolute bottom-6 right-6 z-[400] w-12 h-12 bg-destructive text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform" title="Report Hazard">
                        <AlertTriangle size={24} />
                    </button>
                </main>
            </div>
        </div>
    );
}

// Simple Arrow Component for Turn Directions
const ArrowIcon = ({ direction }: { direction: "left" | "right" | "straight" }) => {
    return (
        <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center border border-border">
            <Navigation size={24} className="-rotate-90 fill-primary text-primary" />
        </div>
    )
}
