export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LearningItemStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type LearningItemPriority = "LOW" | "MEDIUM" | "HIGH";
export type StudyPlanStatus = "DRAFT" | "LOCKED" | "COMPLETED";
export type PlannedSessionStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "MISSED" | "CANCELLED";
export type TaskStatus = "PENDING" | "COMPLETED";
export type StudySessionStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ABANDONED";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          category: string;
          color: string;
          target_date: string | null;
          archived: boolean;
          dbms_seeded: boolean;
          sql_seeded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          category?: string;
          color?: string;
          target_date?: string | null;
          archived?: boolean;
          dbms_seeded?: boolean;
          sql_seeded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          color?: string;
          target_date?: string | null;
          archived?: boolean;
          dbms_seeded?: boolean;
          sql_seeded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          subject_id: string;
          name: string;
          description: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          name: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_items: {
        Row: {
          id: string;
          topic_id: string;
          title: string;
          description: string | null;
          display_order: number;
          status: LearningItemStatus;
          priority: LearningItemPriority;
          estimated_minutes: number;
          notes: string | null;
          resources: Json;
          completed_at: string | null;
          last_studied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          title: string;
          description?: string | null;
          display_order?: number;
          status?: LearningItemStatus;
          priority?: LearningItemPriority;
          estimated_minutes?: number;
          notes?: string | null;
          resources?: Json;
          completed_at?: string | null;
          last_studied_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          title?: string;
          description?: string | null;
          display_order?: number;
          status?: LearningItemStatus;
          priority?: LearningItemPriority;
          estimated_minutes?: number;
          notes?: string | null;
          resources?: Json;
          completed_at?: string | null;
          last_studied_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      study_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_date: string;
          status: StudyPlanStatus;
          target_minutes: number;
          locked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_date: string;
          status?: StudyPlanStatus;
          target_minutes?: number;
          locked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_date?: string;
          status?: StudyPlanStatus;
          target_minutes?: number;
          locked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      planned_sessions: {
        Row: {
          id: string;
          study_plan_id: string;
          user_id: string;
          subject_id: string | null;
          topic_id: string | null;
          learning_item_id: string | null;
          title: string;
          start_time: string;
          end_time: string;
          planned_minutes: number;
          status: PlannedSessionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          study_plan_id: string;
          user_id: string;
          subject_id?: string | null;
          topic_id?: string | null;
          learning_item_id?: string | null;
          title: string;
          start_time: string;
          end_time: string;
          planned_minutes?: number;
          status?: PlannedSessionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          study_plan_id?: string;
          user_id?: string;
          subject_id?: string | null;
          topic_id?: string | null;
          learning_item_id?: string | null;
          title?: string;
          start_time?: string;
          end_time?: string;
          planned_minutes?: number;
          status?: PlannedSessionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          learning_item_id: string;
          planned_session_id: string | null;
          title: string;
          status: TaskStatus;
          priority: LearningItemPriority;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          learning_item_id: string;
          planned_session_id?: string | null;
          title: string;
          status?: TaskStatus;
          priority?: LearningItemPriority;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          learning_item_id?: string;
          planned_session_id?: string | null;
          title?: string;
          status?: TaskStatus;
          priority?: LearningItemPriority;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          planned_session_id: string | null;
          learning_item_id: string | null;
          started_at: string;
          paused_at: string | null;
          ended_at: string | null;
          total_paused_seconds: number;
          planned_minutes: number;
          actual_minutes: number | null;
          status: StudySessionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          planned_session_id?: string | null;
          learning_item_id?: string | null;
          started_at?: string;
          paused_at?: string | null;
          ended_at?: string | null;
          total_paused_seconds?: number;
          planned_minutes?: number;
          actual_minutes?: number | null;
          status?: StudySessionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          planned_session_id?: string | null;
          learning_item_id?: string;
          started_at?: string;
          paused_at?: string | null;
          ended_at?: string | null;
          total_paused_seconds?: number;
          planned_minutes?: number;
          actual_minutes?: number | null;
          status?: StudySessionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          learning_item_id: string | null;
          subject_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          learning_item_id?: string | null;
          subject_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          learning_item_id?: string | null;
          subject_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      seed_user_curriculum: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
      seed_dbms_curriculum: {
        Args: {
          p_user_id: string;
          p_subject_id: string;
        };
        Returns: void;
      };
      seed_sql_curriculum: {
        Args: {
          p_user_id: string;
          p_subject_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
