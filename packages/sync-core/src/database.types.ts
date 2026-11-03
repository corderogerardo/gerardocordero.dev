export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      badges: {
        Row: {
          code: string
          description: string
          name: string
        }
        Insert: {
          code: string
          description: string
          name: string
        }
        Update: {
          code?: string
          description?: string
          name?: string
        }
        Relationships: []
      }
      crm_outbox: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          lead_id: string
          next_attempt_at: string
          org_id: string
          status: Database["public"]["Enums"]["crm_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          lead_id: string
          next_attempt_at?: string
          org_id: string
          status?: Database["public"]["Enums"]["crm_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          lead_id?: string
          next_attempt_at?: string
          org_id?: string
          status?: Database["public"]["Enums"]["crm_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_outbox_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_outbox_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_scores: {
        Row: {
          computed_at: string
          conversations: number
          day: string
          knocks: number
          member_id: string
          org_id: string
          server_seq: number
          sets: number
          streak_days: number
          xp: number
        }
        Insert: {
          computed_at?: string
          conversations?: number
          day: string
          knocks?: number
          member_id: string
          org_id: string
          server_seq?: number
          sets?: number
          streak_days?: number
          xp?: number
        }
        Update: {
          computed_at?: string
          conversations?: number
          day?: string
          knocks?: number
          member_id?: string
          org_id?: string
          server_seq?: number
          sets?: number
          streak_days?: number
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_scores_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_scores_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dnc_entries: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          occurred_at: string
          org_id: string
          property_id: string
          reason: string | null
          server_seq: number
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          occurred_at?: string
          org_id: string
          property_id: string
          reason?: string | null
          server_seq?: number
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          occurred_at?: string
          org_id?: string
          property_id?: string
          reason?: string | null
          server_seq?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "dnc_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dnc_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dnc_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      hubspot_links: {
        Row: {
          contact_id: string | null
          created_at: string
          deal_id: string | null
          lead_id: string
          org_id: string
          synced_at: string | null
          updated_at: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          lead_id: string
          org_id: string
          synced_at?: string | null
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          lead_id?: string
          org_id?: string
          synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_links_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubspot_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knocks: {
        Row: {
          client_mutation_id: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          note: string | null
          occurred_at: string
          org_id: string
          outcome: Database["public"]["Enums"]["knock_outcome"]
          property_id: string
          rep_id: string
          server_seq: number
          shift_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          client_mutation_id: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          occurred_at: string
          org_id: string
          outcome: Database["public"]["Enums"]["knock_outcome"]
          property_id: string
          rep_id: string
          server_seq?: number
          shift_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          client_mutation_id?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          occurred_at?: string
          org_id?: string
          outcome?: Database["public"]["Enums"]["knock_outcome"]
          property_id?: string
          rep_id?: string
          server_seq?: number
          shift_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "knocks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knocks_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knocks_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          appointment_at: string | null
          client_mutation_id: string
          created_at: string
          email: string | null
          estimated_value: number | null
          id: string
          name: string | null
          notes: string | null
          org_id: string
          phone: string | null
          photo_path: string | null
          property_id: string
          qr_code: string | null
          rep_id: string
          server_seq: number
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
          version: number
        }
        Insert: {
          appointment_at?: string | null
          client_mutation_id: string
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          name?: string | null
          notes?: string | null
          org_id: string
          phone?: string | null
          photo_path?: string | null
          property_id: string
          qr_code?: string | null
          rep_id: string
          server_seq?: number
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
          version?: number
        }
        Update: {
          appointment_at?: string | null
          client_mutation_id?: string
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          id?: string
          name?: string | null
          notes?: string | null
          org_id?: string
          phone?: string | null
          photo_path?: string | null
          property_id?: string
          qr_code?: string | null
          rep_id?: string
          server_seq?: number
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_badges: {
        Row: {
          awarded_on: string
          badge_code: string
          created_at: string
          member_id: string
          org_id: string
        }
        Insert: {
          awarded_on: string
          badge_code: string
          created_at?: string
          member_id: string
          org_id: string
        }
        Update: {
          awarded_on?: string
          badge_code?: string
          created_at?: string
          member_id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "member_badges_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_badges_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          display_name: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["member_role"]
          team_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          org_id: string
          role?: Database["public"]["Enums"]["member_role"]
          team_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          id: string
          lat: number
          lng: number
          org_id: string
          parcel_id: string | null
          postal_code: string
          server_seq: number
          state: string
          updated_at: string
          version: number
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          org_id: string
          parcel_id?: string | null
          postal_code: string
          server_seq?: number
          state: string
          updated_at?: string
          version?: number
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          org_id?: string
          parcel_id?: string | null
          postal_code?: string
          server_seq?: number
          state?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "properties_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          day: string
          ended_at: string | null
          id: string
          org_id: string
          rep_id: string
          server_seq: number
          started_at: string
          territory_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          day: string
          ended_at?: string | null
          id?: string
          org_id: string
          rep_id: string
          server_seq?: number
          started_at: string
          territory_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          day?: string
          ended_at?: string | null
          id?: string
          org_id?: string
          rep_id?: string
          server_seq?: number
          started_at?: string
          territory_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "shifts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_rep_id_fkey"
            columns: ["rep_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_conflicts: {
        Row: {
          created_at: string
          entity: Database["public"]["Enums"]["sync_entity"]
          entity_id: string
          field_group: string
          id: string
          local_value: Json
          org_id: string
          policy: string
          remote_value: Json
          resolved_at: string | null
          resolved_by: string | null
          resolved_value: Json | null
          state: Database["public"]["Enums"]["conflict_state"]
        }
        Insert: {
          created_at?: string
          entity: Database["public"]["Enums"]["sync_entity"]
          entity_id: string
          field_group: string
          id?: string
          local_value: Json
          org_id: string
          policy: string
          remote_value: Json
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_value?: Json | null
          state?: Database["public"]["Enums"]["conflict_state"]
        }
        Update: {
          created_at?: string
          entity?: Database["public"]["Enums"]["sync_entity"]
          entity_id?: string
          field_group?: string
          id?: string
          local_value?: Json
          org_id?: string
          policy?: string
          remote_value?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_value?: Json | null
          state?: Database["public"]["Enums"]["conflict_state"]
        }
        Relationships: [
          {
            foreignKeyName: "sync_conflicts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_mutations: {
        Row: {
          applied_at: string
          entity: Database["public"]["Enums"]["sync_entity"]
          entity_id: string
          member_id: string
          mutation_id: string
          op: Database["public"]["Enums"]["sync_op"]
          org_id: string
          result: Json
        }
        Insert: {
          applied_at?: string
          entity: Database["public"]["Enums"]["sync_entity"]
          entity_id: string
          member_id: string
          mutation_id: string
          op: Database["public"]["Enums"]["sync_op"]
          org_id: string
          result: Json
        }
        Update: {
          applied_at?: string
          entity?: Database["public"]["Enums"]["sync_entity"]
          entity_id?: string
          member_id?: string
          mutation_id?: string
          op?: Database["public"]["Enums"]["sync_op"]
          org_id?: string
          result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sync_mutations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_mutations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      territories: {
        Row: {
          boundary: Json
          created_at: string
          ends_on: string | null
          id: string
          name: string
          org_id: string
          server_seq: number
          starts_on: string
          team_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          boundary: Json
          created_at?: string
          ends_on?: string | null
          id?: string
          name: string
          org_id: string
          server_seq?: number
          starts_on: string
          team_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          boundary?: Json
          created_at?: string
          ends_on?: string | null
          id?: string
          name?: string
          org_id?: string
          server_seq?: number
          starts_on?: string
          team_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "territories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      territory_properties: {
        Row: {
          org_id: string
          property_id: string
          territory_id: string
        }
        Insert: {
          org_id: string
          property_id: string
          territory_id: string
        }
        Update: {
          org_id?: string
          property_id?: string
          territory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "territory_properties_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territory_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territory_properties_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conflict_state: "open" | "resolved"
      crm_status: "pending" | "sent" | "failed"
      knock_outcome:
        | "no_answer"
        | "not_interested"
        | "conversation"
        | "dnc"
        | "set"
      lead_stage: "new" | "contacted" | "appointment" | "won" | "lost"
      member_role: "rep" | "manager" | "admin"
      sync_entity: "knock" | "lead" | "dnc"
      sync_op: "create" | "update"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      conflict_state: ["open", "resolved"],
      crm_status: ["pending", "sent", "failed"],
      knock_outcome: [
        "no_answer",
        "not_interested",
        "conversation",
        "dnc",
        "set",
      ],
      lead_stage: ["new", "contacted", "appointment", "won", "lost"],
      member_role: ["rep", "manager", "admin"],
      sync_entity: ["knock", "lead", "dnc"],
      sync_op: ["create", "update"],
    },
  },
} as const

