/**
 * Orquestador del flujo completo de generación de reportes
 * Combina Saptiva (IA) y Tavily (búsqueda) para análisis de competencia
 */

import { identifyCompetitors, analyzeCompetitorNews, generateExecutiveReport } from './analysis'
import { researchAllCompetitors, getResearchSummary } from '../search/competitor-research'
import type { Profile } from '@/types/database'

export interface ReportGenerationOptions {
  days?: number          // Días atrás para buscar noticias (default: 30)
  maxResults?: number    // Máximo de noticias por competidor (default: 10)
}

export interface ReportGenerationResult {
  success: boolean
  report?: string
  error?: string
  metrics: {
    competitorsIdentified: number
    competitorsWithNews: number
    totalNews: number
    durationMs: number
  }
}

/**
 * Genera un reporte completo de inteligencia competitiva
 * 
 * Flujo:
 * 1. Identificar competidores (Saptiva)
 * 2. Buscar noticias de cada competidor (Tavily)
 * 3. Analizar noticias con IA (Saptiva)
 * 4. Generar reporte ejecutivo (Saptiva)
 */
export async function generateCompetitiveReport(
  profile: Profile,
  options: ReportGenerationOptions = {}
): Promise<ReportGenerationResult> {
  const startTime = Date.now()
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🚀 Generando reporte de inteligencia competitiva`)
  console.log(`   Empresa: ${profile.company_name}`)
  console.log(`${'='.repeat(60)}\n`)
  
  try {
    // Paso 1: Identificar competidores con Saptiva
    console.log('📍 PASO 1: Identificación de Competidores')
    console.log('-'.repeat(60))
    const competitors = await identifyCompetitors(profile)
    console.log(`✅ ${competitors.length} competidores identificados\n`)
    
    // Paso 2: Buscar noticias con Tavily
    console.log('📍 PASO 2: Búsqueda de Noticias')
    console.log('-'.repeat(60))
    const research = await researchAllCompetitors(competitors, {
      days: options.days || 30,  // ⚡ Aumentar a 30 días para más resultados
      maxResults: options.maxResults || 10
    })
    
    const summary = getResearchSummary(research)
    console.log(`📊 Resumen de búsqueda:`)
    console.log(`   - Total de noticias: ${summary.totalNews}`)
    console.log(`   - Competidores con actividad: ${summary.competitorsWithActivity}/${summary.totalCompetitors}`)
    console.log()
    
    // Paso 3: Analizar noticias con Saptiva
    console.log('📍 PASO 3: Análisis de Noticias con IA')
    console.log('-'.repeat(60))
    
    const analyses: Array<{
      competitor: any
      analysis: any
      news: any[]
    }> = []
    
    for (const item of research) {
      if (item.hasActivity) {
        console.log(`   🔬 Analizando ${item.competitor.name}...`)
        
        // Convertir formato de noticias
        const newsForAnalysis: CompetitorNews[] = item.news.map(n => ({
          title: n.title,
          snippet: n.snippet,
          url: n.url,
          published_date: n.published_date
        }))
        
        const analysis = await analyzeCompetitorNews(item.competitor, newsForAnalysis)
        
        analyses.push({
          competitor: item.competitor,
          analysis,
          news: item.news
        })
      }
    }
    
    console.log(`✅ ${analyses.length} competidores analizados\n`)
    
    // Paso 4: Generar reporte ejecutivo
    console.log('📍 PASO 4: Generación de Reporte Ejecutivo')
    console.log('-'.repeat(60))
    const report = await generateExecutiveReport(profile, analyses)
    
    const durationMs = Date.now() - startTime
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ Reporte generado exitosamente`)
    console.log(`   Duración: ${(durationMs / 1000).toFixed(2)}s`)
    console.log(`   Longitud: ${report.length} caracteres`)
    console.log(`${'='.repeat(60)}\n`)
    
    return {
      success: true,
      report,
      metrics: {
        competitorsIdentified: competitors.length,
        competitorsWithNews: summary.competitorsWithActivity,
        totalNews: summary.totalNews,
        durationMs
      }
    }
    
  } catch (error) {
    const durationMs = Date.now() - startTime
    
    console.error(`\n❌ Error generando reporte:`, error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      metrics: {
        competitorsIdentified: 0,
        competitorsWithNews: 0,
        totalNews: 0,
        durationMs
      }
    }
  }
}

