import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type-safe database queries
export type Database = {
  public: {
    Tables: {
      investigation_cases: {
        Row: {
          id: string
          title: string
          category: string
          status: 'Active' | 'Suspended' | 'Closed'
          priority: 'Critical' | 'High' | 'Medium' | 'Low'
          lead: string
          team: string[]
          created_at: string
          updated_at: string
          summary: string
        }
        Insert: Omit<Database['public']['Tables']['investigation_cases']['Row'], 'created_date' | 'updated_date'>
      }
    }
  }
}