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
  // Limitar a máximo 5 noticias para reducir tamaño del prompt
  const limitedNews = news.slice(0, 5)
  const newsText = limitedNews.map((item, idx) => 
    `${idx + 1}. ${item.title}\n${item.snippet.slice(0, 150)}...`
  ).join('\n\n')

  return `Analiza noticias de ${competitor.name}:

${newsText}

JSON puro (sin markdown):
{
  "key_movements": [{"type": "launch", "description": "breve", "impact": "high", "date": "2025-10-01"}],
  "sentiment": "positive",
  "threat_level": "medium",
  "summary": "Resumen en 2 líneas"
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
    const movements = item.analysis.key_movements.slice(0, 3).map((m: any) => 
      `- ${m.description} (${m.impact})`
    ).join('\n')
    
    return `**${item.competitor.name}**: ${item.analysis.summary}
${movements}
Amenaza: ${item.analysis.threat_level}`
  }).join('\n\n')

  return `Reporte ejecutivo para ${profile.company_name}:

${analysesText}

Genera en Markdown:
# Reporte de Inteligencia Competitiva

## 📊 Resumen Ejecutivo
(2 párrafos clave)

## 🏢 Competidores
(Analiza cada uno brevemente)

## 📈 Tendencias
(3-4 tendencias principales)

## 💡 Oportunidades
(3-4 oportunidades)

## ⚠️ Amenazas
(3-4 amenazas)

## 🎯 Recomendaciones
(5 acciones específicas)

Conciso y accionable.`
}

