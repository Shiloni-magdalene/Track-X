export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aptitude: {
        Row: {
          accuracy: number
          category: string
          created_at: string
          difficulty: string | null
          id: string
          last_practiced: string | null
          notes: string | null
          progress_percent: number
          questions_solved: number
          revision_due: string | null
          time_per_question: number
          topic: string
          updated_at: string
          user_id: string
          weakness_level: string | null
        }
        Insert: {
          accuracy?: number
          category: string
          created_at?: string
          difficulty?: string | null
          id?: string
          last_practiced?: string | null
          notes?: string | null
          progress_percent?: number
          questions_solved?: number
          revision_due?: string | null
          time_per_question?: number
          topic: string
          updated_at?: string
          user_id: string
          weakness_level?: string | null
        }
        Update: {
          accuracy?: number
          category?: string
          created_at?: string
          difficulty?: string | null
          id?: string
          last_practiced?: string | null
          notes?: string | null
          progress_percent?: number
          questions_solved?: number
          revision_due?: string | null
          time_per_question?: number
          topic?: string
          updated_at?: string
          user_id?: string
          weakness_level?: string | null
        }
        Relationships: []
      }
      aptitude_mocks: {
        Row: {
          accuracy: number
          created_at: string
          date: string
          id: string
          improvement_suggestions: string | null
          logical_score: number
          mistakes: Json
          quant_score: number
          time_taken: number | null
          total_score: number
          updated_at: string
          user_id: string
          verbal_score: number
        }
        Insert: {
          accuracy?: number
          created_at?: string
          date?: string
          id?: string
          improvement_suggestions?: string | null
          logical_score?: number
          mistakes?: Json
          quant_score?: number
          time_taken?: number | null
          total_score?: number
          updated_at?: string
          user_id: string
          verbal_score?: number
        }
        Update: {
          accuracy?: number
          created_at?: string
          date?: string
          id?: string
          improvement_suggestions?: string | null
          logical_score?: number
          mistakes?: Json
          quant_score?: number
          time_taken?: number | null
          total_score?: number
          updated_at?: string
          user_id?: string
          verbal_score?: number
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          date: string | null
          id: string
          linkedin_posted: boolean
          name: string
          platform: string | null
          resume_added: boolean
          skills_learned: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          linkedin_posted?: boolean
          name: string
          platform?: string | null
          resume_added?: boolean
          skills_learned?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          linkedin_posted?: boolean
          name?: string
          platform?: string | null
          resume_added?: boolean
          skills_learned?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          date: string | null
          end_sem_data: Json
          id: string
          marks: number | null
          practical_data: Json
          revision_percent: number
          subject_id: string | null
          syllabus_covered: number
          target_marks: number | null
          type: string
          updated_at: string
          user_id: string
          weak_topics: Json
        }
        Insert: {
          created_at?: string
          date?: string | null
          end_sem_data?: Json
          id?: string
          marks?: number | null
          practical_data?: Json
          revision_percent?: number
          subject_id?: string | null
          syllabus_covered?: number
          target_marks?: number | null
          type: string
          updated_at?: string
          user_id: string
          weak_topics?: Json
        }
        Update: {
          created_at?: string
          date?: string | null
          end_sem_data?: Json
          id?: string
          marks?: number | null
          practical_data?: Json
          revision_percent?: number
          subject_id?: string | null
          syllabus_covered?: number
          target_marks?: number | null
          type?: string
          updated_at?: string
          user_id?: string
          weak_topics?: Json
        }
        Relationships: [
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      leetcode: {
        Row: {
          created_at: string
          difficulty: string | null
          id: string
          notes: string | null
          problem_name: string
          revision_needed: boolean
          solved_date: string | null
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          id?: string
          notes?: string | null
          problem_name: string
          revision_needed?: boolean
          solved_date?: string | null
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          id?: string
          notes?: string | null
          problem_name?: string
          revision_needed?: boolean
          solved_date?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_tracker: {
        Row: {
          created_at: string
          engagement: Json
          id: string
          next_post_idea: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engagement?: Json
          id?: string
          next_post_idea?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          engagement?: Json
          id?: string
          next_post_idea?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_insights_cache: Json
          created_at: string
          email: string | null
          id: string
          name: string | null
          overall_academic_progress: number
          overall_placement_readiness: number
          updated_at: string
        }
        Insert: {
          ai_insights_cache?: Json
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          overall_academic_progress?: number
          overall_placement_readiness?: number
          updated_at?: string
        }
        Update: {
          ai_insights_cache?: Json
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          overall_academic_progress?: number
          overall_placement_readiness?: number
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          deadline: string | null
          doc_progress: number
          github_link: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          doc_progress?: number
          github_link?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          doc_progress?: number
          github_link?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          confidence: number
          created_at: string
          hours_studied: number
          id: string
          last_updated: string
          learning_percent: number
          name: string
          practice_questions: number
          projects_built: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          confidence?: number
          created_at?: string
          hours_studied?: number
          id?: string
          last_updated?: string
          learning_percent?: number
          name: string
          practice_questions?: number
          projects_built?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          confidence?: number
          created_at?: string
          hours_studied?: number
          id?: string
          last_updated?: string
          learning_percent?: number
          name?: string
          practice_questions?: number
          projects_built?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          assignment: Json
          created_at: string
          credits: number
          id: string
          name: string
          project: Json
          study_plan: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment?: Json
          created_at?: string
          credits?: number
          id?: string
          name: string
          project?: Json
          study_plan?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment?: Json
          created_at?: string
          credits?: number
          id?: string
          name?: string
          project?: Json
          study_plan?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
