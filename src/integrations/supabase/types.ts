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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          owner_id: string | null
          pet_id: string | null
          reason: string | null
          status: Database["public"]["Enums"]["appt_status"]
          time: string
          type: Database["public"]["Enums"]["appt_type"]
          updated_at: string
          vet: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          owner_id?: string | null
          pet_id?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["appt_status"]
          time: string
          type?: Database["public"]["Enums"]["appt_type"]
          updated_at?: string
          vet?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          owner_id?: string | null
          pet_id?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["appt_status"]
          time?: string
          type?: Database["public"]["Enums"]["appt_type"]
          updated_at?: string
          vet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      care_records: {
        Row: {
          created_at: string
          date: string
          diagnosis: string | null
          dosage: string | null
          id: string
          medication: string | null
          notes: string | null
          outcome: string | null
          pet_id: string
          record_type: string
          treatment: string | null
          updated_at: string
          vet: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          diagnosis?: string | null
          dosage?: string | null
          id?: string
          medication?: string | null
          notes?: string | null
          outcome?: string | null
          pet_id: string
          record_type?: string
          treatment?: string | null
          updated_at?: string
          vet?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          diagnosis?: string | null
          dosage?: string | null
          id?: string
          medication?: string | null
          notes?: string | null
          outcome?: string | null
          pet_id?: string
          record_type?: string
          treatment?: string | null
          updated_at?: string
          vet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      dewormings: {
        Row: {
          created_at: string
          date_given: string | null
          id: string
          next_due: string | null
          notes: string | null
          pet_id: string
          product: string
          updated_at: string
          vet: string | null
        }
        Insert: {
          created_at?: string
          date_given?: string | null
          id?: string
          next_due?: string | null
          notes?: string | null
          pet_id: string
          product: string
          updated_at?: string
          vet?: string | null
        }
        Update: {
          created_at?: string
          date_given?: string | null
          id?: string
          next_due?: string | null
          notes?: string | null
          pet_id?: string
          product?: string
          updated_at?: string
          vet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dewormings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["item_category"]
          created_at: string
          dosage: string | null
          expiration_date: string | null
          id: string
          name: string
          quantity: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: Database["public"]["Enums"]["item_category"]
          created_at?: string
          dosage?: string | null
          expiration_date?: string | null
          id?: string
          name: string
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["item_category"]
          created_at?: string
          dosage?: string | null
          expiration_date?: string | null
          id?: string
          name?: string
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          batch_no: string | null
          created_at: string
          date: string
          expiration_date: string | null
          id: string
          item_id: string
          pet_id: string | null
          quantity: number
          reason: string | null
          type: Database["public"]["Enums"]["txn_type"]
        }
        Insert: {
          batch_no?: string | null
          created_at?: string
          date?: string
          expiration_date?: string | null
          id?: string
          item_id: string
          pet_id?: string | null
          quantity: number
          reason?: string | null
          type: Database["public"]["Enums"]["txn_type"]
        }
        Update: {
          batch_no?: string | null
          created_at?: string
          date?: string
          expiration_date?: string | null
          id?: string
          item_id?: string
          pet_id?: string | null
          quantity?: number
          reason?: string | null
          type?: Database["public"]["Enums"]["txn_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_transaction_items: {
        Row: {
          description: string
          id: string
          line_total: number
          quantity: number
          transaction_id: string
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          line_total?: number
          quantity?: number
          transaction_id: string
          unit_price?: number
        }
        Update: {
          description?: string
          id?: string
          line_total?: number
          quantity?: number
          transaction_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "lab_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_transactions: {
        Row: {
          created_at: string
          date: string
          id: string
          owner_id: string | null
          pet_id: string | null
          status: string
          total: number
          updated_at: string
          vet: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          owner_id?: string | null
          pet_id?: string | null
          status?: string
          total?: number
          updated_at?: string
          vet?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          owner_id?: string | null
          pet_id?: string | null
          status?: string
          total?: number
          updated_at?: string
          vet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_transactions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_transactions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          channel: string
          created_at: string
          email: string | null
          id: string
          owner_id: string | null
          phone: string | null
          sent_at: string
          status: string
          subject: string | null
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          email?: string | null
          id?: string
          owner_id?: string | null
          phone?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          email?: string | null
          id?: string
          owner_id?: string | null
          phone?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pets: {
        Row: {
          breed: string | null
          cause_of_death: string | null
          created_at: string
          deceased_date: string | null
          dob: string | null
          gender: string | null
          id: string
          image_url: string | null
          name: string
          owner_id: string
          species: string | null
          status: Database["public"]["Enums"]["pet_status"]
          updated_at: string
        }
        Insert: {
          breed?: string | null
          cause_of_death?: string | null
          created_at?: string
          deceased_date?: string | null
          dob?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          name: string
          owner_id: string
          species?: string | null
          status?: Database["public"]["Enums"]["pet_status"]
          updated_at?: string
        }
        Update: {
          breed?: string | null
          cause_of_death?: string | null
          created_at?: string
          deceased_date?: string | null
          dob?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          name?: string
          owner_id?: string
          species?: string | null
          status?: Database["public"]["Enums"]["pet_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          created_at: string
          date_given: string | null
          id: string
          next_due: string | null
          notes: string | null
          pet_id: string
          updated_at: string
          vaccine_type: string
          vet: string | null
        }
        Insert: {
          created_at?: string
          date_given?: string | null
          id?: string
          next_due?: string | null
          notes?: string | null
          pet_id: string
          updated_at?: string
          vaccine_type: string
          vet?: string | null
        }
        Update: {
          created_at?: string
          date_given?: string | null
          id?: string
          next_due?: string | null
          notes?: string | null
          pet_id?: string
          updated_at?: string
          vaccine_type?: string
          vet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_owner_ids: { Args: never; Returns: string[] }
      my_pet_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "owner"
      appt_status:
        | "Scheduled"
        | "Completed"
        | "Missed"
        | "Cancelled"
        | "Requested"
      appt_type: "scheduled" | "walk_in" | "request"
      item_category: "vaccine" | "medication" | "dewormer" | "supply"
      pet_status: "available" | "deceased"
      txn_type: "in" | "out"
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
      app_role: ["admin", "owner"],
      appt_status: [
        "Scheduled",
        "Completed",
        "Missed",
        "Cancelled",
        "Requested",
      ],
      appt_type: ["scheduled", "walk_in", "request"],
      item_category: ["vaccine", "medication", "dewormer", "supply"],
      pet_status: ["available", "deceased"],
      txn_type: ["in", "out"],
    },
  },
} as const
