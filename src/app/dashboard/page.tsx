"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  Bell,
  Power,
  MapPin,
  XCircle,
  Navigation,
  CheckCircle2,
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

interface LiveEmergency {
  latitude: number;
  longitude: number;
  updated_at: string;
}

/* -------------------------------------------------------------------------- */
/*                              DASHBOARD PAGE                                */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const [status, setStatus] = useState<DriverStatus>("AVAILABLE");
  const [liveEmergency, setLiveEmergency] = useState<LiveEmergency | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [arrived, setArrived] = useState(false);

  /* ---------------------------- DRIVER LOCATION ---------------------------- */

  const { currentLocation, isTracking } = useDriverLocation("DRV-101");

  const driverLocation: [number, number] | null = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : null;

  /* -------------------------- POLL RECEIVER API --------------------------- */

  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const res = await fetch("/api/dispatch/alert", {
          cache: "no-store",
        });
        const data = await res.json();
        setLiveEmergency(data.location ?? null);
      } catch (err) {
        console.error("Failed to fetch emergency");
      }
    };

    fetchEmergency();
    const interval = setInterval(fetchEmergency, 5000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col h-screen bg-[#0d1b2a] text-white overflow-hidden">
      {/* HEADER */}
      <header className="h-[60px] border-b border-white/5 flex items-center justify-between px-4 bg-[#0d1b2a] shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="text-[#00ffcc]" size={22} />
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

          <Bell size={18} />
          <Link href="/">
            <Power size={18} />
          </Link>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (DESKTOP) */}
        <aside className="hidden lg:block w-[300px] bg-[#1e2936] border-r border-white/5 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-[10px] font-bold uppercase text-[#8b9bb8] mb-2">
                Status
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus("AVAILABLE")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold",
                    status === "AVAILABLE"
                      ? "bg-[#00ffcc] text-[#0d1b2a]"
                      : "bg-white/5 text-[#8b9bb8]"
                  )}
                >
                  AVAILABLE
                </button>
                <button
                  onClick={() => setStatus("OFF_DUTY")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold",
                    status === "OFF_DUTY"
                      ? "bg-white/10 text-white"
                      : "bg-white/5 text-[#8b9bb8]"
                  )}
                >
                  OFF DUTY
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase text-[#8b9bb8] mb-2">
                Current Emergency
              </h3>

              {liveEmergency ? (
                <div className="bg-[#0d1b2a] border border-[#00ffcc]/30 rounded-xl p-3 space-y-2">
                  <p className="font-mono text-[#00ffcc] text-sm">
                    {liveEmergency.latitude.toFixed(4)},{" "}
                    {liveEmergency.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-[#8b9bb8]">
                    Live SOS received. Proceed immediately.
                  </p>

                  {arrived ? (
                    <div className="flex items-center gap-2 text-xs text-green-400 font-bold">
                      <CheckCircle2 size={14} />
                      Arrived at scene
                    </div>
                  ) : accepted ? (
                    <button
                      onClick={() => setArrived(true)}
                      className="w-full bg-[#00ffcc] text-[#0d1b2a] py-2 rounded-lg text-xs font-bold"
                    >
                      MARK ARRIVAL
                    </button>
                  ) : (
                    <button
                      onClick={() => setAccepted(true)}
                      className="w-full bg-[#00ffcc] text-[#0d1b2a] py-2 rounded-lg text-xs font-bold"
                    >
                      ACCEPT DISPATCH
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#8b9bb8]">No active emergency</p>
              )}
            </div>
          </div>
        </aside>

        {/* MAP */}
        <main className="flex-1 relative bg-[#0f172a]">
          {driverLocation && (
            <Map
              driverLocation={driverLocation}
              destination={
                liveEmergency
                  ? [liveEmergency.latitude, liveEmergency.longitude]
                  : null
              }
            />
          )}

          {/* MOBILE DISPATCH CARD */}
          {liveEmergency && !accepted && (
            <div className="lg:hidden absolute top-4 left-4 right-4 z-50 bg-[#1e2936] border border-[#00ffcc]/30 rounded-2xl p-4 shadow-xl">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-[#00ffcc]">
                  New Dispatch
                </span>
                <button onClick={() => setLiveEmergency(null)}>
                  <XCircle size={16} />
                </button>
              </div>

              <p className="text-sm font-bold mb-1">
                {liveEmergency.latitude.toFixed(4)},{" "}
                {liveEmergency.longitude.toFixed(4)}
              </p>

              <button
                onClick={() => setAccepted(true)}
                className="w-full bg-[#00ffcc] text-[#0d1b2a] py-3 rounded-xl text-xs font-bold mt-3"
              >
                ACCEPT & GO
              </button>
            </div>
          )}

          {/* FLOATING ACTION */}
          {accepted && (
            <button
              onClick={() => setArrived(true)}
              className="fixed bottom-6 right-6 bg-[#00ffcc] text-[#0d1b2a] px-6 py-4 rounded-xl font-bold shadow-xl z-50"
            >
              MARK ARRIVAL
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
