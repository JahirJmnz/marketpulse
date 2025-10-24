/**
 * Generador de reportes de inteligencia competitiva
 * Orquesta el flujo completo: identificación → búsqueda → análisis → reporte
 */

import { getProfile, updateReportStatus } from '../db/queries'
import { generateCompetitiveReport } from '../ai/orchestrator'

/**
 * Genera un reporte completo en background
 * Se ejecuta de forma asíncrona sin bloquear la respuesta HTTP
 */
export async function generateReportInBackground(
  reportId: string,
  profileId: string
): Promise<void> {
  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Iniciando generación de reporte ${reportId}`)
    console.log(`${'='.repeat(60)}\n`)

    // Marcar como procesando
    await updateReportStatus(reportId, 'PROCESSING')

    // Paso 1: Obtener perfil de la empresa
    console.log('📍 PASO 1/4: Obteniendo perfil de empresa...')
    const profile = await getProfile(profileId)
    
    if (!profile) {
      throw new Error('Perfil no encontrado')
    }
    console.log(`✅ Perfil: ${profile.company_name}\n`)

    // Paso 2-4: Generar reporte usando el orquestador
    console.log('📍 PASOS 2-4: Generando reporte con IA...')
    const result = await generateCompetitiveReport(profile, {
      days: 30,  // ⚡ Usar 30 días para más resultados
      maxResults: 10
    })

    if (!result.success || !result.report) {
      throw new Error(result.error || 'Error generando reporte')
    }

    // Guardar reporte completado
    await updateReportStatus(reportId, 'COMPLETED', result.report)

    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ Reporte ${reportId} completado exitosamente`)
    console.log(`   Duración: ${(result.metrics.durationMs / 1000).toFixed(2)}s`)
    console.log(`   Competidores: ${result.metrics.competitorsIdentified}`)
    console.log(`   Noticias: ${result.metrics.totalNews}`)
    console.log(`${'='.repeat(60)}\n`)

  } catch (error) {
    console.error(`\n❌ Error generando reporte ${reportId}:`, error)
    
    // Guardar error en la base de datos
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    await updateReportStatus(reportId, 'FAILED', undefined, errorMessage)
  }
}

/**
 * Información sobre el progreso estimado
 */
export const GENERATION_STEPS = {
  PROFILE: { step: 1, total: 4, message: 'Obteniendo perfil de empresa', estimated: 1 },
  COMPETITORS: { step: 2, total: 4, message: 'Identificando competidores', estimated: 15 },
  NEWS: { step: 3, total: 4, message: 'Buscando y analizando noticias', estimated: 45 },
  REPORT: { step: 4, total: 4, message: 'Generando reporte ejecutivo', estimated: 15 }
} as const

/**
 * Tiempo estimado total de generación (en segundos)
 */
export const ESTIMATED_GENERATION_TIME = 90 // ~1.5 minutos

