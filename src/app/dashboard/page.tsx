"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Bell,
  MapPin,
  Navigation,
  Power,
  Shield,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useDriverLocation from "@/hooks/useDriverLocation";

// Disable SSR for map
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center animate-pulse">
      Initializing GPS…
    </div>
  ),
});

type DriverStatus = "OFF_DUTY" | "AVAILABLE" | "EN_ROUTE" | "AT_SCENE";

interface Emergency {
  id: string;
  address: string;
  details: string;
  coords: [number, number];
  arrivedAt?: string;
}

export default function DashboardPage() {
  const [status, setStatus] = useState<DriverStatus>("OFF_DUTY");
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [showDispatchAlert, setShowDispatchAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Driver GPS
  const { currentLocation, isTracking } = useDriverLocation("DRV-101");

  const driverLocation: [number, number] | null = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : null;

  // Live emergency from backend
  const [liveEmergency, setLiveEmergency] = useState<{
    latitude: number;
    longitude: number;
    updated_at: string;
  } | null>(null);

  // Poll emergency API
  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/emergency", {
          cache: "no-store",
        });
        const data = await res.json();
        setLiveEmergency(data.location ?? null);
      } catch {
        console.error("Failed to fetch emergency");
      }
    };

    fetchEmergency();
    const interval = setInterval(fetchEmergency, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show popup when available + emergency exists
  useEffect(() => {
    if (status === "AVAILABLE" && liveEmergency && !emergency) {
      setShowDispatchAlert(true);
    }
  }, [status, liveEmergency, emergency]);

  const handleToggleStatus = (newStatus: DriverStatus) => {
    setStatus(newStatus);
    if (newStatus === "OFF_DUTY") {
      setEmergency(null);
      setShowDispatchAlert(false);
    }
  };

  const acceptDispatch = () => {
    if (!liveEmergency) return;

    setEmergency({
      id: "EMG-LIVE-001",
      address: `Emergency at ${liveEmergency.latitude.toFixed(4)}, ${liveEmergency.longitude.toFixed(4)}`,
      details: "Live SOS received. Proceed immediately.",
      coords: [liveEmergency.latitude, liveEmergency.longitude],
    });

    setStatus("EN_ROUTE");
    setShowDispatchAlert(false);
  };

  const handleArrivalAtScene = async () => {
    if (!emergency || !driverLocation || isLoading) return;

    setIsLoading(true);
    try {
      await fetch("/api/emergency/arrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergency_id: emergency.id,
          driver_id: "DRV-101",
          arrival_time: new Date().toISOString(),
          location: {
            latitude: driverLocation[0],
            longitude: driverLocation[1],
          },
        }),
      });

      setStatus("AT_SCENE");
      setEmergency((prev) =>
        prev ? { ...prev, arrivedAt: new Date().toISOString() } : null
      );
    } catch {
      alert("Failed to mark arrival");
    } finally {
      setIsLoading(false);
    }
  };

  const completeEmergency = async () => {
    try {
      await fetch("http://localhost:3000/api/emergency", {
        method: "DELETE",
      });

      setEmergency(null);
      setLiveEmergency(null);
      setShowDispatchAlert(false);
      setStatus("AVAILABLE");

      console.log("Emergency cleared");
    } catch {
      alert("Failed to clear emergency");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="h-16 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold">
          <Shield className="text-primary" />
          RAPID<span className="text-primary">RESPONSE</span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              "text-xs font-bold px-3 py-1 rounded border",
              isTracking
                ? "text-green-400 border-green-500"
                : "text-muted-foreground border-border"
            )}
          >
            {isTracking ? "GPS ACTIVE" : "GPS INACTIVE"}
          </div>

          <Bell size={16} />
          <Link href="/">
            <Power size={16} />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <aside className="w-[380px] border-r p-4 space-y-4">
          {/* STATUS */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToggleStatus("AVAILABLE")}
              className={cn(
                "py-3 rounded font-bold",
                status !== "OFF_DUTY"
                  ? "bg-green-600 text-white"
                  : "bg-muted"
              )}
            >
              AVAILABLE
            </button>
            <button
              onClick={() => handleToggleStatus("OFF_DUTY")}
              className={cn(
                "py-3 rounded font-bold",
                status === "OFF_DUTY"
                  ? "bg-muted text-white"
                  : "bg-muted/40"
              )}
            >
              OFF DUTY
            </button>
          </div>

          {/* EMERGENCY PANEL */}
          {emergency && (
            <div className="border rounded p-4 space-y-3">
              <h2 className="font-bold">{emergency.address}</h2>
              <p className="text-sm text-muted-foreground">
                {emergency.details}
              </p>

              {status === "EN_ROUTE" && (
                <button
                  onClick={handleArrivalAtScene}
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded font-bold"
                >
                  ARRIVED AT SCENE
                </button>
              )}

              {status === "AT_SCENE" && (
                <>
                  <div className="text-green-500 font-bold">
                    Arrived at scene
                  </div>
                  <button
                    onClick={completeEmergency}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold"
                  >
                    COMPLETE EMERGENCY
                  </button>
                </>
              )}
            </div>
          )}
        </aside>

        {/* MAP */}
        <main className="flex-1 relative">
          <Map
            driverLocation={driverLocation}
            destination={emergency?.coords || null}
          />

          {/* DISPATCH POPUP */}
          {showDispatchAlert && liveEmergency && (
            <div className="absolute top-4 right-4 w-80 bg-primary text-white p-4 rounded-xl shadow-xl">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-xs uppercase">
                  New Dispatch
                </span>
                <button onClick={() => setShowDispatchAlert(false)}>
                  <XCircle size={16} />
                </button>
              </div>

              <p className="font-bold text-lg">Medical Emergency</p>
              <p className="text-sm mb-4">
                SOS at {liveEmergency.latitude.toFixed(4)},{" "}
                {liveEmergency.longitude.toFixed(4)}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowDispatchAlert(false)}
                  className="bg-white/10 py-2 rounded"
                >
                  Decline
                </button>
                <button
                  onClick={acceptDispatch}
                  className="bg-white text-primary py-2 rounded font-bold"
                >
                  Accept & Go
                </button>
              </div>
            </div>
          )}

          {/* HAZARD BUTTON */}
          <button className="absolute bottom-6 right-6 w-12 h-12 bg-destructive text-white rounded-full flex items-center justify-center">
            <AlertTriangle />
          </button>
        </main>
      </div>
    </div>
  );
}
