import type { TavilySearchResult } from './tavily'

/**
 * Filtra resultados duplicados por URL
 */
export function deduplicateResults(
  results: TavilySearchResult[]
): TavilySearchResult[] {
  const seen = new Set<string>()
  return results.filter(result => {
    if (seen.has(result.url)) return false
    seen.add(result.url)
    return true
  })
}

/**
 * Ordena resultados por fecha (más recientes primero)
 */
export function sortByDate(
  results: TavilySearchResult[]
): TavilySearchResult[] {
  return [...results].sort((a, b) => {
    if (!a.published_date || !b.published_date) return 0
    return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
  })
}

/**
 * Filtra resultados por score mínimo de relevancia
 */
export function filterByScore(
  results: TavilySearchResult[],
  minScore: number = 0.5
): TavilySearchResult[] {
  return results.filter(result => result.score >= minScore)
}

/**
 * Formatea resultados para análisis de IA
 */
export function formatForAI(
  results: TavilySearchResult[]
): Array<{
  title: string
  snippet: string
  url: string
  published_date: string
}> {
  return results.map(result => ({
    title: result.title,
    snippet: result.content.slice(0, 300) + (result.content.length > 300 ? '...' : ''),
    url: result.url,
    published_date: result.published_date || 'Fecha desconocida'
  }))
}

/**
 * Agrupa resultados por dominio
 */
export function groupByDomain(
  results: TavilySearchResult[]
): Map<string, TavilySearchResult[]> {
  const groups = new Map<string, TavilySearchResult[]>()
  
  results.forEach(result => {
    try {
      const domain = new URL(result.url).hostname.replace('www.', '')
      if (!groups.has(domain)) {
        groups.set(domain, [])
      }
      groups.get(domain)!.push(result)
    } catch {
      // Ignorar URLs inválidas
    }
  })
  
  return groups
}

/**
 * Extrae keywords más comunes de los resultados
 */
export function extractKeywords(
  results: TavilySearchResult[],
  topN: number = 10
): string[] {
  const wordFreq = new Map<string, number>()
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ])
  
  results.forEach(result => {
    const text = `${result.title} ${result.content}`.toLowerCase()
    const words = text.match(/\b[a-z]{4,}\b/g) || []
    
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
      }
    })
  })
  
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word)
}

/**
 * Calcula estadísticas de los resultados
 */
export function calculateStats(results: TavilySearchResult[]): {
  total: number
  avgScore: number
  topDomains: Array<{ domain: string; count: number }>
  dateRange: { oldest?: string; newest?: string }
} {
  const domainGroups = groupByDomain(results)
  const topDomains = Array.from(domainGroups.entries())
    .map(([domain, items]) => ({ domain, count: items.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const datesWithValues = results
    .filter(r => r.published_date)
    .map(r => new Date(r.published_date!))
    .sort((a, b) => a.getTime() - b.getTime())

  return {
    total: results.length,
    avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length || 0,
    topDomains,
    dateRange: {
      oldest: datesWithValues[0]?.toISOString(),
      newest: datesWithValues[datesWithValues.length - 1]?.toISOString()
    }
  }
}

