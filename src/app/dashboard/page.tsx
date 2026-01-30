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
  FileText,
  Settings,
  User,
  LayoutGrid,
  Plus,
  Minus,
  Target,
  Check,
  ChevronUp,
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
  address: string;
  details: string;
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
  const [activeTab, setActiveTab] = useState("MAP");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* ---------------------------- SEARCH LOGIC ------------------------------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<[number, number] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Check if it's coordinates (lat, lon)
      const coordMatch = searchQuery.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
      if (coordMatch) {
        setSearchResult([parseFloat(coordMatch[1]), parseFloat(coordMatch[2])]);
      } else {
        // Use Nominatim (OSM) for free geocoding
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          setSearchResult([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          alert("Location not found");
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

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

  /* -------------------------- DISPATCH POPUP LOGIC -------------------------- */

  useEffect(() => {
    if (status === "AVAILABLE" && liveEmergency && !emergency && !showDispatchAlert) {
      setShowDispatchAlert(true);

      // Auto-dismiss after 30 seconds
      const timer = setTimeout(() => {
        setShowDispatchAlert(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [status, liveEmergency, emergency, showDispatchAlert]);

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
      address: `Emergency at ${liveEmergency.latitude.toFixed(
        4
      )}, ${liveEmergency.longitude.toFixed(4)}`,
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
    } catch {
      alert("Failed to clear emergency");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col h-screen bg-[#0d1b2a] text-white font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-[60px] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 bg-[#0d1b2a] shrink-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Activity className="text-[#00ffcc]" size={24} />
          <span className="lg:block hidden">LIFE</span>
          <span className="lg:block hidden text-muted-foreground font-normal">LINK</span>
          <span className="lg:hidden block text-sm tracking-widest uppercase">LIFELINK</span>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden lg:flex items-center gap-2 bg-[#00ffcc]/10 px-3 py-1 rounded-full border border-[#00ffcc]/20">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isTracking ? "bg-[#00ffcc]" : "bg-muted-foreground"
            )} />
            <span className="text-[10px] font-bold text-[#00ffcc] tracking-wider uppercase">
              {isTracking ? "GPS ACTIVE" : "GPS INACTIVE"}
            </span>
          </div>

          <div className="flex items-center gap-3 lg:gap-4 text-[#8b9bb8]">
            <div className="relative">
              <Bell size={20} className="cursor-pointer hover:text-white transition-colors" />
              {/* Notification Badge - Only show when meaningful (placeholder for future logic) */}
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden">
              <Menu size={20} className="cursor-pointer hover:text-white transition-colors" />
            </button>
            <Link href="/" className="hidden lg:block">
              <Power size={20} className="cursor-pointer hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Status Toggles */}
      <div className="lg:hidden bg-[#0d1b2a] py-2 flex justify-center shrink-0">
        <div className="flex bg-[#1e2936] p-1 rounded-full border border-white/5 w-64 shadow-xl">
          <button
            onClick={() => handleToggleStatus("AVAILABLE")}
            className={cn(
              "flex-1 py-1.5 rounded-full font-bold text-[10px] tracking-widest transition-all flex items-center justify-center gap-2",
              status !== "OFF_DUTY"
                ? "bg-[#00ffcc] text-[#0d1b2a]"
                : "text-[#8b92a8]"
            )}
          >
            <div className={cn("w-1.5 h-1.5 rounded-full", status !== "OFF_DUTY" ? "bg-[#0d1b2a] animate-pulse" : "bg-transparent")} />
            AVAILABLE
          </button>
          <button
            onClick={() => handleToggleStatus("OFF_DUTY")}
            className={cn(
              "flex-1 py-1.5 rounded-full font-bold text-[10px] tracking-widest transition-all",
              status === "OFF_DUTY"
                ? "text-white"
                : "text-[#8b92a8]"
            )}
          >
            OFF DUTY
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL (Sidebar - Desktop Only) */}
        <aside className="hidden lg:block w-[300px] bg-[#1e2936] border-r border-white/5 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-6">
            {/* Status Toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleStatus("AVAILABLE")}
                className={cn(
                  "flex-1 py-2.5 rounded-lg font-bold text-xs transition-all",
                  status !== "OFF_DUTY"
                    ? "bg-[#00d9b5] text-[#1a2332] shadow-lg shadow-[#00d9b5]/20"
                    : "bg-transparent text-muted-foreground hover:text-white"
                )}
              >
                AVAILABLE
              </button>
              <button
                onClick={() => handleToggleStatus("OFF_DUTY")}
                className={cn(
                  "flex-1 py-2.5 rounded-lg font-bold text-xs transition-all",
                  status === "OFF_DUTY"
                    ? "bg-[#2d3548] text-white"
                    : "bg-transparent text-muted-foreground hover:text-white"
                )}
              >
                OFF DUTY
              </button>
            </div>

            {/* Emergency Section */}
            {emergency && (
              <div className="bg-[#1a2332]/50 border border-[#00d9b5]/30 rounded-xl p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Emergency</span>
                    <h2 className="font-mono text-lg font-bold tracking-tight text-[#00d9b5]">
                      {emergency.coords[0].toFixed(4)}, {emergency.coords[1].toFixed(4)}
                    </h2>
                  </div>
                  <MapPin size={18} className="text-[#00d9b5]" />
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Live SOS received. Proceed immediately to the marked location.
                </p>

                {status === "AT_SCENE" && (
                  <div className="flex items-center gap-2 text-[#00d97e] text-xs font-bold">
                    <CheckCircle2 size={14} />
                    Arrived at scene
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {status === "EN_ROUTE" && (
                    <button
                      onClick={handleArrivalAtScene}
                      disabled={isLoading}
                      className="w-full bg-[#00d9b5] text-[#1a2332] py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#00c4a4] transition-colors"
                    >
                      <Navigation size={14} />
                      MARK ARRIVAL
                    </button>
                  )}

                  {status === "AT_SCENE" && (
                    <>
                      <button
                        onClick={completeEmergency}
                        className="w-full bg-[#00d97e] text-[#1a2332] py-3 rounded-lg font-bold text-xs hover:bg-[#00c674] transition-colors"
                      >
                        COMPLETE EMERGENCY
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => alert('Requesting backup...')}
                          className="bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-[#6366f1]/20 transition-colors"
                        >
                          <Users size={12} />
                          BACKUP
                        </button>
                        <button
                          onClick={() => window.location.href = 'tel:911'}
                          className="bg-[#4a9eff]/10 text-[#4a9eff] border border-[#4a9eff]/20 py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-[#4a9eff]/20 transition-colors"
                        >
                          <Phone size={12} />
                          HOSPITAL
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Quick Statistics */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Quick Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1a2332]/30 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Avg Response</p>
                  <p className="text-xl font-bold text-[#00d9b5]">4.2<span className="text-xs ml-0.5">m</span></p>
                </div>
                <div className="bg-[#1a2332]/30 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Active Units</p>
                  <p className="text-xl font-bold text-[#4a9eff]">12/15</p>
                </div>
              </div>
            </div>

            {/* Responder Team */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Responder Team</h3>
              <div className="space-y-2">
                {[
                  { id: "Alpha-1", status: "ONLINE", color: "text-[#00d97e]" },
                  { id: "Bravo-4", status: "BUSY", color: "text-[#ff9500]" }
                ].map((unit) => (
                  <div key={unit.id} className="group bg-[#1a2332]/30 p-3 rounded-xl border border-white/5 flex items-center justify-between hover:bg-[#1a2332]/60 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2d3548] flex items-center justify-center">
                        <Users size={14} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Unit {unit.id}</p>
                        <p className={cn("text-[9px] font-bold", unit.color)}>{unit.status}</p>
                      </div>
                    </div>
                    <MoreVertical size={14} className="text-muted-foreground group-hover:text-white" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Alerts</h3>
                <button className="text-[9px] font-bold text-[#00d9b5] hover:underline uppercase">View All</button>
              </div>
              <div className="space-y-4 pt-1">
                {[
                  { title: "Medical Emergency - Mallikatte", time: "2 mins ago • High Severity", dot: "bg-[#ff3b30]" },
                  { title: "Traffic Incident - Light House Hill", time: "14 mins ago • Medium Severity", dot: "bg-[#ff9500]" }
                ].map((alert, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5", alert.dot)} />
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium leading-tight">{alert.title}</p>
                      <p className="text-[10px] text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAP + OVERLAYS */}
        <main className="flex-1 relative overflow-hidden bg-[#0f172a]">
          {/* Coordinates Overlay (Mobile) */}
          <div className="lg:hidden absolute top-4 left-4 z-20">
            <div className="bg-[#0f1b2e]/80 backdrop-blur-md border border-white/5 px-2 py-1.5 rounded-lg text-[9px] font-mono font-bold text-[#8b9bb8] shadow-lg">
              {driverLocation ? (
                <div className="space-y-0.5">
                  <p>LAT: {driverLocation[0].toFixed(4)}</p>
                  <p>LON: {driverLocation[1].toFixed(4)}</p>
                </div>
              ) : (
                <p>LOCATING...</p>
              )}
            </div>
          </div>

          {/* Map Controls (Mobile) */}
          <div className="lg:hidden absolute top-1/2 -translate-y-1/2 right-4 z-20 flex flex-col gap-2">
            <div className="flex flex-col bg-[#1e2d3d]/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-2xl">
              <button className="p-2.5 text-[#8b9bb8] active:bg-white/10 transition-colors border-b border-white/5">
                <Plus size={18} />
              </button>
              <button className="p-2.5 text-[#8b9bb8] active:bg-white/10 transition-colors">
                <Minus size={18} />
              </button>
            </div>
            <button className="w-10 h-10 bg-[#00ffcc] text-[#0d1b2a] rounded-lg flex items-center justify-center shadow-lg shadow-[#00ffcc]/20 active:scale-90 transition-all">
              <Target size={18} />
            </button>
          </div>

          {/* Map Search Bar (Desktop Only) */}
          <div className="hidden lg:block absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
            <form onSubmit={handleSearch} className="bg-[#1a2332]/80 backdrop-blur-lg border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3 shadow-2xl">
              {isSearching ? (
                <Loader2 size={16} className="text-[#00d9b5] animate-spin" />
              ) : (
                <Search size={16} className="text-muted-foreground" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coordinates (lat, lon) or location..."
                className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-muted-foreground/50 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSearchResult(null); }}
                  className="text-muted-foreground hover:text-white"
                >
                  <XCircle size={14} />
                </button>
              )}
            </form>
          </div>

          {/* MAP LAYER */}
          <div className="absolute inset-0 z-0">
            {driverLocation && (
              <Map
                driverLocation={driverLocation}
                destination={emergency?.coords || null}
                searchLocation={searchResult}
              />
            )}
          </div>

          {/* HAZARD BUTTON (Desktop Only) */}
          <button className="hidden lg:flex fixed bottom-6 right-6 z-[1000] w-14 h-14 bg-[#ff3b30] text-white rounded-2xl items-center justify-center shadow-xl shadow-[#ff3b30]/30 hover:scale-105 active:scale-95 transition-all">
            <AlertTriangle size={24} />
          </button>

          {/* Map Overlay Elements (Desktop Only) */}
          <div className="hidden lg:flex absolute bottom-4 left-4 z-10 flex-col gap-1 text-[10px] font-mono text-muted-foreground bg-[#1a2332]/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/5">
            {driverLocation && (
              <>
                <div className="flex gap-4">
                  <span>LAT: {driverLocation[0].toFixed(4)}</span>
                  <span>LON: {driverLocation[1].toFixed(4)}</span>
                </div>
                <div>SCALE: 1:5000</div>
              </>
            )}
          </div>

          {/* MOBILE NOTIFICATION POPUP */}
          {showDispatchAlert && liveEmergency && (
            <div className="lg:hidden absolute top-4 right-4 left-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-[#1e2936] border border-[#00ffcc]/30 text-white p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-[10px] uppercase tracking-widest text-[#00ffcc]">
                    New Dispatch
                  </span>
                  <button onClick={() => setShowDispatchAlert(false)} className="text-[#8b9bb8] hover:text-white transition-colors">
                    <XCircle size={18} />
                  </button>
                </div>

                <p className="font-bold text-lg mb-0.5">Medical Emergency</p>
                <p className="text-xs text-[#8b9bb8] mb-6 font-mono flex items-center gap-2">
                  <MapPin size={12} className="text-[#00ffcc]" />
                  SOS at {liveEmergency.latitude.toFixed(4)}, {liveEmergency.longitude.toFixed(4)}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowDispatchAlert(false)}
                    className="bg-white/5 py-3 rounded-xl text-xs font-bold transition-colors border border-white/5 active:bg-white/10"
                  >
                    Decline
                  </button>
                  <button
                    onClick={acceptDispatch}
                    className="bg-[#00ffcc] text-[#0d1b2a] py-3 rounded-xl font-bold text-xs active:bg-[#00e5b8] transition-colors shadow-lg shadow-[#00ffcc]/20"
                  >
                    Accept & Go
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM SHEET (Mobile) */}
          {emergency && (
            <div className="lg:hidden absolute bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-full">
              <div className="bg-[#1a2536] border-t border-white/10 rounded-t-[20px] p-6 pt-2 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                {/* Drag Handle */}
                <div className="flex justify-center mb-6">
                  <div className="w-10 h-1 bg-white/10 rounded-full" />
                </div>

                {/* Emergency Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#8b9bb8] uppercase tracking-widest">Current Emergency</p>
                    <h2 className="text-2xl font-bold tracking-tight text-[#00ffcc]">
                      {emergency.coords[0].toFixed(4)}, {emergency.coords[1].toFixed(4)}
                    </h2>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[#00ffcc] font-bold text-xs">
                      <Target size={16} />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[13px] text-[#8b92a8] leading-relaxed font-medium">
                    Live SOS received. Proceed immediately to the marked location.
                  </p>

                  {status === "AT_SCENE" && (
                    <div className="flex items-center gap-2 text-[#00ffcc] text-sm font-bold mt-4 animate-in fade-in slide-in-from-left-2">
                      <div className="w-5 h-5 rounded-full border border-[#00ffcc] flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Arrived at scene</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {status === "EN_ROUTE" ? (
                  <button
                    onClick={handleArrivalAtScene}
                    disabled={isLoading}
                    className="w-full bg-[#00ffcc] hover:bg-[#00e5b8] text-[#0d1b2a] font-bold py-4 rounded-[15px] flex items-center justify-center gap-2 mb-4 transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(0,255,204,0.3)]"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                    <span>MARK ARRIVAL</span>
                  </button>
                ) : (
                  <button
                    onClick={completeEmergency}
                    className="w-full bg-[#00ffcc] hover:bg-[#00e5b8] text-[#0d1b2a] font-bold py-4 rounded-[15px] flex items-center justify-center gap-2 mb-4 transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(0,255,204,0.3)] animate-in zoom-in-95 duration-300"
                  >
                    <span>COMPLETE EMERGENCY</span>
                  </button>
                )}

                {/* Secondary Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-[#1e2d3d] border border-white/5 py-4 rounded-[15px] flex items-center justify-center gap-2 text-xs font-bold text-[#8b9bb8] active:bg-white/5 transition-colors">
                    <Users size={18} className="text-[#8b9bb8]" />
                    BACKUP
                  </button>
                  <button className="bg-[#1e2d3d] border border-white/5 py-4 rounded-[15px] flex items-center justify-center gap-2 text-xs font-bold text-[#8b9bb8] active:bg-white/5 transition-colors">
                    <Phone size={18} className="text-[#8b9bb8]" />
                    HOSPITAL
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* DISPATCH POPUP (Desktop Only) */}
          {showDispatchAlert && liveEmergency && (
            <div className="hidden lg:block fixed top-20 right-6 z-[1000] w-80 bg-[#1e2936] border border-[#00d9b5]/30 text-white p-5 rounded-2xl shadow-2xl backdrop-blur-xl transition-all">
              <div className="flex justify-between mb-3">
                <span className="font-bold text-[10px] lg:text-[10px] uppercase tracking-widest text-[#00d9b5]">
                  {activeTab === "MAP" ? "New Dispatch" : "Priority Alert"}
                </span>
                <button onClick={() => setShowDispatchAlert(false)} className="text-muted-foreground hover:text-white transition-colors">
                  <XCircle size={18} />
                </button>
              </div>

              <p className="font-bold text-lg mb-1">Medical Emergency</p>
              <p className="text-xs text-muted-foreground mb-6 font-mono flex items-center gap-2">
                <MapPin size={12} className="text-[#00ffcc]" />
                2min @ {liveEmergency.latitude.toFixed(4)}N, {liveEmergency.longitude.toFixed(4)}W
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDispatchAlert(false)}
                  className="bg-white/5 hover:bg-white/10 py-3 rounded-xl text-xs font-bold transition-colors border border-white/5"
                >
                  Decline
                </button>
                <button
                  onClick={acceptDispatch}
                  className="bg-[#00d9b5] text-[#1a2332] py-3 rounded-xl font-bold text-xs hover:bg-[#00c4a4] transition-colors shadow-lg shadow-[#00d9b5]/20"
                >
                  Accept & Go
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
