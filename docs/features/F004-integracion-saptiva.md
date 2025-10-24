# F004 - Integración con Saptiva AI

**Estado:** 🔴 Pendiente  
**Prioridad:** 🔥 Alta  
**Dependencias:** F002 (Base de Datos)  
**Estimación:** 1.5 días

---

## 📋 Descripción

Integración con Saptiva AI para proporcionar capacidades de razonamiento e inteligencia artificial. Saptiva actúa como el cerebro del sistema, analizando información de competidores y generando insights accionables.

---

## 🎯 Objetivos

- Configurar cliente de Saptiva usando Vercel AI SDK
- Implementar funciones de análisis de IA
- Crear sistema de prompts estructurado
- Manejar diferentes modelos según la tarea
- Optimizar costos y rendimiento

---

## 🤖 Modelos Recomendados

**Documentación oficial:** https://saptiva.gitbook.io/saptiva-docs/basicos/modelos-disponibles

### Por Caso de Uso

| Tarea | Modelo | Precio (IN/OUT por M tokens) | Razón |
|-------|--------|------------------------------|-------|
| Identificación de competidores | `Saptiva Turbo` | $0.2 / $0.6 | Rápido, bajo costo, efectivo para extracción |
| Análisis de tendencias | `Saptiva Cortex` | $0.30 / $0.8 | Razonamiento profundo, análisis complejo |
| Generación de reportes | `Saptiva Legacy` | $0.2 / $0.6 | Contexto largo, mejor para reportes ejecutivos |
| Análisis muy complejos | `grok3` | $15 / $45 | Razonamiento profundo (solo si necesario) |

---

## 🏗️ Implementación Técnica

### Cliente de Saptiva

#### `lib/ai/saptiva.ts`
```typescript
import { generateText, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Configurar Saptiva como proveedor OpenAI-compatible
// Documentación: https://saptiva.gitbook.io/saptiva-docs
const saptiva = createOpenAI({
  apiKey: process.env.SAPTIVA_API_KEY!,
  baseURL: 'https://api.saptiva.com/v1',  // ⚠️ Nota: usar .com, no .ai
})

export const saptivaModels = {
  // Modelos rápidos para tareas simples
  // Saptiva Turbo: Qwen 3:30B - $0.2/$0.6 por millón de tokens
  fast: saptiva('Saptiva Turbo'),
  
  // Modelos para razonamiento y análisis
  // Saptiva Cortex: Qwen 3:30B Think - $0.30/$0.8 por millón de tokens
  reasoning: saptiva('Saptiva Cortex'),
  
  // Modelo avanzado para reportes ejecutivos
  // Saptiva Legacy: LLama 3.3:70B - $0.2/$0.6 por millón de tokens
  advanced: saptiva('Saptiva Legacy'),
  
  // Modelo premium para análisis muy complejos (opcional, más costoso)
  // Grok 3: $15/$45 por millón de tokens
  premium: saptiva('grok3'),
} as const

export type SaptivaModel = keyof typeof saptivaModels

/**
 * Genera texto usando un modelo de Saptiva
 */
export async function generateWithSaptiva(
  prompt: string,
  options: {
    model?: SaptivaModel
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}
) {
  const {
    model = 'fast',
    temperature = 0.7,  // Default recomendado por Saptiva
    maxTokens = 600,    // Default de Saptiva API
    systemPrompt
  } = options

  const messages: any[] = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })

  const result = await generateText({
    model: saptivaModels[model],
    messages,
    temperature,
    maxTokens,
  })

  return result.text
}

/**
 * Genera texto en modo streaming
 */
export async function streamWithSaptiva(
  prompt: string,
  options: {
    model?: SaptivaModel
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}
) {
  const {
    model = 'fast',
    temperature = 0.7,
    maxTokens = 600,
    systemPrompt
  } = options

  const messages: any[] = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })

  const result = await streamText({
    model: saptivaModels[model],
    messages,
    temperature,
    maxTokens,
  })

  return result.toTextStreamResponse()
}

/**
 * Genera y parsea respuesta JSON
 */
export async function generateJSON<T = any>(
  prompt: string,
  options: {
    model?: SaptivaModel
    temperature?: number
    systemPrompt?: string
  } = {}
): Promise<T> {
  const messages: any[] = [
    {
      role: 'system',
      content: `${options.systemPrompt || ''}\n\nResponde ÚNICAMENTE con JSON válido, sin texto adicional.`
    },
    {
      role: 'user',
      content: prompt
    }
  ]

  const result = await generateText({
    model: saptivaModels[options.model || 'fast'],
    messages,
    temperature: options.temperature || 0.3,
  })

  // Extraer JSON del texto (por si viene con markdown)
  const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/) || 
                     result.text.match(/\{[\s\S]*\}/)
  
  if (!jsonMatch) {
    throw new Error('No se pudo extraer JSON de la respuesta')
  }

  const jsonText = jsonMatch[1] || jsonMatch[0]
  return JSON.parse(jsonText)
}
```

### Sistema de Prompts

#### `lib/ai/prompts.ts`
```typescript
import type { Profile } from '@/types/database'
import type { Competitor } from '@/types/ai'

/**
 * Prompt para identificar competidores
 */
export function createCompetitorIdentificationPrompt(profile: Profile): string {
  return `Eres un analista de inteligencia competitiva especializado.

Analiza la siguiente empresa:
- Nombre: ${profile.company_name}
- Descripción: ${profile.company_description}

Identifica los 5-7 competidores más relevantes en su mercado. Considera:
- Competidores directos (mismo producto/servicio)
- Competidores indirectos (solucionan el mismo problema de otra forma)
- Competidores emergentes (startups disruptivas)
- Competidores potenciales (empresas grandes que podrían entrar)

Responde en formato JSON:
{
  "competitors": [
    {
      "name": "Nombre de la empresa",
      "type": "direct|indirect|emerging|potential",
      "reason": "Por qué es relevante como competidor",
      "website": "URL del sitio web si la conoces"
    }
  ]
}`
}

/**
 * Prompt para analizar noticias de competidores
 */
export function createNewsAnalysisPrompt(
  competitor: Competitor,
  news: Array<{ title: string; snippet: string; url: string; published_date: string }>
): string {
  const newsText = news.map((item, idx) => 
    `${idx + 1}. [${item.published_date}] ${item.title}\n   ${item.snippet}\n   URL: ${item.url}`
  ).join('\n\n')

  return `Analiza las siguientes noticias recientes sobre ${competitor.name}:

${newsText}

Identifica:
1. Movimientos estratégicos importantes (lanzamientos, adquisiciones, partnerships)
2. Cambios en la dirección de la empresa
3. Información financiera relevante
4. Amenazas u oportunidades que representan
5. Tendencias o patrones emergentes

Responde en formato JSON:
{
  "key_movements": [
    {
      "type": "launch|acquisition|partnership|financial|strategy",
      "description": "Descripción del movimiento",
      "impact": "high|medium|low",
      "date": "YYYY-MM-DD",
      "source_url": "URL"
    }
  ],
  "sentiment": "positive|neutral|negative",
  "threat_level": "high|medium|low",
  "summary": "Resumen ejecutivo de 2-3 líneas"
}`
}

/**
 * Prompt para generar reporte ejecutivo
 */
export function createReportGenerationPrompt(
  profile: Profile,
  competitorAnalyses: Array<{ competitor: Competitor; analysis: any; news: any[] }>
): string {
  const analysesText = competitorAnalyses.map((item, idx) => {
    return `### ${idx + 1}. ${item.competitor.name} (${item.competitor.type})
${item.analysis.summary}

Movimientos clave:
${item.analysis.key_movements.map((m: any) => `- [${m.date}] ${m.description} (Impacto: ${m.impact})`).join('\n')}

Nivel de amenaza: ${item.analysis.threat_level}
`
  }).join('\n\n---\n\n')

  return `Eres un analista de inteligencia competitiva creando un reporte ejecutivo.

Empresa objetivo: ${profile.company_name}
Descripción: ${profile.company_description}

Análisis de competidores:

${analysesText}

Genera un reporte ejecutivo profesional en formato Markdown con las siguientes secciones:

# Reporte de Inteligencia Competitiva

## 📊 Resumen Ejecutivo
(2-3 párrafos con los hallazgos más importantes)

## 🏢 Actividad de Competidores
(Subsección por cada competidor con movimientos clave)

## 📈 Tendencias del Mercado
(Patrones y tendencias identificadas en el sector)

## 💡 Oportunidades Identificadas
(3-5 oportunidades accionables basadas en los hallazgos)

## ⚠️ Amenazas y Riesgos
(3-5 amenazas principales a monitorear)

## 🎯 Recomendaciones
(5-7 acciones específicas recomendadas)

Usa:
- Lenguaje profesional pero accesible
- Datos específicos y fechas cuando sea relevante
- Formato Markdown apropiado (encabezados, listas, énfasis)
- Emojis para mejorar la legibilidad
- Bullets concisos pero informativos`
}

/**
 * Prompt del sistema para contexto general
 */
export const SYSTEM_PROMPT = `Eres un analista senior de inteligencia competitiva con más de 15 años de experiencia. 

Tus análisis se caracterizan por:
- Precisión y basados en datos
- Insights accionables
- Lenguaje claro y profesional
- Enfoque en el impacto estratégico
- Recomendaciones específicas

Siempre proporciona análisis equilibrados que consideren múltiples perspectivas.`
```

### Funciones de Análisis de IA

#### `lib/ai/analysis.ts`
```typescript
import { generateWithSaptiva, generateJSON } from './saptiva'
import {
  createCompetitorIdentificationPrompt,
  createNewsAnalysisPrompt,
  createReportGenerationPrompt,
  SYSTEM_PROMPT
} from './prompts'
import type { Profile } from '@/types/database'
import type { Competitor, CompetitorAnalysis } from '@/types/ai'

/**
 * Identifica competidores basándose en el perfil de la empresa
 */
export async function identifyCompetitors(
  profile: Profile
): Promise<Competitor[]> {
  const prompt = createCompetitorIdentificationPrompt(profile)
  
  const result = await generateJSON<{ competitors: Competitor[] }>(
    prompt,
    {
      model: 'fast',  // Usar Saptiva Turbo para extracción rápida
      temperature: 0.3,
      systemPrompt: SYSTEM_PROMPT
    }
  )
  
  return result.competitors
}

/**
 * Analiza noticias de un competidor específico
 */
export async function analyzeCompetitorNews(
  competitor: Competitor,
  news: Array<{ title: string; snippet: string; url: string; published_date: string }>
): Promise<CompetitorAnalysis> {
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
  
  const analysis = await generateJSON<CompetitorAnalysis>(
    prompt,
    {
      model: 'reasoning',  // Usar Saptiva Cortex para análisis profundo
      temperature: 0.4,
      systemPrompt: SYSTEM_PROMPT
    }
  )
  
  return {
    ...analysis,
    competitor: competitor.name
  }
}

/**
 * Genera reporte ejecutivo completo
 */
export async function generateExecutiveReport(
  profile: Profile,
  competitorAnalyses: Array<{
    competitor: Competitor
    analysis: CompetitorAnalysis
    news: any[]
  }>
): Promise<string> {
  const prompt = createReportGenerationPrompt(profile, competitorAnalyses)
  
  const report = await generateWithSaptiva(
    prompt,
    {
      model: 'advanced',  // Usar Saptiva Legacy para reportes ejecutivos
      temperature: 0.6,
      maxTokens: 4000,
      systemPrompt: SYSTEM_PROMPT
    }
  )
  
  return report
}
```

---

## 📦 Dependencias

```bash
npm install ai @ai-sdk/openai
```

### Variables de Entorno

```bash
# .env.local
SAPTIVA_API_KEY=your_saptiva_api_key_here
```

### Endpoint y Autenticación

- **Endpoint:** `https://api.saptiva.com/v1/chat/completions`
- **Autenticación:** Bearer token en header `Authorization`
- **Formato:** Compatible con OpenAI API
- **Documentación:** https://saptiva.gitbook.io/saptiva-docs

---

## 🧪 Testing

### Script de Testing

#### `scripts/test-saptiva.ts`
```typescript
import { identifyCompetitors, analyzeCompetitorNews, generateExecutiveReport } from '@/lib/ai/analysis'
import type { Profile } from '@/types/database'

async function testSaptivaIntegration() {
  console.log('🧪 Testing Saptiva Integration...\n')

  // Test 1: Identificación de competidores
  console.log('1️⃣ Identificando competidores...')
  const testProfile: Profile = {
    id: 'test-id',
    company_name: 'Acme SaaS',
    company_description: 'Plataforma de gestión de proyectos para equipos remotos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const competitors = await identifyCompetitors(testProfile)
  console.log(`✅ Encontrados ${competitors.length} competidores:`)
  competitors.forEach(c => console.log(`   - ${c.name} (${c.type})`))
  console.log()

  // Test 2: Análisis de noticias
  console.log('2️⃣ Analizando noticias...')
  const mockNews = [
    {
      title: 'Asana raises $50M Series D',
      snippet: 'Asana announced a $50M funding round...',
      url: 'https://example.com/news1',
      published_date: '2025-10-20'
    }
  ]

  const analysis = await analyzeCompetitorNews(competitors[0], mockNews)
  console.log(`✅ Análisis completado:`)
  console.log(`   Sentimiento: ${analysis.sentiment}`)
  console.log(`   Nivel de amenaza: ${analysis.threat_level}`)
  console.log(`   Movimientos: ${analysis.key_movements.length}`)
  console.log()

  console.log('✅ Todas las pruebas pasaron!')
}

testSaptivaIntegration().catch(console.error)
```

---

## 📊 Optimización y Costos

### Estrategias de Optimización

1. **Caché de Respuestas**
   - Guardar análisis de competidores por 24h
   - Evitar llamadas duplicadas

2. **Selección Inteligente de Modelos**
   - Usar modelo `fast` para tareas simples
   - Reservar `premium` solo para reporte final

3. **Límites de Tokens**
   - Configurar `maxTokens` apropiados
   - Truncar noticias si son muy largas

4. **Batch Processing**
   - Analizar múltiples competidores en paralelo
   - Usar `Promise.all()` cuando sea posible

---

## ✅ Checklist de Implementación

- [ ] Obtener API key de Saptiva
- [ ] Instalar dependencias (ai, @ai-sdk/openai)
- [ ] Configurar variables de entorno
- [ ] Crear cliente de Saptiva
- [ ] Implementar sistema de prompts
- [ ] Crear funciones de análisis
- [ ] Testing con datos reales
- [ ] Optimizar selección de modelos
- [ ] Implementar manejo de errores
- [ ] Documentar ejemplos de uso

---

## 🔗 Recursos

- [Saptiva Docs](https://saptiva.gitbook.io/saptiva-docs/)
- [Modelos Disponibles](https://saptiva.gitbook.io/saptiva-docs/basicos/modelos-disponibles)
- [API Reference](https://saptiva.gitbook.io/saptiva-docs/basicos/api-reference)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

## 💡 Notas Importantes

- ⚠️ **Endpoint correcto:** Usar `https://api.saptiva.com/v1` (no .ai)
- 💰 **Costo aproximado:** ~$0.01 USD por reporte completo
- 🚀 **Modelos recomendados:**
  - Identificación: `Saptiva Turbo` (rápido y económico)
  - Análisis: `Saptiva Cortex` (razonamiento profundo)
  - Reportes: `Saptiva Legacy` (mejor para documentos largos)
- 📚 **Formato de mensajes:** Usar `messages` array (no solo `prompt`)

