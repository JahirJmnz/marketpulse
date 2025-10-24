// Tipos para integraciones de IA y análisis de competidores

/**
 * Tipo de competidor identificado
 */
export type CompetitorType = 'direct' | 'indirect' | 'emerging' | 'potential'

/**
 * Competidor identificado por IA
 */
export interface Competitor {
  name: string
  type: CompetitorType
  reason: string
  website?: string
}

/**
 * Tipo de movimiento estratégico
 */
export type MovementType = 'launch' | 'acquisition' | 'partnership' | 'financial' | 'strategy'

/**
 * Nivel de impacto
 */
export type ImpactLevel = 'high' | 'medium' | 'low'

/**
 * Sentimiento del análisis
 */
export type Sentiment = 'positive' | 'neutral' | 'negative'

/**
 * Movimiento clave de un competidor
 */
export interface KeyMovement {
  type: MovementType
  description: string
  impact: ImpactLevel
  date: string
  source_url?: string
}

/**
 * Análisis de un competidor específico
 */
export interface CompetitorAnalysis {
  competitor: string
  key_movements: KeyMovement[]
  sentiment: Sentiment
  threat_level: ImpactLevel
  summary: string
}

/**
 * Resultado de identificación de competidores
 */
export interface CompetitorIdentificationResult {
  competitors: Competitor[]
}

/**
 * Noticia de un competidor
 */
export interface CompetitorNews {
  title: string
  snippet: string
  url: string
  published_date: string
}

