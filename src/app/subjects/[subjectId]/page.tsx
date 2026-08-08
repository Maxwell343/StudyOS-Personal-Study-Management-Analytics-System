"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SubjectDetailHeader } from "@/components/subjects/detail/SubjectDetailHeader";
import { TopicSection } from "@/components/subjects/detail/TopicSection";
import { AddSubjectDialog } from "@/components/subjects/AddSubjectDialog";
import { AddTopicDialog } from "@/components/subjects/detail/AddTopicDialog";
import { AddLearningItemDialog } from "@/components/subjects/detail/AddLearningItemDialog";
import { initialSubjects } from "@/data/mock-subjects";
import type { Subject, Topic, LearningItem } from "@/types/subjects";

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = use(params);
  const router = useRouter();

  // Find initial subject from mock data
  const initialSubject = initialSubjects.find((s) => s.id === subjectId);

  // ── State ──────────────────────────────────────────────────────────────────
  const [subject, setSubject] = useState<Subject | undefined>(initialSubject);

  // Dialog States
  const [editSubjectOpen, setEditSubjectOpen] = useState(false);

  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [activeTopicIdForItem, setActiveTopicIdForItem] = useState<string>("");
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null);

  // ── Handlers: Item Toggle (NOT_STARTED / IN_PROGRESS <-> COMPLETED) ────────
  const handleToggleItem = useCallback(
    (itemId: string) => {
      if (!subject) return;

      const updatedTopics = subject.topics.map((top) => {
        const item = top.learningItems.find((i) => i.id === itemId);
        if (!item) return top;

        const isCurrentlyCompleted = item.status === "COMPLETED";
        const updatedItem: LearningItem = {
          ...item,
          status: isCurrentlyCompleted ? "NOT_STARTED" : "COMPLETED",
          completedAt: isCurrentlyCompleted ? undefined : new Date().toISOString(),
        };

        return {
          ...top,
          learningItems: top.learningItems.map((i) =>
            i.id === itemId ? updatedItem : i
          ),
        };
      });

      setSubject({
        ...subject,
        topics: updatedTopics,
      });
    },
    [subject]
  );

  // ── Handlers: Subject CRUD ────────────────────────────────────────────────
  const handleSaveSubject = useCallback((updated: Subject) => {
    setSubject((prev) => (prev ? { ...prev, ...updated } : updated));
    setEditSubjectOpen(false);
  }, []);

  const handleDeleteSubject = useCallback(() => {
    if (confirm(`Are you sure you want to delete "${subject?.name}"?`)) {
      router.push("/subjects");
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
    (t: Topic) => {
      if (!subject) return;

      const exists = subject.topics.some((top) => top.id === t.id);
      let newTopics: Topic[];

      if (exists) {
        newTopics = subject.topics.map((top) => (top.id === t.id ? t : top));
      } else {
        newTopics = [...subject.topics, t];
      }

      setSubject({
        ...subject,
        topics: newTopics,
      });
      setTopicDialogOpen(false);
      setEditingTopic(null);
    },
    [subject]
  );

  const handleDeleteTopic = useCallback(
    (topicId: string) => {
      if (!subject) return;
      if (confirm("Are you sure you want to delete this topic?")) {
        setSubject({
          ...subject,
          topics: subject.topics.filter((top) => top.id !== topicId),
        });
      }
    },
    [subject]
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
    (item: LearningItem) => {
      if (!subject) return;

      const updatedTopics = subject.topics.map((top) => {
        if (top.id !== activeTopicIdForItem) return top;

        const exists = top.learningItems.some((i) => i.id === item.id);
        let newItems: LearningItem[];

        if (exists) {
          newItems = top.learningItems.map((i) => (i.id === item.id ? item : i));
        } else {
          newItems = [...top.learningItems, item];
        }

        return {
          ...top,
          learningItems: newItems,
        };
      });

      setSubject({
        ...subject,
        topics: updatedTopics,
      });
      setItemDialogOpen(false);
      setEditingItem(null);
    },
    [subject, activeTopicIdForItem]
  );

  const handleDeleteLearningItem = useCallback(
    (itemId: string) => {
      if (!subject) return;

      const updatedTopics = subject.topics.map((top) => ({
        ...top,
        learningItems: top.learningItems.filter((i) => i.id !== itemId),
      }));

      setSubject({
        ...subject,
        topics: updatedTopics,
      });
    },
    [subject]
  );

  // ── Not Found State ───────────────────────────────────────────────────────
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
            The requested subject track could not be found or has been removed.
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
