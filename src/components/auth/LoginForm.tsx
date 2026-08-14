"use client";

import React, { useState } from "react";
import { Lock, Mail, User as UserIcon, Loader2, ArrowRight, Shield } from "lucide-react";

interface LoginFormProps {
  onSignIn: (email: string, pass: string) => Promise<{ error?: string }>;
  onSignUp: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
}

export function LoginForm({ onSignIn, onSignUp }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("maxwell.mathew@studyos.local");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("Maxwell");
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090e] p-4 text-[#f0f0f4]">
      <div 
        className="w-full max-w-md rounded-xl p-8 shadow-2xl backdrop-blur-md"
        style={{
          background: "rgba(18, 18, 26, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#22d3ee]">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">StudyOS Access</h2>
          <p className="mt-1 text-xs text-[#6b6b80]">
            {isSignUp ? "Create your personal StudyOS workspace" : "Sign in to access your personal study system"}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#8a8a9e]">
                Full Name
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-3 text-[#5a5a6a]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maxwell"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4a4a5a] outline-none transition focus:border-cyan-500/50 focus:bg-white/[0.05]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#8a8a9e]">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-[#5a5a6a]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maxwell.mathew@studyos.local"
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4a4a5a] outline-none transition focus:border-cyan-500/50 focus:bg-white/[0.05]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#8a8a9e]">
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
            disabled={loading}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-black" />
            ) : (
              <>
                <span>{isSignUp ? "Provision Workspace" : "Authenticate"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-xs text-[#8a8a9e] hover:text-[#22d3ee] underline transition cursor-pointer"
          >
            {isSignUp ? "Already have an account? Sign in" : "First time setup? Create personal account"}
          </button>
        </div>
      </div>
    </div>
  );
}
