/**
 * Cliente de Tavily Search API
 * Documentación: https://docs.tavily.com/
 */

export interface TavilySearchParams {
  query: string
  search_depth?: 'basic' | 'advanced'
  include_answer?: boolean
  include_raw_content?: boolean
  max_results?: number
  include_domains?: string[]
  exclude_domains?: string[]
  include_images?: boolean
  days?: number
}

export interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  published_date?: string
}

export interface TavilyResponse {
  answer?: string
  results: TavilySearchResult[]
  response_time: number
}

export class TavilyClient {
  private apiKey: string
  private baseURL = 'https://api.tavily.com'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY!
    
    if (!this.apiKey) {
      throw new Error('TAVILY_API_KEY no está configurado en las variables de entorno')
    }
  }

  /**
   * Realiza una búsqueda web usando Tavily
   */
  async search(params: TavilySearchParams): Promise<TavilyResponse> {
    try {
      const response = await fetch(`${this.baseURL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          ...params
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(`Tavily API error: ${error.message || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Error en búsqueda de Tavily:', error)
      throw error
    }
  }

  /**
   * Busca noticias sobre un competidor específico
   */
  async searchCompetitor(
    competitorName: string,
    options: {
      days?: number
      maxResults?: number
      includeDomains?: string[]
    } = {}
  ): Promise<TavilySearchResult[]> {
    const {
      days = 30,  // ⚡ Aumentar días por defecto
      maxResults = 10,
      includeDomains  // ⚡ Sin dominios por defecto para búsquedas más amplias
    } = options

    // Query optimizada para noticias relevantes
    const query = `${competitorName} news updates announcements -jobs -careers`

    console.log(`🔍 Buscando noticias de "${competitorName}" (últimos ${days} días)...`)

    const searchParams: any = {
      query,
      search_depth: 'advanced',
      include_answer: false,
      include_raw_content: false,
      max_results: maxResults,
      days
    }

    // Solo agregar include_domains si se especifica
    if (includeDomains && includeDomains.length > 0) {
      searchParams.include_domains = includeDomains
    }

    const response = await this.search(searchParams)

    console.log(`   📰 Encontrados ${response.results.length} resultados`)

    return response.results
  }

  /**
   * Busca noticias de múltiples competidores en paralelo
   */
  async searchMultipleCompetitors(
    competitors: string[],
    options?: {
      days?: number
      maxResults?: number
    }
  ): Promise<Map<string, TavilySearchResult[]>> {
    console.log(`🔍 Buscando noticias de ${competitors.length} competidores...`)
    
    const results = new Map<string, TavilySearchResult[]>()

    // Ejecutar búsquedas en paralelo (con rate limiting implícito)
    const searches = competitors.map(async (competitor) => {
      try {
        const competitorResults = await this.searchCompetitor(competitor, options)
        return { competitor, results: competitorResults }
      } catch (error) {
        console.error(`   ❌ Error buscando ${competitor}:`, error)
        return { competitor, results: [] }
      }
    })

    const allResults = await Promise.all(searches)
    
    allResults.forEach(({ competitor, results: competitorResults }) => {
      results.set(competitor, competitorResults)
    })

    const totalResults = Array.from(results.values()).reduce((sum, r) => sum + r.length, 0)
    console.log(`✅ Total: ${totalResults} noticias encontradas`)

    return results
  }

  /**
   * Busca tendencias del mercado
   */
  async searchMarketTrends(
    industry: string,
    keywords: string[],
    options: {
      days?: number
      maxResults?: number
    } = {}
  ): Promise<TavilySearchResult[]> {
    const { days = 7, maxResults = 15 } = options

    const query = `${industry} ${keywords.join(' ')} trends market analysis latest`

    console.log(`📊 Buscando tendencias de mercado en "${industry}"...`)

    const response = await this.search({
      query,
      search_depth: 'advanced',
      include_answer: true,
      max_results: maxResults,
      days
    })

    console.log(`   ✅ Encontrados ${response.results.length} artículos sobre tendencias`)

    return response.results
  }

  /**
   * Prueba de conectividad con Tavily
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing conexión con Tavily...')
      
      const response = await this.search({
        query: 'test',
        max_results: 1
      })
      
      console.log('✅ Conexión exitosa con Tavily')
      return true
    } catch (error) {
      console.error('❌ Error en conexión con Tavily:', error)
      return false
    }
  }
}

// Cliente singleton (inicialización lazy)
let tavilyClient: TavilyClient | null = null

export function getTavilyClient(): TavilyClient {
  if (!tavilyClient) {
    tavilyClient = new TavilyClient()
  }
  return tavilyClient
}

