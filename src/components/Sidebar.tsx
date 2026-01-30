"use client";

import React from "react";
import { 
  Activity, 
  MapPin, 
  MoreVertical, 
  Users, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Navigation2
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarState = "INITIAL" | "ACTIVE" | "ARRIVED";

interface SidebarProps {
  state: SidebarState;
  onMarkArrival: () => void;
  onCompleteEmergency: () => void;
  onBackup: () => void;
  onHospital: () => void;
  status: "AVAILABLE" | "OFF_DUTY";
  setStatus: (status: "AVAILABLE" | "OFF_DUTY") => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  state,
  onMarkArrival,
  onCompleteEmergency,
  onBackup,
  onHospital,
  status,
  setStatus
}) => {
  return (
    <aside className="w-[300px] h-full bg-[#1a2332] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto">
      {/* HEADER SECTION */}
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setStatus("AVAILABLE")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
              status === "AVAILABLE"
                ? "bg-[#00d9b8] text-[#1a2332] shadow-[0_0_15px_rgba(0,217,184,0.3)]"
                : "bg-[#2a3a4a] text-[#8b92a5] hover:bg-[#34465a]"
            )}
          >
            AVAILABLE
          </button>
          <button
            onClick={() => setStatus("OFF_DUTY")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
              status === "OFF_DUTY"
                ? "bg-[#2a3a4a] text-white shadow-lg"
                : "bg-[#2a3a4a]/40 text-[#8b92a5] hover:bg-[#2a3a4a]/60"
            )}
          >
            OFF DUTY
          </button>
        </div>

        {/* CURRENT EMERGENCY SECTION (STATES 3 & 4) */}
        {(state === "ACTIVE" || state === "ARRIVED") && (
          <div className="bg-[#2a3a4a]/50 border border-[#00d9b8]/20 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#8b92a5] uppercase tracking-wider">Current Emergency</span>
              <MapPin className="text-[#00d9b8]" size={16} />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-[#00d9b8] text-xl font-bold font-mono tracking-tight">
                12.8725, 74.8460
              </h2>
              <p className="text-xs text-[#8b92a5] leading-relaxed">
                Live SOS received. Proceed immediately to the marked location.
              </p>
            </div>

            {state === "ARRIVED" && (
              <div className="flex items-center gap-2 text-[#00d97e] animate-in zoom-in duration-300">
                <div className="p-1 bg-[#00d97e]/10 rounded-full">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-xs font-bold">Arrived at scene</span>
              </div>
            )}

            <div className="space-y-2">
              {state === "ACTIVE" ? (
                <button
                  onClick={onMarkArrival}
                  className="w-full bg-[#00d9b8] text-[#1a2332] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00c4a7] transition-colors group"
                >
                  MARK ARRIVAL
                  <Navigation2 size={16} className="rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={onCompleteEmergency}
                    className="w-full bg-[#00d9b8] text-[#1a2332] py-3 rounded-xl font-bold hover:bg-[#00c4a7] transition-colors"
                  >
                    COMPLETE EMERGENCY
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={onBackup}
                      className="flex-1 bg-[#34465a] text-[#a5b4fc] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#3f536b] transition-colors"
                    >
                      <Users size={14} />
                      BACKUP
                    </button>
                    <button
                      onClick={onHospital}
                      className="flex-1 bg-[#34465a] text-[#93c5fd] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#3f536b] transition-colors"
                    >
                      <Phone size={14} />
                      HOSPITAL
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QUICK STATISTICS */}
      <div className="px-6 py-4">
        <h3 className="text-[10px] font-bold text-[#8b92a5] uppercase tracking-widest mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#2a3a4a]/40 p-4 rounded-2xl border border-white/[0.03]">
            <p className="text-[9px] font-bold text-[#8b92a5] uppercase mb-1">Avg Response</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#00d9b8]">4.2</span>
              <span className="text-xs text-[#00d9b8]">m</span>
            </div>
          </div>
          <div className="bg-[#2a3a4a]/40 p-4 rounded-2xl border border-white/[0.03]">
            <p className="text-[9px] font-bold text-[#8b92a5] uppercase mb-1">Active Units</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#3b82f6]">12</span>
              <span className="text-xs text-[#3b82f6]">/15</span>
            </div>
          </div>
        </div>
      </div>

      {/* RESPONDER TEAM */}
      <div className="px-6 py-4 flex-1">
        <h3 className="text-[10px] font-bold text-[#8b92a5] uppercase tracking-widest mb-4">Responder Team</h3>
        <div className="space-y-3">
          <UnitItem name="Unit Alpha-1" status="ONLINE" statusColor="#00d97e" />
          <UnitItem name="Unit Bravo-4" status="BUSY" statusColor="#ffb020" />
        </div>
      </div>

      {/* RECENT ALERTS */}
      <div className={cn(
        "px-6 py-6 bg-[#161d2a]/50 mt-auto transition-all duration-300",
        state !== "INITIAL" ? "h-20 overflow-hidden opacity-50" : ""
      )}>
        <div className="flex justify-between items-center mb-4 text-[10px] font-bold uppercase tracking-widest">
          <span className="text-[#8b92a5]">Recent Alerts</span>
          <button className="text-[#00d9b8] hover:underline transition-all">View All</button>
        </div>
        <div className="space-y-4">
          <AlertItem 
            type="Medical Emergency" 
            location="Mallikatte" 
            time="2 mins ago" 
            severity="high" 
          />
          <AlertItem 
            type="Traffic Incident" 
            location="Light House Hill" 
            time="14 mins ago" 
            severity="medium" 
          />
        </div>
      </div>
    </aside>
  );
};

const UnitItem = ({ name, status, statusColor }: { name: string; status: string; statusColor: string }) => (
  <div className="flex items-center justify-between p-3 bg-[#2a3a4a]/30 rounded-xl border border-white/[0.03] group hover:bg-[#2a3a4a]/50 transition-colors cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#1a2332] rounded-lg">
        <Users size={16} className="text-[#8b92a5]" />
      </div>
      <div>
        <p className="text-xs font-bold text-white">{name}</p>
        <p className="text-[9px] font-bold" style={{ color: statusColor }}>{status}</p>
      </div>
    </div>
    <MoreVertical size={14} className="text-[#4b5563] opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const AlertItem = ({ type, location, time, severity }: { type: string; location: string; time: string; severity: "high" | "medium" }) => (
  <div className="flex gap-3">
    <div className={cn(
      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
      severity === "high" ? "bg-[#ff4757] shadow-[0_0_8px_rgba(255,71,87,0.4)]" : "bg-[#ffb020] shadow-[0_0_8px_rgba(255,176,32,0.4)]"
    )} />
    <div>
      <p className="text-xs font-bold text-white leading-tight">{type} - {location}</p>
      <p className="text-[10px] text-[#8b92a5] mt-1 flex items-center gap-1">
        <Clock size={10} />
        {time} • {severity === "high" ? "High Severity" : "Medium Severity"}
      </p>
    </div>
  </div>
);

export default Sidebar;
