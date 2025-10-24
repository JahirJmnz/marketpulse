import { getTavilyClient } from './tavily'
import { deduplicateResults, sortByDate, filterByScore, formatForAI } from './utils'
import type { Competitor } from '@/types/ai'

export interface CompetitorResearch {
  competitor: Competitor
  news: Array<{
    title: string
    snippet: string
    url: string
    published_date: string
  }>
  hasActivity: boolean
}

/**
 * Investiga un competidor específico usando Tavily
 */
export async function researchCompetitor(
  competitor: Competitor,
  options: {
    days?: number
    maxResults?: number
  } = {}
): Promise<CompetitorResearch> {
  const tavily = getTavilyClient()
  
  try {
    const rawResults = await tavily.searchCompetitor(competitor.name, options)
    
    // Procesar y filtrar resultados
    const processedResults = sortByDate(
      filterByScore(
        deduplicateResults(rawResults),
        0.4 // ⚡ Score mínimo reducido para incluir más resultados
      )
    )
    
    const news = formatForAI(processedResults)
    
    return {
      competitor,
      news,
      hasActivity: news.length > 0
    }
  } catch (error) {
    console.error(`   ❌ Error investigando ${competitor.name}:`, error)
    return {
      competitor,
      news: [],
      hasActivity: false
    }
  }
}

/**
 * Investiga múltiples competidores en paralelo
 */
export async function researchAllCompetitors(
  competitors: Competitor[],
  options?: {
    days?: number
    maxResults?: number
  }
): Promise<CompetitorResearch[]> {
  console.log(`\n🔍 Investigando ${competitors.length} competidores con Tavily...`)
  
  const research = await Promise.all(
    competitors.map(competitor => researchCompetitor(competitor, options))
  )
  
  const withActivity = research.filter(r => r.hasActivity).length
  console.log(`✅ Encontrada actividad en ${withActivity}/${competitors.length} competidores\n`)
  
  return research
}

/**
 * Obtiene un resumen de la investigación
 */
export function getResearchSummary(research: CompetitorResearch[]): {
  totalCompetitors: number
  competitorsWithActivity: number
  totalNews: number
  topCompetitorsByActivity: Array<{ name: string; newsCount: number }>
} {
  const competitorsWithActivity = research.filter(r => r.hasActivity).length
  const totalNews = research.reduce((sum, r) => sum + r.news.length, 0)
  
  const topCompetitorsByActivity = research
    .map(r => ({ name: r.competitor.name, newsCount: r.news.length }))
    .sort((a, b) => b.newsCount - a.newsCount)
    .slice(0, 5)

  return {
    totalCompetitors: research.length,
    competitorsWithActivity,
    totalNews,
    topCompetitorsByActivity
  }
}

