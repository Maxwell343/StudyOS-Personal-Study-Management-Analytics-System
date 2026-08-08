"use client";

import { useState, useMemo, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SubjectsHeader } from "@/components/subjects/SubjectsHeader";
import { SubjectsSummaryStats } from "@/components/subjects/SubjectsSummaryStats";
import { ContinueLearningCard } from "@/components/subjects/ContinueLearningCard";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { RecentActivityList } from "@/components/subjects/RecentActivityList";
import { SubjectsInsightBar } from "@/components/subjects/SubjectsInsightBar";
import { AddSubjectDialog } from "@/components/subjects/AddSubjectDialog";
import { initialSubjects, mockRecentActivities, mockSubjectInsight } from "@/data/mock-subjects";
import { getGlobalLearningSummary } from "@/lib/learning-progress";
import type { Subject } from "@/types/subjects";

export default function SubjectsPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [subjectsList, setSubjectsList] = useState<Subject[]>(initialSubjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // ── Derived Global Summary (Single Source of Truth) ────────────────────────
  const summary = useMemo(
    () => getGlobalLearningSummary(subjectsList),
    [subjectsList]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOpenAddDialog = useCallback(() => {
    setEditingSubject(null);
    setDialogOpen(true);
  }, []);

  const handleSaveSubject = useCallback((subject: Subject) => {
    setSubjectsList((prev) => {
      const exists = prev.find((s) => s.id === subject.id);
      if (exists) {
        return prev.map((s) => (s.id === subject.id ? subject : s));
      }
      return [...prev, subject];
    });
  }, []);

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
          {/* JARVIS Curriculum Insight */}
          <SubjectsInsightBar message={mockSubjectInsight.message} />

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
              {subjectsList.length} track{subjectsList.length !== 1 ? "s" : ""} in progress
            </span>
          </div>

          {/* Subject Cards Grid */}
          <div className="mb-6 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            {subjectsList.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>

          {/* Recent Activity Log */}
          <RecentActivityList activities={mockRecentActivities} />
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
