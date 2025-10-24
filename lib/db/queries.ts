import { createClient, createServerClient } from './supabase'
import type { Profile, Report, ReportStatus } from '@/types/database'

// ============================================
// PROFILES - Funciones para manejar perfiles
// ============================================

/**
 * Crea un nuevo perfil de empresa
 * @param data - Datos del perfil (nombre y descripción)
 * @returns El perfil creado
 */
export async function createProfile(data: {
  company_name: string
  company_description: string
}): Promise<Profile> {
  const supabase = createServerClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert(data)
    .select()
    .single()
  
  if (error) {
    console.error('Error creando perfil:', error)
    throw new Error('No se pudo crear el perfil')
  }
  
  return profile
}

/**
 * Obtiene un perfil por su ID
 * @param id - UUID del perfil
 * @returns El perfil o null si no existe
 */
export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error obteniendo perfil:', error)
    return null
  }
  
  return data
}

/**
 * Actualiza un perfil existente
 * @param id - UUID del perfil
 * @param data - Datos a actualizar
 * @returns El perfil actualizado
 */
export async function updateProfile(
  id: string,
  data: Partial<Pick<Profile, 'company_name' | 'company_description'>>
): Promise<Profile> {
  const supabase = createServerClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error actualizando perfil:', error)
    throw new Error('No se pudo actualizar el perfil')
  }
  
  return profile
}

// ============================================
// REPORTS - Funciones para manejar reportes
// ============================================

/**
 * Crea un nuevo reporte asociado a un perfil
 * @param profileId - UUID del perfil
 * @returns El reporte creado con status PENDING
 */
export async function createReport(profileId: string): Promise<Report> {
  const supabase = createServerClient()
  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      profile_id: profileId,
      status: 'PENDING',
      content: null,
      error_message: null,
      completed_at: null,
      metadata: {}
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creando reporte:', error)
    throw new Error('No se pudo crear el reporte')
  }
  
  return report
}

/**
 * Actualiza el estado y contenido de un reporte
 * @param reportId - UUID del reporte
 * @param status - Nuevo estado del reporte
 * @param content - Contenido del reporte (opcional)
 * @param errorMessage - Mensaje de error (opcional)
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  content?: string,
  errorMessage?: string
): Promise<void> {
  const supabase = createServerClient()
  
  const updates: any = { status }
  
  if (content !== undefined) {
    updates.content = content
  }
  
  if (errorMessage !== undefined) {
    updates.error_message = errorMessage
  }
  
  // Si el reporte se completó o falló, marcar la fecha
  if (status === 'COMPLETED' || status === 'FAILED') {
    updates.completed_at = new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
  
  if (error) {
    console.error('Error actualizando reporte:', error)
    throw new Error('No se pudo actualizar el reporte')
  }
}

/**
 * Obtiene un reporte por su ID
 * @param id - UUID del reporte
 * @returns El reporte o null si no existe
 */
export async function getReport(id: string): Promise<Report | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reports')
    .select()
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error obteniendo reporte:', error)
    return null
  }
  
  return data
}

/**
 * Obtiene todos los reportes de un perfil, ordenados por fecha
 * @param profileId - UUID del perfil
 * @param limit - Número máximo de reportes a retornar (default: 10)
 * @returns Lista de reportes
 */
export async function getReportsByProfile(
  profileId: string,
  limit = 10
): Promise<Report[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reports')
    .select()
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error obteniendo reportes:', error)
    throw new Error('No se pudieron cargar los reportes')
  }
  
  return data || []
}

/**
 * Obtiene el último reporte de un perfil
 * @param profileId - UUID del perfil
 * @returns El último reporte o null si no hay reportes
 */
export async function getLatestReport(profileId: string): Promise<Report | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reports')
    .select()
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error obteniendo último reporte:', error)
    return null
  }
  
  return data
}

/**
 * Actualiza los metadatos de un reporte
 * @param reportId - UUID del reporte
 * @param metadata - Objeto con metadatos adicionales
 */
export async function updateReportMetadata(
  reportId: string,
  metadata: Record<string, any>
): Promise<void> {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('reports')
    .update({ metadata })
    .eq('id', reportId)
  
  if (error) {
    console.error('Error actualizando metadatos del reporte:', error)
    throw new Error('No se pudieron actualizar los metadatos')
  }
}


