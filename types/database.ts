// Tipos para la base de datos de Supabase
export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface Profile {
  id: string
  company_name: string
  company_description: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  profile_id: string
  content: string | null
  status: ReportStatus
  error_message: string | null
  created_at: string
  completed_at: string | null
  metadata: Record<string, any>
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      reports: {
        Row: Report
        Insert: Omit<Report, 'id' | 'created_at'>
        Update: Partial<Omit<Report, 'id' | 'created_at'>>
      }
    }
  }
}


