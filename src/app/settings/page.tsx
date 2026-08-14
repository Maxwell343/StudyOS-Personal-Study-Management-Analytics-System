"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { seedCurriculumForUser } from "@/lib/data-access/subjects";
import {
  User as UserIcon,
  LogOut,
  Shield,
  Save,
  Check,
  RefreshCw,
  Database,
  Server,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut, loading: authLoading } = useAuth();
  const [name, setName] = useState(() => profile?.name || "Maxwell");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const [prevProfileName, setPrevProfileName] = useState(profile?.name);
  if (profile?.name && profile.name !== prevProfileName) {
    setPrevProfileName(profile.name);
    setName(profile.name);
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    setProfileSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) {
        alert(`Error updating profile: ${error.message}`);
      } else {
        await refreshProfile();
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleReseedCurriculum = async () => {
    if (!user) return;
    if (
      !confirm(
        "Are you sure you want to re-seed default subjects (DSA, Java, Machine Learning, SQL, OOP, OS, CN)? Existing records will remain intact."
      )
    ) {
      return;
    }

    setSeeding(true);
    setSeedSuccess(false);

    try {
      await seedCurriculumForUser(user.id);
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error("Error re-seeding curriculum:", err);
      alert("Failed to re-seed curriculum.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090e] text-[#f0f0f4]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-9 py-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header Title */}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Settings & Account</h2>
              <p className="mt-0.5 text-xs text-[#6b6b80]">
                Manage your profile, workspace preferences, database setup, and session security.
              </p>
            </div>

            {/* Profile Card */}
            <div
              className="rounded-xl p-6 shadow-lg"
              style={{
                background: "rgba(18, 18, 26, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-[#22d3ee]">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Personal Profile</h3>
                    <p className="text-[11px] text-[#6b6b80]">
                      Your public display name and workspace identity
                    </p>
                  </div>
                </div>

                {profileSuccess && (
                  <div className="flex items-center gap-1.5 rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <Check size={14} />
                    Profile Updated!
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#8a8a9e]">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Maxwell"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-white placeholder-[#4a4a5a] outline-none transition focus:border-cyan-500/50 focus:bg-white/[0.05]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#8a8a9e]">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || "maxwell.mathew@studyos.local"}
                      disabled
                      className="w-full rounded-lg border border-white/5 bg-white/[0.01] px-3.5 py-2 text-sm text-[#7a7a8e] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile || authLoading}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <Loader2 size={14} className="animate-spin text-black" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Account & Security Card */}
            <div
              className="rounded-xl p-6 shadow-lg"
              style={{
                background: "rgba(18, 18, 26, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Security & Session</h3>
                    <p className="text-[11px] text-[#6b6b80]">
                      Active authentication session details and sign out
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3.5 border border-white/5">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-white">Signed in as</div>
                    <div className="font-mono text-xs text-[#a0a0b8]">
                      {user?.email || "maxwell.mathew@studyos.local"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      Authenticated
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-xs font-medium text-white">Log Out of StudyOS</div>
                    <div className="text-[11px] text-[#6b6b80]">
                      End your session safely on this browser.
                    </div>
                  </div>

                  <button
                    onClick={() => signOut()}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Curriculum & Data Management */}
            <div
              className="rounded-xl p-6 shadow-lg"
              style={{
                background: "rgba(18, 18, 26, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                    <Database size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Curriculum & Data Tools</h3>
                    <p className="text-[11px] text-[#6b6b80]">
                      Provision or restore core CS subjects (DSA, Java, ML, SQL, OOP, OS, CN)
                    </p>
                  </div>
                </div>

                {seedSuccess && (
                  <div className="flex items-center gap-1.5 rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <Check size={14} />
                    Curriculum Seeded!
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white">Re-seed Core Curriculum</div>
                  <div className="text-[11px] text-[#6b6b80]">
                    Populates missing core subjects and topic hierarchies into your personal database.
                  </div>
                </div>

                <button
                  onClick={handleReseedCurriculum}
                  disabled={seeding}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
                >
                  {seeding ? (
                    <Loader2 size={14} className="animate-spin text-white" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  <span>Re-seed Subjects</span>
                </button>
              </div>
            </div>

            {/* Architecture Details */}
            <div
              className="rounded-xl p-5"
              style={{
                background: "rgba(34,211,238,0.03)",
                border: "1px solid rgba(34,211,238,0.1)",
              }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#22d3ee]">
                <Server size={14} />
                <span>System Architecture Status</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4 text-[11px] text-[#a0a0b8] md:grid-cols-4">
                <div>
                  <span className="text-[#6b6b80]">Frontend:</span> Next.js 16.3
                </div>
                <div>
                  <span className="text-[#6b6b80]">Hosting Target:</span> Vercel
                </div>
                <div>
                  <span className="text-[#6b6b80]">Data Platform:</span> Supabase PostgreSQL
                </div>
                <div>
                  <span className="text-[#6b6b80]">RLS Protection:</span> Active (100%)
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
