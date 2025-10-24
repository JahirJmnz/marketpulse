# F005 - Integración con Tavily Search

**Estado:** 🔴 Pendiente  
**Prioridad:** 🔥 Alta  
**Dependencias:** Ninguna  
**Estimación:** 1 día

---

## 📋 Descripción

Integración con Tavily API para realizar búsquedas web inteligentes sobre competidores. Tavily proporciona resultados de búsqueda optimizados para IA, con contenido estructurado y relevante sobre noticias y actualizaciones de empresas.

---

## 🎯 Objetivos

- Configurar cliente de Tavily API
- Buscar información sobre competidores específicos
- Filtrar resultados por fecha (últimas 24-48 horas)
- Obtener noticias relevantes y estructuradas
- Manejar rate limits y errores

---

## 🔍 Capacidades de Tavily

### Endpoints Principales

- **`/search`**: Búsqueda general web
- **`/extract`**: Extracción de contenido de URLs

### Parámetros de Búsqueda

```typescript
interface TavilySearchParams {
  query: string                    // Query de búsqueda
  search_depth?: 'basic' | 'advanced'  // Profundidad
  include_answer?: boolean         // Incluir respuesta generada
  include_raw_content?: boolean    // Incluir contenido completo
  max_results?: number             // Máximo de resultados (1-20)
  include_domains?: string[]       // Dominios a incluir
  exclude_domains?: string[]       // Dominios a excluir
  include_images?: boolean         // Incluir imágenes
  days?: number                    // Filtrar por días atrás
}
```

---

## 🏗️ Implementación Técnica

### Cliente de Tavily

#### `lib/search/tavily.ts`
```typescript
interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  published_date?: string
}

interface TavilyResponse {
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
      throw new Error('TAVILY_API_KEY no está configurado')
    }
  }

  /**
   * Realiza una búsqueda web
   */
  async search(params: TavilySearchParams): Promise<TavilyResponse> {
    try {
      const response = await fetch(`${this.baseURL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Tavily API error: ${error.message || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error en búsqueda de Tavily:', error)
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
      days = 7,
      maxResults = 10,
      includeDomains = [
        'techcrunch.com',
        'forbes.com',
        'bloomberg.com',
        'reuters.com',
        'theverge.com',
        'wsj.com',
        'ft.com'
      ]
    } = options

    const query = `${competitorName} news updates announcements -jobs -careers`

    const response = await this.search({
      query,
      search_depth: 'advanced',
      include_answer: false,
      include_raw_content: false,
      max_results: maxResults,
      include_domains: includeDomains,
      days
    })

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
    const results = new Map<string, TavilySearchResult[]>()

    // Usar Promise.all para búsquedas paralelas
    const searches = competitors.map(async (competitor) => {
      try {
        const competitorResults = await this.searchCompetitor(competitor, options)
        return { competitor, results: competitorResults }
      } catch (error) {
        console.error(`Error buscando ${competitor}:`, error)
        return { competitor, results: [] }
      }
    })

    const allResults = await Promise.all(searches)
    
    allResults.forEach(({ competitor, results: competitorResults }) => {
      results.set(competitor, competitorResults)
    })

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

    const response = await this.search({
      query,
      search_depth: 'advanced',
      include_answer: true,
      max_results: maxResults,
      days
    })

    return response.results
  }
}

// Instancia singleton
let tavilyClient: TavilyClient | null = null

export function getTavilyClient(): TavilyClient {
  if (!tavilyClient) {
    tavilyClient = new TavilyClient()
  }
  return tavilyClient
}
```

### Funciones de Utilidad

#### `lib/search/utils.ts`
```typescript
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
 * Filtra resultados por score mínimo
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
    snippet: result.content.slice(0, 300) + '...',
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
      const domain = new URL(result.url).hostname
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
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])
  
  results.forEach(result => {
    const text = `${result.title} ${result.content}`.toLowerCase()
    const words = text.match(/\b\w{4,}\b/g) || []
    
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
```

### Integración con Sistema de Reportes

#### `lib/search/competitor-research.ts`
```typescript
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
 * Investiga un competidor específico
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
        0.6 // Score mínimo de relevancia
      )
    )
    
    const news = formatForAI(processedResults)
    
    return {
      competitor,
      news,
      hasActivity: news.length > 0
    }
  } catch (error) {
    console.error(`Error investigando ${competitor.name}:`, error)
    return {
      competitor,
      news: [],
      hasActivity: false
    }
  }
}

/**
 * Investiga múltiples competidores
 */
export async function researchAllCompetitors(
  competitors: Competitor[],
  options?: {
    days?: number
    maxResults?: number
  }
): Promise<CompetitorResearch[]> {
  console.log(`🔍 Investigando ${competitors.length} competidores...`)
  
  const research = await Promise.all(
    competitors.map(competitor => researchCompetitor(competitor, options))
  )
  
  const withActivity = research.filter(r => r.hasActivity).length
  console.log(`✅ Encontrada actividad en ${withActivity}/${competitors.length} competidores`)
  
  return research
}
```

---

## 📦 Dependencias

No requiere instalación de paquetes adicionales, solo `fetch` nativo.

### Variables de Entorno

```bash
# .env.local
TAVILY_API_KEY=your_tavily_api_key_here
```

---

## 🧪 Testing

### Script de Testing

#### `scripts/test-tavily.ts`
```typescript
import { getTavilyClient } from '@/lib/search/tavily'
import { researchCompetitor } from '@/lib/search/competitor-research'
import type { Competitor } from '@/types/ai'

async function testTavilyIntegration() {
  console.log('🧪 Testing Tavily Integration...\n')

  const tavily = getTavilyClient()

  // Test 1: Búsqueda básica
  console.log('1️⃣ Búsqueda básica...')
  const basicResults = await tavily.search({
    query: 'Asana project management news',
    max_results: 5,
    days: 7
  })
  console.log(`✅ Encontrados ${basicResults.results.length} resultados`)
  console.log()

  // Test 2: Búsqueda de competidor
  console.log('2️⃣ Búsqueda de competidor...')
  const competitorResults = await tavily.searchCompetitor('Asana', {
    days: 7,
    maxResults: 10
  })
  console.log(`✅ Encontradas ${competitorResults.length} noticias sobre Asana`)
  competitorResults.slice(0, 3).forEach(r => {
    console.log(`   - ${r.title}`)
  })
  console.log()

  // Test 3: Investigación completa
  console.log('3️⃣ Investigación completa...')
  const testCompetitor: Competitor = {
    name: 'Asana',
    type: 'direct',
    reason: 'Competidor directo en gestión de proyectos',
    website: 'https://asana.com'
  }
  
  const research = await researchCompetitor(testCompetitor, {
    days: 7,
    maxResults: 10
  })
  
  console.log(`✅ Investigación completada:`)
  console.log(`   Noticias encontradas: ${research.news.length}`)
  console.log(`   Tiene actividad: ${research.hasActivity}`)
  console.log()

  console.log('✅ Todas las pruebas pasaron!')
}

testTavilyIntegration().catch(console.error)
```

---

## 📊 Límites y Consideraciones

### Rate Limits de Tavily

| Plan | Requests/mes | Requests/min |
|------|--------------|--------------|
| Free | 1,000 | 5 |
| Basic | 10,000 | 20 |
| Pro | 100,000 | 50 |

### Estrategias de Optimización

1. **Caché de Resultados**
   - Guardar resultados por 24h
   - Evitar búsquedas duplicadas

2. **Batch Requests**
   - Agrupar búsquedas cuando sea posible
   - Usar Promise.all con límite de concurrencia

3. **Retry Logic**
   - Implementar reintentos con backoff exponencial
   - Manejar rate limits gracefully

4. **Filtrado Inteligente**
   - Usar dominios específicos
   - Filtrar por score de relevancia
   - Limitar resultados según necesidad

---

## 🔒 Manejo de Errores

```typescript
export class TavilyError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'TavilyError'
  }
}

export async function safeSearch(
  searchFn: () => Promise<any>,
  retries: number = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await searchFn()
    } catch (error) {
      if (i === retries - 1) throw error
      
      // Backoff exponencial
      const delay = Math.pow(2, i) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

---

## ✅ Checklist de Implementación

- [ ] Obtener API key de Tavily
- [ ] Configurar variables de entorno
- [ ] Crear cliente de Tavily
- [ ] Implementar funciones de búsqueda
- [ ] Crear funciones de utilidad
- [ ] Implementar manejo de errores
- [ ] Implementar retry logic
- [ ] Testing con datos reales
- [ ] Documentar límites y uso
- [ ] Optimizar para costos

---

## 🔗 Recursos

- [Tavily API Docs](https://docs.tavily.com/)
- [Tavily Playground](https://app.tavily.com/)
- [API Reference](https://docs.tavily.com/api-reference)

