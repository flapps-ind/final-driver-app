"use client";

import React from "react";
import { X, MapPin, Navigation } from "lucide-react";

interface DispatchNotificationProps {
    onAccept: () => void;
    onDecline: () => void;
    visible: boolean;
}

const DispatchNotification: React.FC<DispatchNotificationProps> = ({
    onAccept,
    onDecline,
    visible
}) => {
    if (!visible) return null;

    return (
        <div className="absolute top-8 right-8 z-[1000] w-[340px] animate-in slide-in-from-right-8 duration-500 ease-out">
            <div className="bg-[#1a2332]/95 backdrop-blur-md border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Progress bar at top for urgency? */}
                <div className="h-1 w-full bg-[#2a3a4a]">
                    <div className="h-full bg-[#00d9b8] animate-loader" />
                </div>

                <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black tracking-widest text-[#00d9b8] uppercase">New Dispatch</span>
                        <button
                            onClick={onDecline}
                            className="p-1 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X size={16} className="text-[#8b92a5]" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white leading-tight">Medical Emergency</h1>
                        <div className="flex items-center gap-2 text-[#8b92a5]">
                            <MapPin size={14} className="text-[#00d9b8]" />
                            <span className="text-xs font-medium">2min @ 12.8725N, 74.8460W</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onDecline}
                            className="flex-1 py-3.5 bg-[#2a3a4a] text-white rounded-2xl text-sm font-bold hover:bg-[#34465a] transition-all active:scale-95"
                        >
                            Decline
                        </button>
                        <button
                            onClick={onAccept}
                            className="flex-[1.5] py-3.5 bg-[#00d9b8] text-[#1a2332] rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 hover:bg-[#00c4a7] transition-all shadow-[0_8px_20px_rgba(0,217,184,0.3)] active:scale-95 group"
                        >
                            Accept & Go
                            <Navigation size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes loader {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};

export default DispatchNotification;
