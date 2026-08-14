"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { formatErrorMessage } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { SubjectsHeader } from "@/components/subjects/SubjectsHeader";
import { SubjectsSummaryStats } from "@/components/subjects/SubjectsSummaryStats";
import { ContinueLearningCard } from "@/components/subjects/ContinueLearningCard";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { SubjectsInsightBar } from "@/components/subjects/SubjectsInsightBar";
import { AddSubjectDialog } from "@/components/subjects/AddSubjectDialog";
import { useAuth } from "@/context/AuthContext";
import {
  fetchSubjectsForUser,
  createSubjectInDb,
  updateSubjectInDb,
  seedCurriculumForUser,
} from "@/lib/data-access/subjects";
import { getGlobalLearningSummary } from "@/lib/learning-progress";
import type { Subject } from "@/types/subjects";
import { Database, Sparkles, Loader2 } from "lucide-react";

export default function SubjectsPage() {
  const { user, loading: authLoading } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    if (authLoading) return;

    if (!user) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          setSubjectsList([]);
          setLoading(false);
        }
      });
      return;
    }

    const userId = user.id;

    async function load() {
      try {
        const data = await fetchSubjectsForUser(userId);
        if (isCancelled) return;
        setSubjectsList(data);
      } catch (err) {
        console.error("Error loading subjects:", formatErrorMessage(err), err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [user, authLoading, refreshIndex]);

  // Derived statistics (no hardcoded metrics)
  const summary = useMemo(() => {
    return getGlobalLearningSummary(subjectsList);
  }, [subjectsList]);

  // ── Dialog Handlers ────────────────────────────────────────────────────────
  const handleOpenAddDialog = useCallback(() => {
    setEditingSubject(null);
    setDialogOpen(true);
  }, []);

  const handleSaveSubject = async (sub: Subject) => {
    if (!user) {
      alert("You must be logged in and connected to Supabase to save subjects. Please check your .env.local file.");
      return;
    }
    try {
      if (editingSubject) {
        await updateSubjectInDb(editingSubject.id, {
          name: sub.name,
          description: sub.description,
          color: sub.color,
          category: sub.category,
          targetDate: sub.targetDate,
        });
      } else {
        await createSubjectInDb(user.id, {
          name: sub.name,
          description: sub.description,
          color: sub.color,
          category: sub.category,
          targetDate: sub.targetDate,
        });
      }
      setRefreshIndex((prev) => prev + 1);
      setDialogOpen(false);
      setEditingSubject(null);
    } catch (err: unknown) {
      console.error("Failed to save subject:", err);
      const e = err as Error;
      alert(`Failed to save subject: ${e.message || "Unknown error"}`);
    }
  };

  const handleSeedCurriculum = async () => {
    if (!user) return;
    try {
      setSeeding(true);
      await seedCurriculumForUser(user.id);
      setRefreshIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to seed curriculum:", err);
    } finally {
      setSeeding(false);
    }
  };

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingSubject(null);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <SubjectsHeader onAddSubject={handleOpenAddDialog} />

        <div className="flex-1 px-9 pt-5 pb-10">
          {loading ? (
            /* Loading State */
            <div className="mt-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#22d3ee]" />
              <span className="text-xs text-[#6b6b80]">Syncing curriculum from Supabase...</span>
            </div>
          ) : (
            <>
              {/* JARVIS Curriculum Insight */}
              <SubjectsInsightBar
                message={
                  subjectsList.length > 0
                    ? `Curriculum connected to Supabase. ${summary.completedLearningItems} of ${summary.totalLearningItems} learning items completed (${summary.overallProgressPercent}% overall).`
                    : "No subjects found in your database. Seed the standard curriculum or create your first subject."
                }
              />

              {/* Derived Summary Statistics */}
              <SubjectsSummaryStats summary={summary} />

              {/* Continue Where You Left Off */}
              <ContinueLearningCard subjects={subjectsList} />

              {/* Section: Your Learning Universe */}
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
                  Active Subjects
                </h2>
                <span className="text-[11px]" style={{ color: "#5a5a6a" }}>
                  {subjectsList.length} track{subjectsList.length !== 1 ? "s" : ""} in database
                </span>
              </div>

              {/* Empty state or Subject Cards Grid */}
              {subjectsList.length === 0 ? (
                <div
                  className="mb-6 flex flex-col items-center justify-center rounded-[10px] p-8 text-center"
                  style={{
                    background: "#13131a",
                    border: "1px dashed rgba(255,255,255,0.08)",
                  }}
                >
                  <Database size={24} className="mb-3 text-[#6b6b80]" />
                  <p className="m-0 mb-1 text-sm font-semibold text-[#e0e0ec]">
                    Your curriculum database is clean & empty
                  </p>
                  <p className="m-0 mb-5 max-w-sm text-xs text-[#6b6b80]">
                    You can provision the foundational DSA, Java, Machine Learning, and SQL curriculum with one click, or add your own custom subject.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSeedCurriculum}
                      disabled={seeding}
                      className="flex cursor-pointer items-center gap-2 rounded-[7px] px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: "rgba(34, 211, 238, 0.15)",
                        border: "1px solid rgba(34, 211, 238, 0.4)",
                        color: "#22d3ee",
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{seeding ? "Seeding Database..." : "Seed Standard Curriculum"}</span>
                    </button>
                    <button
                      onClick={handleOpenAddDialog}
                      className="cursor-pointer rounded-[7px] px-4 py-2 text-xs font-medium text-[#f0f0f4]"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      Create Custom Subject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
                  {subjectsList.map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Add / Edit Subject Dialog ───────────────────────────────── */}
      <AddSubjectDialog
        open={dialogOpen}
        editingSubject={editingSubject}
        onClose={handleCloseDialog}
        onSave={handleSaveSubject}
      />
    </div>
  );
}
