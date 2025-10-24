import type { Profile } from '@/types/database'
import type { Competitor, CompetitorNews } from '@/types/ai'

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

/**
 * Prompt para identificar competidores
 */
export function createCompetitorIdentificationPrompt(profile: Profile): string {
  return `Lista 5 competidores de: ${profile.company_name}
(${profile.company_description})

JSON puro sin markdown:
{"competitors":[{"name":"EmpresaX","type":"direct","reason":"breve"}]}`
}

/**
 * Prompt para analizar noticias de competidores
 */
export function createNewsAnalysisPrompt(
  competitor: Competitor,
  news: CompetitorNews[]
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

