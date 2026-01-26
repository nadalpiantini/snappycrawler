// Supabase-generated types
// Run: supabase gen types typescript --local > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      snappy_profiles: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      snappy_snapshots: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string
          raw_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title: string
          raw_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string
          raw_data?: Json
          created_at?: string
        }
      }
      snappy_normalized_snapshots: {
        Row: {
          id: string
          snapshot_id: string
          normalized_data: Json
          design_analysis: Json | null
          legal_safe: boolean
          created_at: string
        }
        Insert: {
          id?: string
          snapshot_id: string
          normalized_data: Json
          design_analysis?: Json | null
          legal_safe?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          snapshot_id?: string
          normalized_data?: Json
          design_analysis?: Json | null
          legal_safe?: boolean
          created_at?: string
        }
      }
      snappy_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      snappy_project_snapshots: {
        Row: {
          project_id: string
          snapshot_id: string
        }
        Insert: {
          project_id: string
          snapshot_id: string
        }
        Update: {
          project_id?: string
          snapshot_id?: string
        }
      }
    }
  }
}
