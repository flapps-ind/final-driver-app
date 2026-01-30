"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Activity,
    ShieldCheck,
    ShieldAlert,
    Sun,
    LayoutGrid,
    CheckCircle2,
    Check,
    Ambulance
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        unitId: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [unitIdValid, setUnitIdValid] = useState<boolean | null>(null);
    const [unitIdTouched, setUnitIdTouched] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const certificationPattern = /^EMS-\d{4}-\d{4}$/;

    useEffect(() => {
        if (!unitIdTouched) return;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        const isCurrentlyValid = certificationPattern.test(formData.unitId);

        // IMMEDIATELY clear error if valid, satisfies prompt: 
        // "Clear/hide the error banner immediately when the certification input matches the valid format"
        if (isCurrentlyValid) {
            setUnitIdValid(true);
            if (error.includes("Certification")) {
                setError("");
            }
            return;
        }

        if (formData.unitId === "") {
            setUnitIdValid(null);
            setError("");
            return;
        }

        // If invalid, clear valid state
        setUnitIdValid(null);

        // Debounce only for SHOWING the error message
        debounceTimer.current = setTimeout(() => {
            setUnitIdValid(false);
            setError("Certification number must be in format: EMS-XXXX-XXXX (e.g., EMS-1292-1232)");
        }, 500);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [formData.unitId, unitIdTouched, error]);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        if (!certificationPattern.test(formData.unitId)) {
            setUnitIdValid(false);
            setError("Certification number must be in format: EMS-XXXX-XXXX (e.g., EMS-1292-1232)");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    // Map the UI field to both fields the server requires to satisfy internal constraints
                    unit_id: `AMB-${formData.unitId.replace(/[^0-9]/g, '').slice(0, 3)}-NYC`,
                    certification_number: formData.unitId,
                    password: formData.password,
                    certification_level: "DRIVER"
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Registration failed");
            }

            setSuccess(true);
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            setError(err.message || "Failed to create account.");
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'unitId') {
            setUnitIdTouched(true);
            // Clear error/valid state while typing to satisfy "Clear error when user starts typing again"
            if (error && error.includes("Certification")) {
                setError("");
            }
            setUnitIdValid(null);
        }
    };

    const handleUnitIdBlur = () => {
        setUnitIdTouched(true);
        if (!certificationPattern.test(formData.unitId)) {
            setUnitIdValid(false);
            setError("Certification number must be in format: EMS-XXXX-XXXX (e.g., EMS-1292-1232)");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#152238] p-4 lg:p-12 font-sans selection:bg-[#00ffcc]/30 text-white">
            <div className="w-full max-w-7xl h-full lg:h-[850px] flex flex-col lg:flex-row bg-[#1e2d3d]/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#2a3f5f] shadow-2xl">

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
                                <span className="text-[10px] font-bold text-[#00ffcc] tracking-wider uppercase">New Account</span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                Responder <br /> <span className="text-[#00ffcc]">Registration</span>
                            </h1>
                            <p className="text-[#8b9bb8] text-lg leading-relaxed max-w-md">
                                Join the elite emergency response network. Register your credentials to start receiving priority dispatch alerts.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="bg-[#1e2d3d]/50 p-4 rounded-2xl border border-white/5 hover:border-[#00ffcc]/20 transition-all group">
                                <ShieldCheck className="text-[#00ffcc] mb-3 group-hover:scale-110 transition-transform" size={24} />
                                <p className="text-sm font-bold mb-1">Certified Units</p>
                                <p className="text-[10px] text-[#8b9bb8] leading-tight">Verified medical credentials only</p>
                            </div>
                            <div className="bg-[#1e2d3d]/50 p-4 rounded-2xl border border-white/5 hover:border-[#00ffcc]/20 transition-all group">
                                <Lock className="text-[#00ffcc] mb-3 group-hover:scale-110 transition-transform" size={24} />
                                <p className="text-sm font-bold mb-1">Secure Data</p>
                                <p className="text-[10px] text-[#8b9bb8] leading-tight">End-to-end encrypted dispatch</p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 text-[10px] text-[#8b9bb8] font-mono tracking-widest uppercase mt-12">
                        <ShieldAlert size={12} />
                        Secure System Active
                    </div>
                </section>

                {/* RIGHT SECTION (Registration Form Card) */}
                <section className="flex-1 flex items-center justify-center p-8 lg:p-16 relative overflow-y-auto custom-scrollbar">
                    <div className="w-full max-w-md space-y-8 py-8 lg:py-0">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Response Terminal</h2>
                            <p className="text-[#8b9bb8] text-sm font-medium">Initialize your responder profile below.</p>
                        </div>

                        {error && (
                            <div className="bg-[#ff5252]/10 border border-[#ff5252]/20 text-[#ff5252] p-4 rounded-xl text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-[#00ffcc]/10 border border-[#00ffcc]/20 text-[#00ffcc] p-4 rounded-xl text-sm flex items-center gap-3">
                                <CheckCircle2 size={18} />
                                Account initialized. Transferring to login...
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#8b9bb8] uppercase tracking-widest ml-1">First Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors" size={18} />
                                        <input
                                            name="firstName"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="John"
                                            className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:border-[#00ffcc] transition-all"
                                        />
                                    </div>
                                </div>
                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#8b9bb8] uppercase tracking-widest ml-1">Last Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors" size={18} />
                                        <input
                                            name="lastName"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                            className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:border-[#00ffcc] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8b9bb8] uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors" size={18} />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="responder@lifelink.com"
                                        className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:border-[#00ffcc] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Unit ID */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8b9bb8] uppercase tracking-widest ml-1">Unit / Badge ID</label>
                                <div className="relative group">
                                    <LayoutGrid className={cn(
                                        "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                                        unitIdValid === true ? "text-[#00ffcc]" : unitIdValid === false ? "text-[#ff5252]" : "text-[#8b9bb8]"
                                    )} size={18} />
                                    <input
                                        name="unitId"
                                        required
                                        value={formData.unitId}
                                        onChange={handleChange}
                                        onBlur={handleUnitIdBlur}
                                        placeholder="EMS-1292-1232"
                                        className={cn(
                                            "w-full bg-[#0f1b2e] border rounded-xl py-3.5 pl-12 pr-10 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none transition-all",
                                            unitIdValid === true ? "border-[#00ffcc]" : unitIdValid === false ? "border-[#ff5252]" : "border-[#2a3f5f] focus:border-[#00ffcc]"
                                        )}
                                    />
                                    {unitIdValid === true && (
                                        <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00ffcc]" size={16} />
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8b9bb8] uppercase tracking-widest ml-1">Secure Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:border-[#00ffcc] transition-all"
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

                            <div className="flex items-start gap-3 px-1 py-1">
                                <input type="checkbox" required className="w-4 h-4 rounded border-[#2a3f5f] bg-[#0f1b2e] text-[#00ffcc] mt-0.5 cursor-pointer" />
                                <p className="text-[11px] text-[#8b9bb8] leading-tight">
                                    I agree to the <Link href="#" className="text-[#00ffcc] font-bold hover:underline">Terms of Service</Link> and confirm I am a certified first responder for the LifeLink Network.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || success}
                                className="w-full bg-[#00ffcc] hover:bg-[#00e5b8] text-[#0d1b2a] font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#00ffcc]/20 disabled:opacity-50 group mt-4"
                            >
                                <span>{isLoading ? "PROVISIONING..." : success ? "ACCESS GRANTED" : "CREATE ACCOUNT"}</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="space-y-8 pt-2 text-center">
                                <p className="text-sm text-[#8b9bb8]">
                                    Already have an account? <Link href="/login" className="text-[#00ffcc] font-bold hover:underline">Log into LifeLink</Link>
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

            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a3f5f;
          border-radius: 10px;
        }
      `}</style>
        </main>
    );
}
