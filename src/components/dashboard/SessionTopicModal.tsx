"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronRight,
  Loader2,
  Sparkles,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { StudySession } from "@/types/dashboard";
import { getTodayDateString } from "@/lib/data-access/planner";
interface TopicItem {
  id: string;
  topic_id: string;
  title: string;
  description?: string | null;
  display_order?: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimated_minutes: number;
  completed_at?: string | null;
  resources?: Array<{ title: string; url?: string; type?: string }> | null;
}

function sortItemsAscending(items: TopicItem[]): TopicItem[] {
  return [...items].sort((a, b) => {
    if (
      typeof a.display_order === "number" &&
      typeof b.display_order === "number" &&
      a.display_order !== b.display_order
    ) {
      return a.display_order - b.display_order;
    }
    return a.title.localeCompare(b.title, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

interface TopicDetails {
  id: string;
  subject_id: string;
  name: string;
  description?: string | null;
  items: TopicItem[];
}

interface SessionTopicModalProps {
  session: StudySession | null;
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onStartSession?: (session: StudySession) => void;
  onRefreshData?: () => void;
}

export function SessionTopicModal({
  session,
  isOpen,
  onClose,
  onStartSession,
  onRefreshData,
}: SessionTopicModalProps) {
  const [topicDetails, setTopicDetails] = useState<TopicDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchTopicDetails = useCallback(async () => {
    if (!session) return;
    setShowCompleted(false);
    setLoading(true);

    try {
      // 0. Query the exact planned_session created when tomorrow's plan was written
      const { data: psRow } = await supabase
        .from("planned_sessions")
        .select("*")
        .eq("id", session.id)
        .maybeSingle();

      const targetTopicId = psRow?.topic_id || session.topicId || null;
      const targetLearningItemId = psRow?.learning_item_id || session.learningItemId || null;
      const targetSubjectId = psRow?.subject_id || session.subjectId || null;

      // 1. Direct topic_id lookup if planned_session linked to a specific topic
      if (targetTopicId) {
        const { data: topicData } = await supabase
          .from("topics")
          .select("*")
          .eq("id", targetTopicId)
          .maybeSingle();

        if (topicData) {
          const { data: itemsData } = await supabase
            .from("learning_items")
            .select("*")
            .eq("topic_id", topicData.id);

          setTopicDetails({
            id: topicData.id,
            subject_id: topicData.subject_id,
            name: topicData.name || session.topic,
            description: topicData.description,
            items: (itemsData || []) as unknown as TopicItem[],
          });
          setLoading(false);
          return;
        }
      }

      // 2. Lookup by learning_item_id if planned_session linked to a specific item
      if (targetLearningItemId) {
        const { data: itemData } = await supabase
          .from("learning_items")
          .select("*")
          .eq("id", targetLearningItemId)
          .maybeSingle();

        if (itemData?.topic_id) {
          const { data: topicObj } = await supabase
            .from("topics")
            .select("*")
            .eq("id", itemData.topic_id)
            .maybeSingle();

          const { data: allItems } = await supabase
            .from("learning_items")
            .select("*")
            .eq("topic_id", itemData.topic_id);

          setTopicDetails({
            id: itemData.topic_id,
            subject_id: topicObj?.subject_id || targetSubjectId || "",
            name: topicObj?.name || session.topic,
            description: topicObj?.description || null,
            items: (allItems || []) as unknown as TopicItem[],
          });
          setLoading(false);
          return;
        }
      }

      // 3. Fallback: match by subject name & planned topic title from the saved plan
      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, name");

      if (subjects && subjects.length > 0) {
        const matchedSub = subjects.find(
          (s) =>
            s.name.toLowerCase().trim() === session.subject.toLowerCase().trim() ||
            s.name.toLowerCase().includes(session.subject.toLowerCase()) ||
            session.subject.toLowerCase().includes(s.name.toLowerCase())
        );

        if (matchedSub) {
          const { data: topics } = await supabase
            .from("topics")
            .select("*")
            .eq("subject_id", matchedSub.id);

          if (topics && topics.length > 0) {
            const matchedTopic = topics.find((t) => {
              const tName = t.name.toLowerCase().trim();
              const sTopic = session.topic.toLowerCase().trim();
              return (
                tName === sTopic ||
                sTopic.includes(tName) ||
                tName.includes(sTopic)
              );
            });

            if (matchedTopic) {
              const { data: items } = await supabase
                .from("learning_items")
                .select("*")
                .eq("topic_id", matchedTopic.id);

              setTopicDetails({
                id: matchedTopic.id,
                subject_id: matchedSub.id,
                name: matchedTopic.name,
                description: matchedTopic.description,
                items: (items || []) as unknown as TopicItem[],
              });
              setLoading(false);
              return;
            }
          }
        }
      }

      // Fallback: Exact planned topic representation
      setTopicDetails({
        id: targetTopicId || "adhoc-topic",
        subject_id: targetSubjectId || "",
        name: session.topic,
        description: null,
        items: [],
      });
    } catch (err) {
      console.error("Error fetching topic details:", err);
      setTopicDetails({
        id: "adhoc-topic",
        subject_id: "",
        name: session.topic,
        description: null,
        items: [],
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Active (uncompleted) sub-topics planned to study
  const activeUncompletedItems = useMemo(() => {
    if (!topicDetails?.items) return [];
    return topicDetails.items.filter((item) => {
      const rawStatus = String(item.status || "").toUpperCase();
      const isCompleted = rawStatus === "COMPLETED" || Boolean(item.completed_at);
      return !isCompleted;
    });
  }, [topicDetails]);

  const pastCompletedItems = useMemo(() => {
    if (!topicDetails?.items) return [];
    return topicDetails.items.filter((item) => {
      const rawStatus = String(item.status || "").toUpperCase();
      return rawStatus === "COMPLETED" || Boolean(item.completed_at);
    });
  }, [topicDetails]);

  const displayedItems = useMemo(() => {
    const list = showCompleted ? topicDetails?.items || [] : activeUncompletedItems;
    return sortItemsAscending(list);
  }, [topicDetails, activeUncompletedItems, showCompleted]);

  const todayStr = getTodayDateString();

  // Today's planned items: active uncompleted items + items completed TODAY during the session
  const todayPlannedItems = useMemo(() => {
    if (!topicDetails?.items) return [];
    return topicDetails.items.filter((item: TopicItem) => {
      const rawStatus = String(item.status || "").toUpperCase();
      const isCompleted = rawStatus === "COMPLETED" || Boolean(item.completed_at);
      if (!isCompleted) return true;
      if (item.completed_at) {
        const completedDate = String(item.completed_at).slice(0, 10);
        return completedDate === todayStr;
      }
      return false;
    });
  }, [topicDetails, todayStr]);

  const todayCompletedCount = useMemo(() => {
    return todayPlannedItems.filter((item: TopicItem) => {
      const rawStatus = String(item.status || "").toUpperCase();
      const isCompleted = rawStatus === "COMPLETED" || Boolean(item.completed_at);
      if (!isCompleted) return false;
      if (item.completed_at) {
        const completedDate = String(item.completed_at).slice(0, 10);
        return completedDate === todayStr;
      }
      return false;
    }).length;
  }, [todayPlannedItems, todayStr]);

  const todayTotalCount = todayPlannedItems.length;
  const todayProgressPercent =
    todayTotalCount > 0
      ? Math.round((todayCompletedCount / todayTotalCount) * 100)
      : 0;

  useEffect(() => {
    if (isOpen && session) {
      let isMounted = true;
      Promise.resolve().then(() => {
        if (isMounted) {
          fetchTopicDetails();
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      Promise.resolve().then(() => setTopicDetails(null));
    }
  }, [isOpen, session, fetchTopicDetails]);

  // ALL HOOKS CALLED AT TOP LEVEL BEFORE CONDITIONAL RETURN
  if (!isOpen || !session) return null;

  const handleToggleItem = async (item: TopicItem) => {
    if (togglingItemId) return;
    setTogglingItemId(item.id);

    const isCurrentlyCompleted =
      String(item.status || "").toUpperCase() === "COMPLETED" || Boolean(item.completed_at);
    const nextStatus = isCurrentlyCompleted ? "NOT_STARTED" : "COMPLETED";

    // Optimistic UI update
    setTopicDetails((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: nextStatus,
                completed_at: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
              }
            : i
        ),
      };
    });

    try {
      await supabase
        .from("learning_items")
        .update({
          status: nextStatus,
          completed_at: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
        })
        .eq("id", item.id);

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      console.error("Error toggling learning item completion:", err);
    } finally {
      setTogglingItemId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl transition-all"
        style={{
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 35px ${session.color}15`,
        }}
      >
        {/* Top Accent Line */}
        <div
          className="h-1.5 w-full"
          style={{ background: session.color }}
        />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Subject Tag */}
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold text-foreground/90">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: session.color }}
                />
                {session.subject}
              </div>

              {/* Topic Title */}
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {session.topic}
              </h2>

              {/* Time & Duration Info */}
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                  <Clock size={13} />
                  {session.startTime} — {session.endTime}
                </span>
                <span>•</span>
                <span>{session.duration} allocated today</span>
                {session.status && (
                  <>
                    <span>•</span>
                    <span className="capitalize text-foreground/80">
                      Status: {session.status}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress Bar for Today's Planned Session */}
          {todayTotalCount > 0 && (
            <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-3.5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground/85">
                  Today&apos;s Planned Progress
                </span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {todayCompletedCount} / {todayTotalCount} completed ({todayProgressPercent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${todayProgressPercent}%`,
                    background: session.color || "#0891b2",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Body - Items List */}
        <div className="max-h-[360px] overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-cyan-600 dark:text-cyan-400 mb-2" />
              <span className="text-xs">Loading planned topics & items...</span>
            </div>
          ) : displayedItems.length > 0 ? (
            <div className="space-y-2">
              <div className="mb-2.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Today&apos;s Planned Sub-topics ({displayedItems.length})</span>
                <div className="flex items-center gap-2">
                  {pastCompletedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/20 transition cursor-pointer"
                    >
                      {showCompleted ? "Hide Completed" : `Show Completed (${pastCompletedItems.length})`}
                    </button>
                  )}
                  <span className="font-mono text-[10px] text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Ascending Order (1 &rarr; N)
                  </span>
                </div>
              </div>

              {displayedItems.map((item: TopicItem, idx: number) => {
                const isCompleted =
                  String(item.status || "").toUpperCase() === "COMPLETED" ||
                  Boolean(item.completed_at);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item)}
                    className="group flex cursor-pointer items-start gap-3.5 rounded-xl border border-border bg-secondary/30 p-3.5 transition hover:border-cyan-500/30 hover:bg-secondary/60 shadow-2xs"
                  >
                    {/* Ascending Index Badge */}
                    <span className="font-mono text-xs font-bold text-cyan-600/70 dark:text-cyan-400/60 shrink-0 mt-0.5 min-w-[20px]">
                      #{idx + 1}
                    </span>
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleItem(item);
                      }}
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition cursor-pointer"
                      style={{
                        border: isCompleted
                          ? "none"
                          : "1.5px solid var(--border)",
                        background: isCompleted ? "#16a34a" : "transparent",
                      }}
                    >
                      {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-white font-bold" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-semibold tracking-tight transition ${
                            isCompleted
                              ? "text-muted-foreground line-through"
                              : "text-foreground group-hover:text-cyan-700 dark:group-hover:text-cyan-300"
                          }`}
                        >
                          {item.title}
                        </h4>
                        {item.estimated_minutes > 0 && (
                          <span className="shrink-0 font-mono text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                            {item.estimated_minutes}m
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Badges & Resources */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.priority === "HIGH"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : item.priority === "MEDIUM"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-secondary text-muted-foreground border border-border"
                          }`}
                        >
                          {item.priority} Priority
                        </span>

                        {isCompleted ? (
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            Planned for Today
                          </span>
                        )}

                        {item.resources && item.resources.length > 0 && (
                          <span className="text-[10px] font-medium text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                            <FileText size={10} />
                            {item.resources.length} Resource(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : pastCompletedItems.length > 0 ? (
            /* All items completed empty state */
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-base font-bold text-foreground mb-1">
                All Topics Completed!
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                All sub-topics under <strong className="text-emerald-600 dark:text-emerald-400">{session.topic}</strong> have been completed.
              </p>
              <button
                type="button"
                onClick={() => setShowCompleted(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
              >
                Show Completed Topics ({pastCompletedItems.length})
              </button>
            </div>
          ) : (
            /* Single Topic Adhoc Card */
            <div className="rounded-xl border border-border bg-secondary/30 p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <BookOpen size={22} />
              </div>
              <h4 className="text-base font-bold text-foreground mb-1">
                {session.topic}
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                You have allocated <strong className="text-cyan-600 dark:text-cyan-400">{session.duration}</strong> to study this module today.
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                <Sparkles size={14} />
                Ready for Focus Session
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 p-6 pt-4 border-t border-border bg-secondary/20">
          {topicDetails?.subject_id ? (
            <Link
              href={`/subjects/${topicDetails.subject_id}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 transition"
            >
              <BookOpen size={14} />
              <span>Full Subject Page</span>
              <ChevronRight size={14} />
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground/60">
              StudyOS Personal Track
            </span>
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition cursor-pointer"
            >
              Close
            </button>

            {onStartSession && (
              <button
                type="button"
                onClick={() => {
                  onStartSession(session);
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                Start Session Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
