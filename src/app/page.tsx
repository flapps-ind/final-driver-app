"use client";

import { ArrowRight, User, Lock, UserPlus, Ambulance, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Registration State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    unit_id: '',
    certification_number: '',
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegError("");
    setRegSuccess(false);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.message || "Registration failed");
        return;
      }

      setRegSuccess(true);
      // Pre-fill login email
      setLoginEmail(formData.email);
      setFormData({ full_name: '', email: '', unit_id: '', certification_number: '', password: '' });
    } catch (err) {
      setRegError("Something went wrong. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      {/* Left Panel - Driver Login */}
      <section className="flex flex-col justify-center items-center p-8 lg:p-24 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h3 className="text-primary font-bold tracking-widest text-sm uppercase">Dispatch Ready</h3>
            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">Driver Log In</h1>
            <p className="text-muted-foreground text-lg">Access your active unit and navigation.</p>
          </div>

          {loginError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          {regSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              Registration successful! Please log in.
            </div>
          )}

          <form className="space-y-6 mt-8" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Phone or Email"
                  className="w-full bg-input/50 border border-input rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-input/50 border border-input rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Link href="#" className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-primary hover:text-primary/80 font-medium">
                  Forgot?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoggingIn ? "LOGGING IN..." : "LOG IN"}</span>
              {!isLoggingIn && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </section>

      {/* Right Panel - Registration */}
      <section className="flex flex-col justify-center items-center p-8 lg:p-24 relative z-10 border-t lg:border-t-0 lg:border-l border-border bg-gradient-to-br from-background to-[#1e2536]">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">New Driver Registration</h2>
            <p className="text-muted-foreground">Register for the RapidResponse network.</p>
          </div>

          {regError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm">
              {regError}
            </div>
          )}

          <form className="space-y-5 mt-8" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Full Name</label>
              <input
                name="full_name"
                type="text"
                placeholder="Johnathan Doe"
                className="w-full bg-input/30 border border-input rounded-xl py-3 px-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={formData.full_name}
                onChange={handleRegChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Email</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  placeholder="driver@example.com"
                  className="w-full bg-input/30 border border-input rounded-xl py-3 px-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={formData.email}
                  onChange={handleRegChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Ambulance Unit ID</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Ambulance size={18} />
                </div>
                <input
                  name="unit_id"
                  type="text"
                  placeholder="AMB-204-NYC"
                  className="w-full bg-input/30 border border-input rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={formData.unit_id}
                  onChange={handleRegChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Certification Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <ShieldCheck size={18} />
                </div>
                <input
                  name="certification_number"
                  type="text"
                  placeholder="EMS-XXXX-XXXX"
                  className="w-full bg-input/30 border border-input rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={formData.certification_number}
                  onChange={handleRegChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider ml-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Min 8 chars, 1 Uppercase, 1 Number"
                className="w-full bg-input/30 border border-input rounded-xl py-3 px-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={formData.password}
                onChange={handleRegChange}
                required
              />
            </div>

            <button type="submit" disabled={isRegistering} className="w-full bg-secondary hover:bg-secondary/80 border border-primary/20 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50">
              <UserPlus size={20} className="text-primary" />
              <span>{isRegistering ? "CREATING..." : "CREATE ACCOUNT"}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Footer Status Bar */}
      <div className="absolute bottom-0 w-full p-6 flex justify-between items-end text-[10px] sm:text-xs font-mono text-muted-foreground uppercase tracking-widest pointer-events-none z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Secure Gateway</span>
        </div>

        <div className="flex gap-4">
          <span className="hidden sm:inline-block border border-border px-2 py-1 rounded">Accredited EMS</span>
          <span className="hidden sm:inline-block border border-border px-2 py-1 rounded">Dept Health</span>
          <span className="text-primary">System v4.2.1-Active</span>
        </div>
      </div>
    </main>
  );
}
