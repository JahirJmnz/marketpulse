import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Verificar que las variables de entorno estén configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Por favor, configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local'
  )
}

/**
 * Cliente de Supabase para uso en el cliente (browser)
 * Usa la Anon Key que es segura para exponer públicamente
 */
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Cliente de Supabase para uso en el servidor (API routes)
 * Usa la Service Role Key que tiene permisos elevados
 * ⚠️ NUNCA exponer este cliente al navegador
 */
export function createServerClient() {
  if (!supabaseServiceKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY. Esta clave es necesaria para operaciones del servidor.'
    )
  }
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}


