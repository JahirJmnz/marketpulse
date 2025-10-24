import { generateWithSaptiva, generateJSON } from './saptiva'
import {
  createCompetitorIdentificationPrompt,
  createNewsAnalysisPrompt,
  createReportGenerationPrompt,
  SYSTEM_PROMPT
} from './prompts'
import { researchAllCompetitors } from '../search/competitor-research'
import type { Profile } from '@/types/database'
import type { 
  Competitor, 
  CompetitorAnalysis, 
  CompetitorIdentificationResult,
  CompetitorNews
} from '@/types/ai'

/**
 * Identifica competidores basándose en el perfil de la empresa
 * Usa el modelo rápido (Saptiva Turbo) para extracción eficiente
 */
export async function identifyCompetitors(
  profile: Profile
): Promise<Competitor[]> {
  console.log(`🔍 Identificando competidores para ${profile.company_name}...`)
  
  const prompt = createCompetitorIdentificationPrompt(profile)
  
  try {
    const result = await generateJSON<CompetitorIdentificationResult>(
      prompt,
      {
        model: 'fast',  // ⚡ Volver a Saptiva Turbo
        temperature: 0.2,  // Más determinístico
        maxTokens: 1500,  // Reducir para forzar respuestas concisas
        systemPrompt: '' // Sin system prompt para reducir tokens
      }
    )
    
    console.log(`✅ Identificados ${result.competitors.length} competidores`)
    return result.competitors
  } catch (error) {
    console.error('❌ Error identificando competidores:', error)
    throw new Error('No se pudieron identificar competidores')
  }
}

/**
 * Analiza noticias de un competidor específico
 * Usa el modelo de razonamiento (Saptiva Cortex) para análisis profundo
 */
export async function analyzeCompetitorNews(
  competitor: Competitor,
  news: CompetitorNews[]
): Promise<CompetitorAnalysis> {
  console.log(`📰 Analizando ${news.length} noticias de ${competitor.name}...`)
  
  // Si no hay noticias, retornar análisis vacío
  if (news.length === 0) {
    return {
      competitor: competitor.name,
      key_movements: [],
      sentiment: 'neutral',
      threat_level: 'low',
      summary: 'No se encontró actividad reciente para este competidor.'
    }
  }

  const prompt = createNewsAnalysisPrompt(competitor, news)
  
  try {
    const analysis = await generateJSON<CompetitorAnalysis>(
      prompt,
      {
        model: 'reasoning',  // Usar Saptiva Cortex para análisis profundo
        temperature: 0.4,
        maxTokens: 3000,  // ⚡ Suficiente para análisis detallado
        systemPrompt: SYSTEM_PROMPT
      }
    )
    
    console.log(`✅ Análisis completado para ${competitor.name}`)
    
    return {
      ...analysis,
      competitor: competitor.name
    }
  } catch (error) {
    console.error(`❌ Error analizando noticias de ${competitor.name}:`, error)
    
    // Retornar análisis básico en caso de error
    return {
      competitor: competitor.name,
      key_movements: [],
      sentiment: 'neutral',
      threat_level: 'low',
      summary: `Error al analizar noticias de ${competitor.name}. Por favor, intenta nuevamente.`
    }
  }
}

/**
 * Genera reporte ejecutivo completo
 * Usa el modelo avanzado (Saptiva Legacy) para reportes de calidad
 */
export async function generateExecutiveReport(
  profile: Profile,
  competitorAnalyses: Array<{
    competitor: Competitor
    analysis: CompetitorAnalysis
    news: any[]
  }>
): Promise<string> {
  console.log(`📝 Generando reporte ejecutivo para ${profile.company_name}...`)
  
  // Filtrar solo análisis con contenido relevante
  const relevantAnalyses = competitorAnalyses.filter(
    item => item.analysis.key_movements.length > 0 || 
            item.analysis.summary !== 'No se encontró actividad reciente para este competidor.'
  )
  
  if (relevantAnalyses.length === 0) {
    return `# Reporte de Inteligencia Competitiva

## 📊 Resumen Ejecutivo

No se encontró actividad reciente significativa de los competidores analizados en los últimos días.

Se recomienda:
1. Ampliar el rango de fechas de búsqueda
2. Agregar más competidores al análisis
3. Revisar fuentes de información alternativas

**Fecha:** ${new Date().toLocaleDateString('es-ES', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
`
  }
  
  const prompt = createReportGenerationPrompt(profile, relevantAnalyses)
  
  try {
    const report = await generateWithSaptiva(
      prompt,
      {
        model: 'advanced',  // Usar Saptiva Legacy para reportes ejecutivos
        temperature: 0.6,
        maxTokens: 4000,
        systemPrompt: SYSTEM_PROMPT
      }
    )
    
    console.log(`✅ Reporte generado exitosamente`)
    
    // Agregar metadata al final del reporte
    const metadata = `\n\n---\n\n**Generado por:** MarketPulse AI  
**Fecha:** ${new Date().toLocaleDateString('es-ES', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}  
**Empresa:** ${profile.company_name}  
**Competidores analizados:** ${relevantAnalyses.length}
`
    
    return report + metadata
  } catch (error) {
    console.error('❌ Error generando reporte:', error)
    throw new Error('No se pudo generar el reporte ejecutivo')
  }
}

/**
 * Función auxiliar para testear la conexión con Saptiva
 */
export async function testSaptivaConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing conexión con Saptiva...')
    
    const result = await generateWithSaptiva(
      '¿Cuál es la capital de Francia? Responde solo con el nombre de la ciudad.',
      {
        model: 'fast',
        temperature: 0.1,
        maxTokens: 10,
      }
    )
    
    console.log('✅ Conexión exitosa. Respuesta:', result)
    return true
  } catch (error) {
    console.error('❌ Error en conexión con Saptiva:', error)
    return false
  }
}

