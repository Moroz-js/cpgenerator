// Supabase Database Types
// This file can be auto-generated using: npx supabase gen types typescript --local

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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          workspace_id: string
          email: string
          token: string
          invited_by: string
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          token: string
          invited_by: string
          status?: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          token?: string
          invited_by?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          workspace_id: string
          title: string
          description: string | null
          technologies: Json
          results: string | null
          images: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          description?: string | null
          technologies?: Json
          results?: string | null
          images?: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          description?: string | null
          technologies?: Json
          results?: string | null
          images?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          workspace_id: string
          title: string
          client_name: string | null
          status: string
          timeline: Json | null
          team_estimate: Json | null
          selected_cases: Json
          contacts: Json | null
          processes: string | null
          tech_stack: Json
          faq: Json
          payment_schedule: Json
          loom_videos: Json
          created_by: string
          created_at: string
          updated_at: string
          last_autosave: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          client_name?: string | null
          status?: string
          timeline?: Json | null
          team_estimate?: Json | null
          selected_cases?: Json
          contacts?: Json | null
          processes?: string | null
          tech_stack?: Json
          faq?: Json
          payment_schedule?: Json
          loom_videos?: Json
          created_by: string
          created_at?: string
          updated_at?: string
          last_autosave?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          client_name?: string | null
          status?: string
          timeline?: Json | null
          team_estimate?: Json | null
          selected_cases?: Json
          contacts?: Json | null
          processes?: string | null
          tech_stack?: Json
          faq?: Json
          payment_schedule?: Json
          loom_videos?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
          last_autosave?: string | null
        }
      }
      proposal_sections: {
        Row: {
          id: string
          proposal_id: string
          section_type: string
          content: Json
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          section_type: string
          content: Json
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          section_type?: string
          content?: Json
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      preview_attachments: {
        Row: {
          id: string
          section_id: string
          text_reference: string
          attachment_type: string
          attachment_url: string
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          text_reference: string
          attachment_type: string
          attachment_url: string
          created_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          text_reference?: string
          attachment_type?: string
          attachment_url?: string
          created_at?: string
        }
      }
      public_links: {
        Row: {
          id: string
          proposal_id: string
          slug: string
          is_active: boolean
          created_by: string
          created_at: string
          deactivated_at: string | null
        }
        Insert: {
          id?: string
          proposal_id: string
          slug: string
          is_active?: boolean
          created_by: string
          created_at?: string
          deactivated_at?: string | null
        }
        Update: {
          id?: string
          proposal_id?: string
          slug?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
          deactivated_at?: string | null
        }
      }
      templates: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          timeline: Json | null
          team_estimate: Json | null
          contacts: Json | null
          processes: string | null
          tech_stack: Json
          faq: Json
          payment_schedule: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          timeline?: Json | null
          team_estimate?: Json | null
          contacts?: Json | null
          processes?: string | null
          tech_stack?: Json
          faq?: Json
          payment_schedule?: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          timeline?: Json | null
          team_estimate?: Json | null
          contacts?: Json | null
          processes?: string | null
          tech_stack?: Json
          faq?: Json
          payment_schedule?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      template_sections: {
        Row: {
          id: string
          template_id: string
          section_type: string
          content: Json
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          section_type: string
          content: Json
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          section_type?: string
          content?: Json
          order_index?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          section_id: string
          parent_id: string | null
          author_id: string
          content: string
          is_resolved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          parent_id?: string | null
          author_id: string
          content: string
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          parent_id?: string | null
          author_id?: string
          content?: string
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      presence: {
        Row: {
          id: string
          proposal_id: string
          user_id: string
          section_id: string | null
          last_seen: string
        }
        Insert: {
          id?: string
          proposal_id: string
          user_id: string
          section_id?: string | null
          last_seen?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          user_id?: string
          section_id?: string | null
          last_seen?: string
        }
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
  }
}
