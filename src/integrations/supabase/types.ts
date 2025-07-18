export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_status: string
          created_at: string
          id: string
          notes: string | null
          participant_age: number | null
          participant_gender: string | null
          participant_name: string
          participant_phone: string | null
          training_session_id: string
        }
        Insert: {
          attendance_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          participant_age?: number | null
          participant_gender?: string | null
          participant_name: string
          participant_phone?: string | null
          training_session_id: string
        }
        Update: {
          attendance_status?: string
          created_at?: string
          id?: string
          notes?: string | null
          participant_age?: number | null
          participant_gender?: string | null
          participant_name?: string
          participant_phone?: string | null
          training_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string
          duration_hours: number | null
          id: string
          is_active: boolean
          learning_objectives: string[] | null
          name: string
          parent_module_id: string | null
          prerequisites: string[] | null
          sort_order: number | null
          updated_at: string
          value_chain: Database["public"]["Enums"]["value_chain"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string
          duration_hours?: number | null
          id?: string
          is_active?: boolean
          learning_objectives?: string[] | null
          name: string
          parent_module_id?: string | null
          prerequisites?: string[] | null
          sort_order?: number | null
          updated_at?: string
          value_chain: Database["public"]["Enums"]["value_chain"]
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string
          duration_hours?: number | null
          id?: string
          is_active?: boolean
          learning_objectives?: string[] | null
          name?: string
          parent_module_id?: string | null
          prerequisites?: string[] | null
          sort_order?: number | null
          updated_at?: string
          value_chain?: Database["public"]["Enums"]["value_chain"]
        }
        Relationships: [
          {
            foreignKeyName: "modules_parent_module_id_fkey"
            columns: ["parent_module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          training_session_id: string
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          training_session_id: string
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          training_session_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_value_chains:
            | Database["public"]["Enums"]["value_chain"][]
            | null
          constituency: Database["public"]["Enums"]["constituency"] | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          ward: string | null
        }
        Insert: {
          assigned_value_chains?:
            | Database["public"]["Enums"]["value_chain"][]
            | null
          constituency?: Database["public"]["Enums"]["constituency"] | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          ward?: string | null
        }
        Update: {
          assigned_value_chains?:
            | Database["public"]["Enums"]["value_chain"][]
            | null
          constituency?: Database["public"]["Enums"]["constituency"] | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          ward?: string | null
        }
        Relationships: []
      }
      trainer_modules: {
        Row: {
          assigned_at: string
          certification_status: string
          certified_at: string | null
          competency_level: string
          id: string
          module_id: string
          trainer_id: string
        }
        Insert: {
          assigned_at?: string
          certification_status?: string
          certified_at?: string | null
          competency_level?: string
          id?: string
          module_id: string
          trainer_id: string
        }
        Update: {
          assigned_at?: string
          certification_status?: string
          certified_at?: string | null
          competency_level?: string
          id?: string
          module_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_modules_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          actual_participants: number | null
          completion_notes: string | null
          constituency: Database["public"]["Enums"]["constituency"]
          created_at: string
          description: string | null
          expected_participants: number | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          scheduled_date: string
          scheduled_time: string
          status: string
          supervisor_comments: string | null
          title: string
          trainer_id: string
          updated_at: string
          value_chain: Database["public"]["Enums"]["value_chain"]
          venue: string
          ward: string
        }
        Insert: {
          actual_participants?: number | null
          completion_notes?: string | null
          constituency: Database["public"]["Enums"]["constituency"]
          created_at?: string
          description?: string | null
          expected_participants?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          scheduled_date: string
          scheduled_time: string
          status?: string
          supervisor_comments?: string | null
          title: string
          trainer_id: string
          updated_at?: string
          value_chain: Database["public"]["Enums"]["value_chain"]
          venue: string
          ward: string
        }
        Update: {
          actual_participants?: number | null
          completion_notes?: string | null
          constituency?: Database["public"]["Enums"]["constituency"]
          created_at?: string
          description?: string | null
          expected_participants?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          supervisor_comments?: string | null
          title?: string
          trainer_id?: string
          updated_at?: string
          value_chain?: Database["public"]["Enums"]["value_chain"]
          venue?: string
          ward?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wards: {
        Row: {
          constituency: Database["public"]["Enums"]["constituency"]
          created_at: string
          id: string
          name: string
          ward_code: string | null
        }
        Insert: {
          constituency: Database["public"]["Enums"]["constituency"]
          created_at?: string
          id?: string
          name: string
          ward_code?: string | null
        }
        Update: {
          constituency?: Database["public"]["Enums"]["constituency"]
          created_at?: string
          id?: string
          name?: string
          ward_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      constituency:
        | "igembe_south"
        | "igembe_central"
        | "igembe_north"
        | "tigania_west"
        | "tigania_east"
        | "north_imenti"
        | "buuri"
        | "central_imenti"
        | "south_imenti"
      user_role: "admin" | "trainer" | "supervisor"
      value_chain: "banana" | "avocado" | "dairy" | "irish_potato" | "coffee"
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
    Enums: {
      constituency: [
        "igembe_south",
        "igembe_central",
        "igembe_north",
        "tigania_west",
        "tigania_east",
        "north_imenti",
        "buuri",
        "central_imenti",
        "south_imenti",
      ],
      user_role: ["admin", "trainer", "supervisor"],
      value_chain: ["banana", "avocado", "dairy", "irish_potato", "coffee"],
    },
  },
} as const
