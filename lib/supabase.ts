import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      words: {
        Row: {
          id: string
          user_id: string
          english: string
          russian: string
          created_at: string
          last_reviewed: string | null
          correct_count: number
          incorrect_count: number
          level: number
        }
        Insert: {
          id?: string
          user_id: string
          english: string
          russian: string
          created_at?: string
          last_reviewed?: string | null
          correct_count?: number
          incorrect_count?: number
          level?: number
        }
        Update: {
          id?: string
          user_id?: string
          english?: string
          russian?: string
          created_at?: string
          last_reviewed?: string | null
          correct_count?: number
          incorrect_count?: number
          level?: number
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          streak: number
          last_test_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          streak?: number
          last_test_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          streak?: number
          last_test_date?: string | null
        }
      }
      test_results: {
        Row: {
          id: string
          user_id: string
          date: string
          total_words: number
          correct_answers: number
          incorrect_answers: number
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_words: number
          correct_answers: number
          incorrect_answers: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_words?: number
          correct_answers?: number
          incorrect_answers?: number
        }
      }
    }
  }
}
