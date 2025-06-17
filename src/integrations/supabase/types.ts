export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_activities: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          target_developer_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          target_developer_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_developer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_activities_target_developer_id_fkey"
            columns: ["target_developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          contribution_type: string
          created_at: string
          developer_id: string | null
          id: string
          metadata: Json | null
          platform: string
          score_impact: number | null
          verified: boolean | null
        }
        Insert: {
          contribution_type: string
          created_at?: string
          developer_id?: string | null
          id?: string
          metadata?: Json | null
          platform: string
          score_impact?: number | null
          verified?: boolean | null
        }
        Update: {
          contribution_type?: string
          created_at?: string
          developer_id?: string | null
          id?: string
          metadata?: Json | null
          platform?: string
          score_impact?: number | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          builder_score: number | null
          created_at: string
          farcaster_username: string | null
          github_username: string
          id: string
          reputation_score: number | null
          total_grants_received: number | null
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          builder_score?: number | null
          created_at?: string
          farcaster_username?: string | null
          github_username: string
          id?: string
          reputation_score?: number | null
          total_grants_received?: number | null
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          builder_score?: number | null
          created_at?: string
          farcaster_username?: string | null
          github_username?: string
          id?: string
          reputation_score?: number | null
          total_grants_received?: number | null
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      fund_pools: {
        Row: {
          available_amount: number
          created_at: string
          created_by: string | null
          id: string
          name: string
          total_amount: number
        }
        Insert: {
          available_amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          total_amount: number
        }
        Update: {
          available_amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          total_amount?: number
        }
        Relationships: []
      }
      funding_transactions: {
        Row: {
          amount_crypto: number
          amount_usd: number
          completed_at: string | null
          created_at: string
          currency: string
          funder_wallet_address: string
          grant_id: string | null
          id: string
          milestone_id: string | null
          recipient_wallet_address: string
          status: string | null
          transaction_hash: string | null
        }
        Insert: {
          amount_crypto: number
          amount_usd: number
          completed_at?: string | null
          created_at?: string
          currency: string
          funder_wallet_address: string
          grant_id?: string | null
          id?: string
          milestone_id?: string | null
          recipient_wallet_address: string
          status?: string | null
          transaction_hash?: string | null
        }
        Update: {
          amount_crypto?: number
          amount_usd?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          funder_wallet_address?: string
          grant_id?: string | null
          id?: string
          milestone_id?: string | null
          recipient_wallet_address?: string
          status?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_transactions_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      github_commits: {
        Row: {
          additions: number | null
          author_email: string | null
          author_name: string | null
          created_at: string
          deletions: number | null
          id: string
          message: string | null
          repository_id: string | null
          sha: string
          timestamp: string | null
        }
        Insert: {
          additions?: number | null
          author_email?: string | null
          author_name?: string | null
          created_at?: string
          deletions?: number | null
          id?: string
          message?: string | null
          repository_id?: string | null
          sha: string
          timestamp?: string | null
        }
        Update: {
          additions?: number | null
          author_email?: string | null
          author_name?: string | null
          created_at?: string
          deletions?: number | null
          id?: string
          message?: string | null
          repository_id?: string | null
          sha?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "github_commits_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "github_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      github_repositories: {
        Row: {
          archived: boolean | null
          clone_url: string
          created_at: string
          default_branch: string | null
          description: string | null
          developer_id: string | null
          disabled: boolean | null
          forks_count: number | null
          full_name: string
          github_repo_id: number
          html_url: string
          id: string
          is_fork: boolean | null
          is_private: boolean | null
          language: string | null
          name: string
          open_issues_count: number | null
          pushed_at: string | null
          size: number | null
          stars_count: number | null
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          clone_url: string
          created_at?: string
          default_branch?: string | null
          description?: string | null
          developer_id?: string | null
          disabled?: boolean | null
          forks_count?: number | null
          full_name: string
          github_repo_id: number
          html_url: string
          id?: string
          is_fork?: boolean | null
          is_private?: boolean | null
          language?: string | null
          name: string
          open_issues_count?: number | null
          pushed_at?: string | null
          size?: number | null
          stars_count?: number | null
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          clone_url?: string
          created_at?: string
          default_branch?: string | null
          description?: string | null
          developer_id?: string | null
          disabled?: boolean | null
          forks_count?: number | null
          full_name?: string
          github_repo_id?: number
          html_url?: string
          id?: string
          is_fork?: boolean | null
          is_private?: boolean | null
          language?: string | null
          name?: string
          open_issues_count?: number | null
          pushed_at?: string | null
          size?: number | null
          stars_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_repositories_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          developer_id: string | null
          id: string
          milestone_based: boolean | null
          status: string | null
          stream_duration_days: number | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          developer_id?: string | null
          id?: string
          milestone_based?: boolean | null
          status?: string | null
          stream_duration_days?: number | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          developer_id?: string | null
          id?: string
          milestone_based?: boolean | null
          status?: string | null
          stream_duration_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grants_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_connections: {
        Row: {
          address: string
          connected_at: string
          developer_id: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          metadata: Json | null
          wallet_type: string
        }
        Insert: {
          address: string
          connected_at?: string
          developer_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          wallet_type?: string
        }
        Update: {
          address?: string
          connected_at?: string
          developer_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_connections_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
