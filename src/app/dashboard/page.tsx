"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Bell,
  Power,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useDriverLocation from "@/hooks/useDriverLocation";
import Sidebar, { SidebarState } from "@/components/Sidebar";
import DispatchNotification from "@/components/DispatchNotification";
import { useEmergencyStream } from "@/hooks/useEmergencyStream";
import { BACKEND_CONFIG } from "@/lib/config";

/* -------------------------------------------------------------------------- */
/*                             MAP (NO SSR)                                   */
/* -------------------------------------------------------------------------- */

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0f172a] animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-[#00d9b8] animate-spin" size={32} />
        <span className="text-[#8b92a5] text-sm font-bold tracking-widest uppercase">Initializing GPS…</span>
      </div>
    </div>
  ),
});

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type DriverStatus = "OFF_DUTY" | "AVAILABLE";

/* -------------------------------------------------------------------------- */
/*                              DASHBOARD PAGE                                */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const [appStatus, setAppStatus] = useState<DriverStatus>("AVAILABLE");
  const [sidebarState, setSidebarState] = useState<SidebarState>("INITIAL");
  const [showNotification, setShowNotification] = useState(false);

  // REAL-TIME DATA HOOK
  const { activeEmergency, recentAlerts, updateStatus } = useEmergencyStream();

  /* ---------------------------- DRIVER LOCATION ---------------------------- */

  const { currentLocation, isTracking } = useDriverLocation("DRV-101");

  const driverLocation: [number, number] | null = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : [12.9716, 77.5946]; // Fallback for demo if needed

  /* -------------------------- NOTIFICATION LOGIC --------------------------- */

  useEffect(() => {
    // Show notification only if we are idle and a new emergency arrives
    if (activeEmergency && sidebarState === "INITIAL") {
      setShowNotification(true);
    }
  }, [activeEmergency, sidebarState]);

  /* ---------------------------- HANDLERS ---------------------------- */

  const handleAccept = async () => {
    if (!activeEmergency) return;
    const success = await updateStatus(BACKEND_CONFIG.API_ENDPOINTS.ACCEPT, activeEmergency.id);
    if (success) {
      setShowNotification(false);
      setSidebarState("ACTIVE");
    }
  };

  const handleDecline = async () => {
    if (!activeEmergency) return;
    await updateStatus(BACKEND_CONFIG.API_ENDPOINTS.DECLINE, activeEmergency.id);
    setShowNotification(false);
  };

  const handleMarkArrival = async () => {
    if (!activeEmergency) return;
    const success = await updateStatus(BACKEND_CONFIG.API_ENDPOINTS.ARRIVE, activeEmergency.id);
    if (success) {
      setSidebarState("ARRIVED");
    }
  };

  const handleComplete = async () => {
    if (!activeEmergency) return;
    const success = await updateStatus(BACKEND_CONFIG.API_ENDPOINTS.COMPLETE, activeEmergency.id);
    if (success) {
      setSidebarState("INITIAL");
    }
  };

  const handleBackup = () => console.log("Requesting backup...");
  const handleHospital = () => console.log("Contacting hospital...");

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col h-screen bg-[#1a2332] text-white overflow-hidden font-sans">
      {/* HEADER */}
      <header className="h-[64px] border-b border-white/5 flex items-center justify-between px-6 bg-[#1a2332] shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#00d9b8]/10 rounded-lg">
            <Activity className="text-[#00d9b8]" size={20} />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black tracking-tighter">LIFE</span>
            <span className="text-xl font-bold text-[#8b92a5] tracking-tighter">LINK</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 bg-[#00d9b8]/10 px-4 py-1.5 rounded-full border border-[#00d9b8]/20">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isTracking ? "bg-[#00d9b8] animate-pulse" : "bg-gray-500"
              )}
            />
            <span className="text-[10px] font-black text-[#00d9b8] uppercase tracking-wider">
              {isTracking ? "GPS ACTIVE" : "GPS OFF"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#8b92a5]">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff4757] rounded-full border-2 border-[#1a2332]" />
            </button>
            <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#ff4757]">
              <Power size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar
          state={sidebarState}
          status={appStatus}
          setStatus={setAppStatus}
          onMarkArrival={handleMarkArrival}
          onCompleteEmergency={handleComplete}
          onBackup={handleBackup}
          onHospital={handleHospital}
          activeEmergency={activeEmergency}
          recentAlerts={recentAlerts}
        />

        {/* MAP / MAIN CONTENT */}
        <main className="flex-1 relative bg-[#0f172a]">
          <Map
            driverLocation={driverLocation}
            destination={
              activeEmergency
                ? [activeEmergency.latitude, activeEmergency.longitude]
                : null
            }
            isAccepted={sidebarState !== "INITIAL"}
          />

          {/* NOTIFICATION OVERLAY */}
          <DispatchNotification
            visible={showNotification}
            data={activeEmergency}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </main>
      </div>
    </div>
  );
}

