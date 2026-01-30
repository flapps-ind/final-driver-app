"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  XCircle,
  Phone,
  Users,
  Activity,
  CheckCircle2,
  MapPin,
  MoreVertical,
  Navigation,
  Bell,
  Power,
  Search,
  Loader2,
  Menu,
  Target,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useDriverLocation from "@/hooks/useDriverLocation";

/* -------------------------------------------------------------------------- */
/*                             MAP (NO SSR)                                   */
/* -------------------------------------------------------------------------- */

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center animate-pulse">
      Initializing GPS…
    </div>
  ),
});

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type DriverStatus = "OFF_DUTY" | "AVAILABLE" | "EN_ROUTE" | "AT_SCENE";

interface Emergency {
  id: string;
  coords: [number, number];
  arrivedAt?: string;
}

/* -------------------------------------------------------------------------- */
/*                              DASHBOARD PAGE                                */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const [status, setStatus] = useState<DriverStatus>("OFF_DUTY");
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [showDispatchAlert, setShowDispatchAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* ---------------------------- DRIVER LOCATION ---------------------------- */

  const { currentLocation, isTracking } = useDriverLocation("DRV-101");

  const driverLocation: [number, number] | null = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : null;

  /* ---------------------------- LIVE EMERGENCY ----------------------------- */

  const [liveEmergency, setLiveEmergency] = useState<{
    latitude: number;
    longitude: number;
    updated_at: string;
  } | null>(null);

  // ✅ POLL RECEIVER API (NO LOCALHOST)
  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const res = await fetch("/api/dispatch/alert", {
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

  /* -------------------------- DISPATCH POPUP LOGIC -------------------------- */

  useEffect(() => {
    if (
      status === "AVAILABLE" &&
      liveEmergency &&
      !emergency &&
      !showDispatchAlert
    ) {
      setShowDispatchAlert(true);

      const timer = setTimeout(() => {
        setShowDispatchAlert(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [status, liveEmergency, emergency, showDispatchAlert]);

  const acceptDispatch = () => {
    if (!liveEmergency) return;

    setEmergency({
      id: "LIVE-EMERGENCY",
      coords: [liveEmergency.latitude, liveEmergency.longitude],
    });

    setStatus("EN_ROUTE");
    setShowDispatchAlert(false);
  };

  const handleArrivalAtScene = () => {
    if (!emergency || isLoading) return;
    setIsLoading(true);

    setTimeout(() => {
      setStatus("AT_SCENE");
      setEmergency((prev) =>
        prev ? { ...prev, arrivedAt: new Date().toISOString() } : null
      );
      setIsLoading(false);
    }, 1000);
  };

  const completeEmergency = async () => {
    setEmergency(null);
    setLiveEmergency(null);
    setShowDispatchAlert(false);
    setStatus("AVAILABLE");
  };

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col h-screen bg-[#0d1b2a] text-white overflow-hidden">
      {/* HEADER */}
      <header className="h-[60px] border-b border-white/5 flex items-center justify-between px-4 bg-[#0d1b2a]">
        <div className="flex items-center gap-2">
          <Activity className="text-[#00ffcc]" size={24} />
          <span className="text-xl font-black">Life</span>
          <span className="text-xl font-bold text-[#8b9bb8]">Link</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-[#00ffcc]/10 px-3 py-1 rounded-full">
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isTracking ? "bg-[#00ffcc]" : "bg-gray-500"
              )}
            />
            <span className="text-[10px] font-bold text-[#00ffcc]">
              {isTracking ? "GPS ACTIVE" : "GPS OFF"}
            </span>
          </div>

          <Bell size={20} />
          <Link href="/">
            <Power size={20} />
          </Link>
        </div>
      </header>

      {/* MAP */}
      <main className="flex-1 relative">
        {driverLocation && (
          <Map
            driverLocation={driverLocation}
            destination={emergency?.coords || null}
          />
        )}

        {/* DISPATCH POPUP */}
        {showDispatchAlert && liveEmergency && (
          <div className="fixed top-20 right-6 z-[1000] w-80 bg-[#1e2936] border border-[#00ffcc]/30 p-5 rounded-2xl shadow-2xl">
            <div className="flex justify-between mb-3">
              <span className="text-[10px] font-bold text-[#00ffcc] uppercase">
                New Dispatch
              </span>
              <button onClick={() => setShowDispatchAlert(false)}>
                <XCircle size={18} />
              </button>
            </div>

            <p className="font-bold text-lg mb-1">Medical Emergency</p>
            <p className="text-xs font-mono text-[#8b9bb8] mb-6">
              SOS at {liveEmergency.latitude.toFixed(4)},{" "}
              {liveEmergency.longitude.toFixed(4)}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDispatchAlert(false)}
                className="bg-white/5 py-3 rounded-xl text-xs font-bold"
              >
                Decline
              </button>
              <button
                onClick={acceptDispatch}
                className="bg-[#00ffcc] text-[#0d1b2a] py-3 rounded-xl font-bold"
              >
                Accept & Go
              </button>
            </div>
          </div>
        )}

        {/* ACTION BUTTON */}
        {emergency && (
          <div className="fixed bottom-6 right-6 z-[1000]">
            {status === "EN_ROUTE" ? (
              <button
                onClick={handleArrivalAtScene}
                disabled={isLoading}
                className="bg-[#00ffcc] text-[#0d1b2a] px-6 py-4 rounded-xl font-bold shadow-xl"
              >
                {isLoading ? "Marking…" : "MARK ARRIVAL"}
              </button>
            ) : (
              <button
                onClick={completeEmergency}
                className="bg-[#00ffcc] text-[#0d1b2a] px-6 py-4 rounded-xl font-bold shadow-xl"
              >
                COMPLETE EMERGENCY
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
