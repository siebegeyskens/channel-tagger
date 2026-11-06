export type Database = {
  public: {
    Tables: {
      tags: {
        Row: { id: string; user_id: string; name: string; color: string; created_at: string }
        Insert: { id?: string; user_id?: string; name: string; color: string; created_at?: string }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      channel_tags: {
        Row: { user_id: string; channel_id: string; tag_id: string; created_at: string }
        Insert: { user_id?: string; channel_id: string; tag_id: string; created_at?: string }
        Update: { user_id?: string; channel_id?: string; tag_id?: string; created_at?: string }
        Relationships: []
      }
      google_tokens: {
        Row: { user_id: string; refresh_token: string; updated_at: string }
        Insert: { user_id: string; refresh_token: string; updated_at?: string }
        Update: { user_id?: string; refresh_token?: string; updated_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
