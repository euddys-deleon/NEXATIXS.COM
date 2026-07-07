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
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          id?: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          client_id: string
          created_at?: string
          full_name: string
          id: string
          role?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          city: string | null
          company_name: string
          company_size: string | null
          contract_start_date: string | null
          country: string | null
          created_at: string
          domain: string | null
          employee_count: number | null
          id: string
          prospect_id: string | null
          rnc: string | null
          sector: string | null
          support_level: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          company_name: string
          company_size?: string | null
          contract_start_date?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          employee_count?: number | null
          id?: string
          prospect_id?: string | null
          rnc?: string | null
          sector?: string | null
          support_level?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string
          company_size?: string | null
          contract_start_date?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          employee_count?: number | null
          id?: string
          prospect_id?: string | null
          rnc?: string | null
          sector?: string | null
          support_level?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: true
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          description: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          paid_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string
          description: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          description?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          category: string | null
          client_id: string
          created_at: string
          expires_at: string | null
          id: string
          name: string
          status: string
          usage_percent: number | null
        }
        Insert: {
          category?: string | null
          client_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          name: string
          status: string
          usage_percent?: number | null
        }
        Update: {
          category?: string | null
          client_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          name?: string
          status?: string
          usage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      project_status_history: {
        Row: {
          changed_at: string
          id: string
          notes: string | null
          phase: string
          project_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          notes?: string | null
          phase: string
          project_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          notes?: string | null
          phase?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_status_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string
          created_at: string
          estimated_end_date: string | null
          id: string
          name: string
          progress_percent: number
          start_date: string | null
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          estimated_end_date?: string | null
          id?: string
          name: string
          progress_percent?: number
          start_date?: string | null
          status: string
        }
        Update: {
          client_id?: string
          created_at?: string
          estimated_end_date?: string | null
          id?: string
          name?: string
          progress_percent?: number
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          display_id: string
          form_type: string
          id: string
          payload: Json
          pipeline_phase: string
          status: string
        }
        Insert: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          display_id: string
          form_type: string
          id?: string
          payload: Json
          pipeline_phase?: string
          status?: string
        }
        Update: {
          category?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          display_id?: string
          form_type?: string
          id?: string
          payload?: Json
          pipeline_phase?: string
          status?: string
        }
        Relationships: []
      }
      services_catalog: {
        Row: {
          created_at: string
          id: string
          is_upsell_eligible: boolean
          item_name: string
          pillar_slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_upsell_eligible?: boolean
          item_name: string
          pillar_slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_upsell_eligible?: boolean
          item_name?: string
          pillar_slug?: string
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          message: string
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          message: string
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          message?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          category: string
          client_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          category: string
          client_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      upsell_requests: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          item_name: string
          requested_by: string | null
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          item_name: string
          requested_by?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item_name?: string
          requested_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "upsell_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_activate_client: {
        Args: {
          p_auth_email: string
          p_company_name: string
          p_contact_full_name: string
          p_prospect_id: string
        }
        Returns: string
      }
      can_access_attachment: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: boolean
      }
      create_prospect: {
        Args: {
          p_category: string
          p_contact_email: string
          p_contact_name: string
          p_contact_phone: string
          p_form_type: string
          p_payload: Json
        }
        Returns: string
      }
      current_client_id: { Args: never; Returns: string }
      get_prospect_status: { Args: { p_display_id: string }; Returns: Json }
      is_staff: { Args: never; Returns: boolean }
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
