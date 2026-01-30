"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Activity,
    Moon,
    Sun,
    Navigation,
    Activity as FleetSyncIcon,
    ShieldCheck,
    ShieldAlert,
    Ambulance
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Invalid credentials.");
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            setError("Connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#152238] p-4 lg:p-12 font-sans selection:bg-[#00ffcc]/30 text-white">
            <div className="w-full max-w-7xl h-full lg:h-[800px] flex flex-col lg:flex-row bg-[#1e2d3d]/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#2a3f5f] shadow-2xl">

                {/* LEFT SECTION (Branding & Features) */}
                <section className="lg:w-[40%] p-8 lg:p-16 flex flex-col justify-between bg-[#0f1b2e]/30 border-b lg:border-b-0 lg:border-r border-[#2a3f5f]">
                    <div className="space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="text-[#00ffcc] drop-shadow-[0_0_15px_rgba(0,255,204,0.3)]">
                                <Activity size={48} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col -space-y-1">
                                <div className="flex items-center uppercase leading-none">
                                    <span className="text-3xl font-black tracking-tight">Life</span>
                                    <span className="text-3xl font-black tracking-tight ml-1.5 text-white/90">Link</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#00ffcc] tracking-[0.2em] uppercase">Responder Network</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-[#00ffcc]/10 px-3 py-1 rounded-full border border-[#00ffcc]/20">
                                <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse"></div>
                                <span className="text-[10px] font-bold text-[#00ffcc] tracking-wider uppercase">Dispatch Ready</span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                Driver <br /> <span className="text-[#00ffcc]">Log In</span>
                            </h1>
                            <p className="text-[#8b9bb8] text-lg leading-relaxed max-w-md">
                                Access your active unit, receive real-time navigation updates, and sync with the LifeLink network.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="bg-[#1e2d3d]/50 p-4 rounded-2xl border border-white/5 hover:border-[#00ffcc]/20 transition-all group">
                                <Navigation className="text-[#00ffcc] mb-3 group-hover:scale-110 transition-transform" size={24} />
                                <p className="text-sm font-bold mb-1">Priority Routing</p>
                                <p className="text-[10px] text-[#8b9bb8] leading-tight">GPS-based emergency routing</p>
                            </div>
                            <div className="bg-[#1e2d3d]/50 p-4 rounded-2xl border border-white/5 hover:border-[#00ffcc]/20 transition-all group">
                                <FleetSyncIcon className="text-[#00ffcc] mb-3 group-hover:scale-110 transition-transform" size={24} />
                                <p className="text-sm font-bold mb-1">Fleet Sync</p>
                                <p className="text-[10px] text-[#8b9bb8] leading-tight">Real-time unit coordination</p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 text-[10px] text-[#8b9bb8] font-mono tracking-widest uppercase mt-12">
                        <ShieldAlert size={12} />
                        Secure System Active
                    </div>
                </section>

                {/* RIGHT SECTION (Login Form Card) */}
                <section className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
                    <div className="w-full max-w-md space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Welcome Back</h2>
                            <p className="text-[#8b9bb8] text-sm font-medium">Please enter your credentials to access the terminal.</p>
                        </div>

                        {error && (
                            <div className="bg-[#ff5252]/10 border border-[#ff5252]/20 text-[#ff5252] p-4 rounded-xl text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-5">
                                {/* Email Address */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#8b9bb8] uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@lifelink.com"
                                            className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:border-[#00ffcc] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-bold text-[#8b9bb8] uppercase tracking-widest">Password</label>
                                        <Link href="#" className="text-[10px] font-bold text-[#00ffcc] hover:underline uppercase tracking-widest">Forgot?</Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:border-[#00ffcc] transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] hover:text-[#00ffcc] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center px-1">
                                <label className="flex items-center gap-3 text-xs text-[#8b9bb8] cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" className="peer sr-only" />
                                        <div className="w-5 h-5 border border-[#2a3f5f] rounded bg-[#0f1b2e] peer-checked:bg-[#00ffcc] peer-checked:border-[#00ffcc] transition-all"></div>
                                        <CheckCircle2 className="absolute inset-0 text-[#0d1b2a] scale-0 peer-checked:scale-100 transition-transform m-auto" size={14} />
                                    </div>
                                    Stay logged in/unit
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#00ffcc] hover:bg-[#00e5b8] text-[#0d1b2a] font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#00ffcc]/20 disabled:opacity-50 group"
                            >
                                <span>{isLoading ? "LOADING SYSTEM..." : "LOG IN"}</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="space-y-10 pt-4 text-center">
                                <p className="text-sm text-[#8b9bb8]">
                                    New driver? <Link href="/register" className="text-[#00ffcc] font-bold hover:underline">Register for LifeLink</Link>
                                </p>

                                <div className="flex items-center justify-center gap-2 text-[10px] text-[#8b9bb8] font-bold tracking-widest uppercase opacity-40">
                                    <Lock size={12} />
                                    SECURE ENCRYPTED CONNECTION
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </div>

            {/* Floating Theme Toggle */}
            <button className="fixed bottom-6 right-6 lg:bottom-12 lg:right-12 w-12 h-12 bg-[#1e2d3d] border border-[#2a3f5f] rounded-full flex items-center justify-center text-[#8b9bb8] hover:text-white transition-all shadow-xl hover:scale-110">
                <Sun size={20} />
            </button>

            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
        </main>
    );
}

// Separate icon for fleet sync if needed, but using Activity for consistency
import { CheckCircle2 } from "lucide-react";
