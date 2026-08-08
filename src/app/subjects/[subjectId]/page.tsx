"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SubjectDetailHeader } from "@/components/subjects/detail/SubjectDetailHeader";
import { TopicSection } from "@/components/subjects/detail/TopicSection";
import { AddSubjectDialog } from "@/components/subjects/AddSubjectDialog";
import { AddTopicDialog } from "@/components/subjects/detail/AddTopicDialog";
import { AddLearningItemDialog } from "@/components/subjects/detail/AddLearningItemDialog";
import { useAuth } from "@/context/AuthContext";
import {
  fetchSubjectById,
  updateSubjectInDb,
  deleteSubjectInDb,
  createTopicInDb,
  updateTopicInDb,
  deleteTopicInDb,
  createLearningItemInDb,
  updateLearningItemInDb,
  deleteLearningItemInDb,
  toggleLearningItemCompletionInDb,
} from "@/lib/data-access/subjects";
import type { Subject, Topic, LearningItem } from "@/types/subjects";

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [editSubjectOpen, setEditSubjectOpen] = useState(false);

  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [activeTopicIdForItem, setActiveTopicIdForItem] = useState<string>("");
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      if (!user) {
        if (!isCancelled) {
          setSubject(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchSubjectById(user.id, subjectId);
        if (!isCancelled) {
          setSubject(data);
        }
      } catch (err) {
        console.error("Error loading subject detail:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      load();
    }

    return () => {
      isCancelled = true;
    };
  }, [user, subjectId, authLoading, refreshIndex]);

  const loadSubject = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  // ── Handlers: Item Toggle (NOT_STARTED <-> COMPLETED) ──────────────────────
  const handleToggleItem = useCallback(
    async (itemId: string) => {
      if (!subject || !user) return;

      // Find current item
      let currentStatus = "NOT_STARTED";
      let itemTitle = "";
      for (const t of subject.topics) {
        const found = t.learningItems.find((i) => i.id === itemId);
        if (found) {
          currentStatus = found.status;
          itemTitle = found.title;
          break;
        }
      }

      // Optimistic update
      const isCurrentlyCompleted = currentStatus === "COMPLETED";
      const nextStatus = isCurrentlyCompleted ? "NOT_STARTED" : "COMPLETED";

      setSubject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          topics: prev.topics.map((t) => ({
            ...t,
            learningItems: t.learningItems.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    status: nextStatus as LearningItem["status"],
                    completedAt: isCurrentlyCompleted ? undefined : new Date().toISOString(),
                  }
                : i
            ),
          })),
        };
      });

      try {
        await toggleLearningItemCompletionInDb(
          itemId,
          currentStatus as LearningItem["status"],
          user.id,
          subject.id,
          itemTitle
        );
      } catch (err) {
        console.error("Failed to toggle item in DB, reverting:", err);
        await loadSubject();
      }
    },
    [subject, user, loadSubject]
  );

  // ── Handlers: Subject CRUD ────────────────────────────────────────────────
  const handleSaveSubject = useCallback(
    async (updated: Subject) => {
      try {
        await updateSubjectInDb(subjectId, {
          name: updated.name,
          description: updated.description,
          category: updated.category,
          color: updated.color,
          targetDate: updated.targetDate,
        });
        await loadSubject();
        setEditSubjectOpen(false);
      } catch (err) {
        console.error("Error updating subject:", err);
      }
    },
    [subjectId, loadSubject]
  );

  const handleDeleteSubject = useCallback(async () => {
    if (!subject) return;
    if (confirm(`Are you sure you want to delete "${subject.name}" and all its topics?`)) {
      try {
        await deleteSubjectInDb(subject.id);
        router.push("/subjects");
      } catch (err) {
        console.error("Error deleting subject:", err);
      }
    }
  }, [subject, router]);

  // ── Handlers: Topic CRUD ──────────────────────────────────────────────────
  const handleOpenAddTopic = useCallback(() => {
    setEditingTopic(null);
    setTopicDialogOpen(true);
  }, []);

  const handleOpenEditTopic = useCallback((t: Topic) => {
    setEditingTopic(t);
    setTopicDialogOpen(true);
  }, []);

  const handleSaveTopic = useCallback(
    async (t: Topic) => {
      if (!subject) return;
      try {
        if (editingTopic) {
          await updateTopicInDb(t.id, {
            name: t.name,
            description: t.description,
            order: t.order,
          });
        } else {
          await createTopicInDb(subject.id, {
            name: t.name,
            description: t.description,
            order: subject.topics.length + 1,
          });
        }
        await loadSubject();
        setTopicDialogOpen(false);
        setEditingTopic(null);
      } catch (err) {
        console.error("Error saving topic:", err);
      }
    },
    [subject, editingTopic, loadSubject]
  );

  const handleDeleteTopic = useCallback(
    async (topicId: string) => {
      if (confirm("Are you sure you want to delete this topic and all its learning items?")) {
        try {
          await deleteTopicInDb(topicId);
          await loadSubject();
        } catch (err) {
          console.error("Error deleting topic:", err);
        }
      }
    },
    [loadSubject]
  );

  // ── Handlers: Learning Item CRUD ──────────────────────────────────────────
  const handleOpenAddItem = useCallback((topicId: string) => {
    setActiveTopicIdForItem(topicId);
    setEditingItem(null);
    setItemDialogOpen(true);
  }, []);

  const handleOpenEditItem = useCallback((topicId: string, item: LearningItem) => {
    setActiveTopicIdForItem(topicId);
    setEditingItem(item);
    setItemDialogOpen(true);
  }, []);

  const handleSaveLearningItem = useCallback(
    async (item: LearningItem) => {
      try {
        if (editingItem) {
          await updateLearningItemInDb(item.id, {
            title: item.title,
            description: item.description,
            estimatedMinutes: item.estimatedMinutes,
            priority: item.priority,
            resources: item.resources,
          });
        } else {
          await createLearningItemInDb(activeTopicIdForItem, {
            title: item.title,
            description: item.description,
            estimatedMinutes: item.estimatedMinutes,
            priority: item.priority,
            resources: item.resources,
          });
        }
        await loadSubject();
        setItemDialogOpen(false);
        setEditingItem(null);
      } catch (err) {
        console.error("Error saving learning item:", err);
      }
    },
    [editingItem, activeTopicIdForItem, loadSubject]
  );

  const handleDeleteLearningItem = useCallback(
    async (itemId: string) => {
      try {
        await deleteLearningItemInDb(itemId);
        await loadSubject();
      } catch (err) {
        console.error("Error deleting learning item:", err);
      }
    },
    [loadSubject]
  );

  // ── Loading & Not Found States ────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
        <Sidebar />
        <main className="flex flex-1 flex-col items-center justify-center p-8">
          <Loader2 size={32} className="animate-spin text-[#22d3ee]" />
          <span className="mt-3 text-xs text-[#6b6b80]">Loading subject curriculum...</span>
        </main>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
        <Sidebar />
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <BookOpen size={24} style={{ color: "#6b6b80" }} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[#f0f0f4]">
            Subject Not Found
          </h2>
          <p className="mb-6 max-w-sm text-[13px] text-[#6b6b80]">
            The requested subject track could not be found in your curriculum.
          </p>
          <Link
            href="/subjects"
            className="flex items-center gap-2 rounded-[7px] px-4 py-2 text-[12.5px] font-semibold no-underline"
            style={{
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.3)",
              color: "#22d3ee",
            }}
          >
            <ArrowLeft size={13} />
            Back to Subjects
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 px-9 pt-7 pb-12">
          {/* Header Banner */}
          <SubjectDetailHeader
            subject={subject}
            onEditSubject={() => setEditSubjectOpen(true)}
            onDeleteSubject={handleDeleteSubject}
            onAddTopic={handleOpenAddTopic}
          />

          {/* Section: Topics & Learning Items */}
          <div className="mt-8">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="m-0 text-[13px] font-semibold text-[#f0f0f4]">
                Curriculum Topics & Learning Items
              </h2>
              <span className="text-[11px]" style={{ color: "#5a5a6a" }}>
                Interactive Checklists
              </span>
            </div>

            {subject.topics.length === 0 ? (
              <div
                className="rounded-[10px] p-8 text-center"
                style={{
                  background: "#13131a",
                  border: "1px dashed rgba(255,255,255,0.08)",
                }}
              >
                <p className="m-0 mb-3 text-[13px] text-[#7a7a8e]">
                  This subject does not have any topics yet.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddTopic}
                  className="cursor-pointer rounded-[7px] px-4 py-2 text-[12px] font-semibold"
                  style={{
                    background: subject.color,
                    color: "#000",
                  }}
                >
                  Create First Topic
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {subject.topics.map((topic) => (
                  <TopicSection
                    key={topic.id}
                    topic={topic}
                    subjectColor={subject.color}
                    onToggleItem={handleToggleItem}
                    onEditTopic={() => handleOpenEditTopic(topic)}
                    onDeleteTopic={() => handleDeleteTopic(topic.id)}
                    onAddLearningItem={() => handleOpenAddItem(topic.id)}
                    onEditLearningItem={(item) => handleOpenEditItem(topic.id, item)}
                    onDeleteLearningItem={handleDeleteLearningItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Dialogs ─────────────────────────────────────────────────── */}
      <AddSubjectDialog
        open={editSubjectOpen}
        editingSubject={subject}
        onClose={() => setEditSubjectOpen(false)}
        onSave={handleSaveSubject}
      />

      <AddTopicDialog
        open={topicDialogOpen}
        subjectId={subject.id}
        subjectColor={subject.color}
        editingTopic={editingTopic}
        onClose={() => {
          setTopicDialogOpen(false);
          setEditingTopic(null);
        }}
        onSave={handleSaveTopic}
      />

      <AddLearningItemDialog
        open={itemDialogOpen}
        topicId={activeTopicIdForItem}
        subjectColor={subject.color}
        editingItem={editingItem}
        onClose={() => {
          setItemDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveLearningItem}
      />
    </div>
  );
}
