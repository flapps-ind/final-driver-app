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
    ShieldCheck,
    User,
    Activity,
    Shield,
    Moon,
    Sun,
    LayoutGrid,
    CreditCard,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        unit_id: '',
        certification_number: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Registration failed. Please check your details.");
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#0a1628] bg-gradient-to-br from-[#0a1628] to-[#152238] p-4 font-sans text-white border-[10px] border-[#0a1628]">
            <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-[#1e2d3d]/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#2a3f5f] shadow-2xl">

                {/* LEFT SECTION: BRANDING & FEATURES */}
                <section className="lg:w-[40%] p-10 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2a3f5f] bg-[#0f1b2e]/30">
                    <div className="space-y-12">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#00ffcc] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,204,0.4)]">
                                <div className="relative w-6 h-6 border-2 border-white flex items-center justify-center">
                                    <div className="absolute w-4 h-0.5 bg-white"></div>
                                    <div className="absolute w-0.5 h-4 bg-white"></div>
                                </div>
                            </div>
                            <span className="text-2xl font-bold tracking-tight">LifeLink</span>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 bg-[#00ffcc]/10 px-3 py-1 rounded-full border border-[#00ffcc]/20">
                                <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse"></div>
                                <span className="text-[10px] font-bold text-[#00ffcc] tracking-widest uppercase">New Account</span>
                            </div>
                            <h1 className="text-5xl font-bold leading-tight">
                                Responder <span className="text-[#00ffcc]">Registration</span>
                            </h1>
                            <p className="text-[#8b9bb8] text-lg leading-relaxed">
                                Join the elite emergency response network. Register your credentials to start receiving priority dispatch alerts.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0f1b2e]/50 p-4 rounded-xl border border-[#2a3f5f] group hover:border-[#00ffcc]/50 transition-all cursor-default">
                                <ShieldCheck className="text-[#00ffcc] mb-3 transition-transform group-hover:scale-110" size={24} />
                                <h3 className="font-bold text-sm mb-1">Certified Units</h3>
                                <p className="text-[10px] text-[#8b9bb8]">Verified medical credentials only</p>
                            </div>
                            <div className="bg-[#0f1b2e]/50 p-4 rounded-xl border border-[#2a3f5f] group hover:border-[#00ffcc]/50 transition-all cursor-default">
                                <Lock className="text-[#00ffcc] mb-3 transition-transform group-hover:scale-110" size={24} />
                                <h3 className="font-bold text-sm mb-1">Secure Data</h3>
                                <p className="text-[10px] text-[#8b9bb8]">End-to-end encrypted dispatch</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 lg:mt-0 flex items-center gap-2 text-[10px] text-[#8b9bb8] font-mono tracking-widest uppercase">
                        <Lock size={12} />
                        Encrypted Registration
                    </div>
                </section>

                {/* RIGHT SECTION: REGISTRATION FORM */}
                <section className="flex-1 p-10 lg:p-12 flex items-center justify-center bg-transparent">
                    <div className="w-full max-w-md space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Create Responder Profile</h2>
                            <p className="text-[#8b9bb8]">Fill in your official credentials</p>
                        </div>

                        {error && (
                            <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] p-4 rounded-xl text-sm flex items-center gap-3 animate-shake">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]"></div>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-[#00ffcc]/10 border border-[#00ffcc]/20 text-[#00ffcc] p-4 rounded-xl text-sm flex items-center gap-3">
                                <CheckCircle2 size={20} />
                                Account created successfully! Redirecting to login...
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b9bb8] uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors">
                                            <User size={16} />
                                        </div>
                                        <input
                                            name="full_name"
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            placeholder="Johnathan Doe"
                                            className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:ring-1 focus:ring-[#00ffcc] focus:border-[#00ffcc] transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#8b9bb8] uppercase tracking-wider ml-1">Unit ID</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors">
                                            <LayoutGrid size={16} />
                                        </div>
                                        <input
                                            name="unit_id"
                                            type="text"
                                            required
                                            value={formData.unit_id}
                                            onChange={handleChange}
                                            placeholder="LL-9421"
                                            className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:ring-1 focus:ring-[#00ffcc] focus:border-[#00ffcc] transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#8b9bb8] uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="responder@lifelink.com"
                                        className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:ring-1 focus:ring-[#00ffcc] focus:border-[#00ffcc] transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#8b9bb8] uppercase tracking-wider ml-1">Certification Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors">
                                        <CreditCard size={16} />
                                    </div>
                                    <input
                                        name="certification_number"
                                        type="text"
                                        required
                                        value={formData.certification_number}
                                        onChange={handleChange}
                                        placeholder="EMS-XXXX-XXXX"
                                        className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:ring-1 focus:ring-[#00ffcc] focus:border-[#00ffcc] transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#8b9bb8] uppercase tracking-wider ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] group-focus-within:text-[#00ffcc] transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 8 chars, 1 Uppercase"
                                        className="w-full bg-[#0f1b2e] border border-[#2a3f5f] rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-[#8b9bb8]/30 focus:outline-none focus:ring-1 focus:ring-[#00ffcc] focus:border-[#00ffcc] transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="w-4 h-4 mt-0.5 rounded bg-[#0f1b2e] border-[#2a3f5f] text-[#00ffcc] focus:ring-[#00ffcc] focus:ring-offset-0 focus:ring-offset-transparent outline-none cursor-pointer appearance-none checked:bg-[#00ffcc] checked:border-transparent relative after:content-['✓'] after:absolute after:hidden after:text-[10px] after:left-0.5 after:top-0 checked:after:block transition-all"
                                />
                                <label htmlFor="terms" className="text-xs text-[#8b9bb8] leading-relaxed select-none">
                                    I agree to the <Link href="#" className="text-[#00ffcc] hover:underline">Terms of Service</Link> and confirm I am a certified first responder.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || success}
                                className="w-full bg-[#00ffcc] hover:bg-[#00e5b8] text-[#0a1628] font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                            >
                                <span>{isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</span>
                                {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <div className="pt-4 space-y-4">
                                <p className="text-center text-sm text-[#8b9bb8]">
                                    Already have an account? <Link href="/login" className="text-[#00ffcc] font-bold hover:underline">Log into LifeLink</Link>
                                </p>

                                <div className="flex items-center justify-center gap-2 text-[10px] text-[#8b9bb8] font-bold tracking-widest uppercase">
                                    <Lock size={12} />
                                    SECURE ENCRYPTED CONNECTION
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </div>

            {/* Theme Toggle Placeholder */}
            <button className="fixed bottom-8 right-8 w-12 h-12 bg-[#1e2d3d] border border-[#2a3f5f] rounded-full flex items-center justify-center text-[#8b9bb8] hover:text-white transition-all shadow-xl hover:scale-110">
                <Moon size={20} />
            </button>

            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
        </main>
    );
}
