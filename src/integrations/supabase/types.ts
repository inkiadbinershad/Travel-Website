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
      neuro_fractal_sessions: {
        Row: {
          id: string
          user_id: string
          session_name: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          total_messages: number
          average_coherence: number
          average_complexity: number
          average_resonance: number
          adaptation_level: number
        }
        Insert: {
          id?: string
          user_id: string
          session_name?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          total_messages?: number
          average_coherence?: number
          average_complexity?: number
          average_resonance?: number
          adaptation_level?: number
        }
        Update: {
          id?: string
          user_id?: string
          session_name?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          total_messages?: number
          average_coherence?: number
          average_complexity?: number
          average_resonance?: number
          adaptation_level?: number
        }
      }
      neuro_fractal_states: {
        Row: {
          id: string
          session_id: string
          coherence: number
          complexity: number
          resonance: number
          adaptation_level: number
          emotional_stability: number | null
          cognitive_load: number | null
          fractal_dimension: number | null
          quantum_entropy: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          coherence: number
          complexity: number
          resonance: number
          adaptation_level?: number
          emotional_stability?: number | null
          cognitive_load?: number | null
          fractal_dimension?: number | null
          quantum_entropy?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          coherence?: number
          complexity?: number
          resonance?: number
          adaptation_level?: number
          emotional_stability?: number | null
          cognitive_load?: number | null
          fractal_dimension?: number | null
          quantum_entropy?: number | null
          created_at?: string
        }
      }
      neuro_fractal_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          message_type: string
          content: string
          state_id: string | null
          coherence_at_message: number | null
          complexity_at_message: number | null
          resonance_at_message: number | null
          emotional_response: Json | null
          cognitive_patterns: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          message_type: string
          content: string
          state_id?: string | null
          coherence_at_message?: number | null
          complexity_at_message?: number | null
          resonance_at_message?: number | null
          emotional_response?: Json | null
          cognitive_patterns?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          message_type?: string
          content?: string
          state_id?: string | null
          coherence_at_message?: number | null
          complexity_at_message?: number | null
          resonance_at_message?: number | null
          emotional_response?: Json | null
          cognitive_patterns?: Json | null
          created_at?: string
        }
      }
      neuro_fractal_metrics: {
        Row: {
          id: string
          session_id: string | null
          user_id: string
          metric_type: string
          metric_value: number | null
          metric_metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          user_id: string
          metric_type: string
          metric_value?: number | null
          metric_metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          user_id?: string
          metric_type?: string
          metric_value?: number | null
          metric_metadata?: Json | null
          created_at?: string
        }
      }
      neuro_fractal_adaptations: {
        Row: {
          id: string
          user_id: string
          adaptation_type: string
          adaptation_data: Json
          effectiveness_score: number | null
          applied_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          adaptation_type: string
          adaptation_data: Json
          effectiveness_score?: number | null
          applied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          adaptation_type?: string
          adaptation_data?: Json
          effectiveness_score?: number | null
          applied_at?: string | null
          created_at?: string
        }
      }
      neuro_fractal_learning_patterns: {
        Row: {
          id: string
          pattern_type: string
          pattern_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          pattern_type: string
          pattern_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          pattern_type?: string
          pattern_data?: Json
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
