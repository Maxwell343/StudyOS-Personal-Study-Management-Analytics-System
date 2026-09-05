"use client";

import React, { useState } from "react";
import { Lock, Mail, User as UserIcon, Loader2, ArrowRight, Shield, Sparkles, BookOpen, KeyRound } from "lucide-react";

interface LoginFormProps {
  onSignIn: (email: string, pass: string) => Promise<{ error?: string }>;
  onSignUp: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
  onSignInDemo?: () => Promise<{ error?: string }>;
}

export function LoginForm({ onSignIn, onSignUp, onSignInDemo }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    if (isSignUp && !fullName) {
      setErrorMsg("Please enter your name.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const res = await onSignUp(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error);
        }
      } else {
        const res = await onSignIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!onSignInDemo) return;
    setDemoLoading(true);
    setErrorMsg(null);
    try {
      const res = await onSignInDemo();
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign into demo account");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleFillDemoCreds = () => {
    setEmail("demo@studyos.local");
    setPassword("demoPassword#2026");
    if (isSignUp) {
      setFullName("Demo Explorer");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090e] p-4 text-[#f0f0f4]">
      <div 
        className="w-full max-w-md rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl transition-all"
        style={{
          background: "rgba(18, 18, 26, 0.90)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(34, 211, 238, 0.04)",
        }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#22d3ee] shadow-sm">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">StudyOS Command Center</h2>
          <p className="mt-1 text-xs text-[#8a8a9e]">
            {isSignUp ? "Create your personal StudyOS workspace" : "Sign in to access your personal study analytics system"}
          </p>
        </div>

        {/* Demo Account Quick Access Card */}
        {onSignInDemo && (
          <div 
            className="mb-6 overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Demo Account Access
                  </h3>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                    Instant Demo
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[#94a3b8]">
                  Explore the full interface with sample subjects & zero setup. Your demo session is isolated from private user data.
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={demoLoading || loading}
                  className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-black transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-cyan-500/10"
                >
                  {demoLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-black" />
                      <span>Launching Demo Workspace...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen size={14} className="text-black" />
                      <span>Explore Demo Account (1-Click)</span>
                      <ArrowRight size={14} className="text-black ml-auto" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#12121a] px-3 font-mono text-[10px] uppercase tracking-wider text-[#6b6b80]">
            {isSignUp ? "Or Register Account" : "Or Sign In With Account"}
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#8a8a9e]">
                Full Name
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-3 text-[#5a5a6a]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Taylor"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4a4a5a] outline-none transition focus:border-cyan-500/50 focus:bg-white/[0.05]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#8a8a9e]">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-[#5a5a6a]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4a4a5a] outline-none transition focus:border-cyan-500/50 focus:bg-white/[0.05]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-[#8a8a9e]">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-[#5a5a6a]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4a4a5a] outline-none transition focus:border-cyan-500/50 focus:bg-white/[0.05]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <>
                <span>{isSignUp ? "Create Workspace" : "Sign In"}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Demo Creds Helper */}
        <div className="mt-3.5 flex items-center justify-between text-[11px] text-[#6b6b80]">
          <button
            type="button"
            onClick={handleFillDemoCreds}
            className="flex items-center gap-1 hover:text-cyan-400 transition cursor-pointer"
          >
            <KeyRound size={12} />
            <span>Fill demo credentials</span>
          </button>
          <span>demo@studyos.local</span>
        </div>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-5 border-t border-white/5 pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-xs text-[#8a8a9e] hover:text-[#22d3ee] underline transition cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign in" : "New user? Create a personal account"}
          </button>
        </div>
      </div>
    </div>
  );
}
