# F006 - Generación de Reportes

**Estado:** 🔴 Pendiente  
**Prioridad:** 🔥 Crítica  
**Dependencias:** F002, F004, F005  
**Estimación:** 2 días

---

## 📋 Descripción

Sistema completo de generación de reportes de inteligencia competitiva. Orquesta todo el flujo desde la identificación de competidores, búsqueda de noticias, análisis con IA, hasta la generación del reporte final.

---

## 🎯 Objetivos

- Implementar flujo completo de generación de reportes
- Orquestar integraciones con Tavily y Saptiva
- Manejar procesamiento en background
- Actualizar estado del reporte en tiempo real
- Manejar errores y reintentos
- Optimizar para rendimiento

---

## 🔄 Flujo de Generación

```
1. Usuario solicita reporte
   ↓
2. Crear registro en DB (status: PENDING)
   ↓
3. Iniciar procesamiento en background
   ↓
4. Identificar competidores (Saptiva)
   ↓
5. Buscar noticias de cada competidor (Tavily)
   ↓
6. Analizar noticias por competidor (Saptiva)
   ↓
7. Generar reporte ejecutivo (Saptiva)
   ↓
8. Guardar reporte en DB (status: COMPLETED)
   ↓
9. Notificar al frontend
```

---

## 🏗️ Implementación Técnica

### API Route Principal

#### `app/api/reports/generate/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { createReport } from '@/lib/db/queries'
import { generateReportInBackground } from '@/lib/reports/generator'

export async function POST(request: Request) {
  try {
    const { profile_id } = await request.json()

    if (!profile_id) {
      return NextResponse.json(
        { error: 'profile_id es requerido' },
        { status: 400 }
      )
    }

    // Crear registro del reporte en DB
    const report = await createReport(profile_id)

    // Iniciar generación en background
    // No esperamos a que termine, retornamos inmediatamente
    generateReportInBackground(report.id, profile_id)
      .catch(error => {
        console.error('Error en generación de reporte:', error)
      })

    return NextResponse.json({
      report_id: report.id,
      status: 'PENDING',
      message: 'La generación del reporte ha comenzado'
    })
  } catch (error) {
    console.error('Error creando reporte:', error)
    return NextResponse.json(
      { error: 'Error al crear reporte' },
      { status: 500 }
    )
  }
}
```

### Generador de Reportes

#### `lib/reports/generator.ts`
```typescript
import { getProfile, updateReportStatus } from '@/lib/db/queries'
import { identifyCompetitors, analyzeCompetitorNews, generateExecutiveReport } from '@/lib/ai/analysis'
import { researchAllCompetitors } from '@/lib/search/competitor-research'
import type { Competitor, CompetitorAnalysis } from '@/types/ai'

/**
 * Genera un reporte completo en background
 */
export async function generateReportInBackground(
  reportId: string,
  profileId: string
): Promise<void> {
  try {
    console.log(`📊 Iniciando generación de reporte ${reportId}...`)

    // Paso 1: Obtener perfil de la empresa
    console.log('1/6 Obteniendo perfil de empresa...')
    const profile = await getProfile(profileId)
    
    if (!profile) {
      throw new Error('Perfil no encontrado')
    }

    // Paso 2: Identificar competidores usando IA
    console.log('2/6 Identificando competidores con IA...')
    const competitors = await identifyCompetitors(profile)
    console.log(`✅ Identificados ${competitors.length} competidores`)

    // Paso 3: Buscar noticias de cada competidor
    console.log('3/6 Buscando noticias de competidores...')
    const research = await researchAllCompetitors(competitors, {
      days: 7, // Últimos 7 días
      maxResults: 10 // Máximo 10 noticias por competidor
    })

    // Filtrar competidores sin actividad reciente
    const activeResearch = research.filter(r => r.hasActivity)
    console.log(`✅ Encontrada actividad en ${activeResearch.length} competidores`)

    // Paso 4: Analizar noticias con IA
    console.log('4/6 Analizando noticias con IA...')
    const analyses = await Promise.all(
      activeResearch.map(async (item) => {
        const analysis = await analyzeCompetitorNews(
          item.competitor,
          item.news
        )
        return {
          competitor: item.competitor,
          analysis,
          news: item.news
        }
      })
    )
    console.log(`✅ Análisis completado para ${analyses.length} competidores`)

    // Paso 5: Generar reporte ejecutivo
    console.log('5/6 Generando reporte ejecutivo...')
    const reportContent = await generateExecutiveReport(profile, analyses)
    console.log('✅ Reporte generado')

    // Paso 6: Guardar reporte en base de datos
    console.log('6/6 Guardando reporte en base de datos...')
    await updateReportStatus(reportId, 'COMPLETED', reportContent)
    console.log(`✅ Reporte ${reportId} completado exitosamente`)

  } catch (error) {
    console.error(`❌ Error generando reporte ${reportId}:`, error)
    
    // Guardar error en la base de datos
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    await updateReportStatus(reportId, 'FAILED', undefined, errorMessage)
  }
}

/**
 * Genera un reporte con progreso en tiempo real
 */
export async function* generateReportWithProgress(
  reportId: string,
  profileId: string
) {
  try {
    yield { step: 1, total: 6, message: 'Obteniendo perfil de empresa...' }
    const profile = await getProfile(profileId)
    if (!profile) throw new Error('Perfil no encontrado')

    yield { step: 2, total: 6, message: 'Identificando competidores...' }
    const competitors = await identifyCompetitors(profile)

    yield { 
      step: 3, 
      total: 6, 
      message: `Buscando noticias de ${competitors.length} competidores...` 
    }
    const research = await researchAllCompetitors(competitors, {
      days: 7,
      maxResults: 10
    })

    const activeResearch = research.filter(r => r.hasActivity)
    
    yield { 
      step: 4, 
      total: 6, 
      message: `Analizando ${activeResearch.length} competidores activos...` 
    }
    const analyses = await Promise.all(
      activeResearch.map(async (item) => {
        const analysis = await analyzeCompetitorNews(item.competitor, item.news)
        return { competitor: item.competitor, analysis, news: item.news }
      })
    )

    yield { step: 5, total: 6, message: 'Generando reporte ejecutivo...' }
    const reportContent = await generateExecutiveReport(profile, analyses)

    yield { step: 6, total: 6, message: 'Guardando reporte...' }
    await updateReportStatus(reportId, 'COMPLETED', reportContent)

    yield { step: 6, total: 6, message: 'Reporte completado', completed: true }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    await updateReportStatus(reportId, 'FAILED', undefined, errorMessage)
    throw error
  }
}
```

### API Route para Estado del Reporte

#### `app/api/reports/[id]/status/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { getReport } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await getReport(params.id)

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: report.id,
      status: report.status,
      created_at: report.created_at,
      completed_at: report.completed_at,
      error_message: report.error_message,
      has_content: !!report.content
    })
  } catch (error) {
    console.error('Error obteniendo estado del reporte:', error)
    return NextResponse.json(
      { error: 'Error al obtener estado' },
      { status: 500 }
    )
  }
}
```

### API Route para Obtener Reporte

#### `app/api/reports/[id]/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { getReport } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await getReport(params.id)

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error obteniendo reporte:', error)
    return NextResponse.json(
      { error: 'Error al obtener reporte' },
      { status: 500 }
    )
  }
}
```

---

## 🔄 Sistema de Polling del Frontend

### Hook para Generar y Monitorear Reporte

#### `lib/hooks/useReportGeneration.ts`
```typescript
'use client'

import { useState, useCallback } from 'react'

export interface ReportGenerationState {
  reportId: string | null
  status: 'idle' | 'generating' | 'completed' | 'failed'
  error: string | null
}

export function useReportGeneration() {
  const [state, setState] = useState<ReportGenerationState>({
    reportId: null,
    status: 'idle',
    error: null
  })

  /**
   * Inicia la generación de un reporte
   */
  const generateReport = useCallback(async (profileId: string) => {
    try {
      setState({
        reportId: null,
        status: 'generating',
        error: null
      })

      // Solicitar generación
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId })
      })

      if (!response.ok) {
        throw new Error('Error al generar reporte')
      }

      const { report_id } = await response.json()

      setState(prev => ({
        ...prev,
        reportId: report_id
      }))

      // Iniciar polling del estado
      pollReportStatus(report_id)

    } catch (error) {
      setState({
        reportId: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }, [])

  /**
   * Hace polling del estado del reporte
   */
  const pollReportStatus = async (reportId: string) => {
    const maxAttempts = 60 // 5 minutos (cada 5 segundos)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}/status`)
        const data = await response.json()

        if (data.status === 'COMPLETED') {
          setState({
            reportId,
            status: 'completed',
            error: null
          })
          return
        }

        if (data.status === 'FAILED') {
          setState({
            reportId,
            status: 'failed',
            error: data.error_message || 'Error al generar reporte'
          })
          return
        }

        // Si todavía está en progreso, seguir polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Cada 5 segundos
        } else {
          // Timeout
          setState({
            reportId,
            status: 'failed',
            error: 'Timeout: El reporte está tardando demasiado'
          })
        }
      } catch (error) {
        console.error('Error en polling:', error)
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: 'Error al verificar estado del reporte'
        }))
      }
    }

    poll()
  }

  /**
   * Resetea el estado
   */
  const reset = useCallback(() => {
    setState({
      reportId: null,
      status: 'idle',
      error: null
    })
  }, [])

  return {
    ...state,
    generateReport,
    reset,
    isGenerating: state.status === 'generating'
  }
}
```

---

## 📊 Monitoreo y Logging

### Sistema de Logs

```typescript
// lib/reports/logger.ts
export class ReportLogger {
  constructor(private reportId: string) {}

  info(message: string, data?: any) {
    console.log(`[Report ${this.reportId}] ${message}`, data || '')
  }

  error(message: string, error?: any) {
    console.error(`[Report ${this.reportId}] ERROR: ${message}`, error)
  }

  step(current: number, total: number, message: string) {
    console.log(`[Report ${this.reportId}] [${current}/${total}] ${message}`)
  }
}
```

---

## 🧪 Testing

### Script de Testing Completo

```typescript
// scripts/test-report-generation.ts
import { generateReportInBackground } from '@/lib/reports/generator'
import { createProfile, createReport } from '@/lib/db/queries'

async function testFullReportGeneration() {
  console.log('🧪 Testing Full Report Generation...\n')

  // Crear perfil de prueba
  const profile = await createProfile({
    company_name: 'Test Company',
    company_description: 'A SaaS platform for project management'
  })
  console.log(`✅ Perfil creado: ${profile.id}`)

  // Crear reporte
  const report = await createReport(profile.id)
  console.log(`✅ Reporte creado: ${report.id}`)

  // Generar reporte
  console.log('\n🔄 Iniciando generación...\n')
  await generateReportInBackground(report.id, profile.id)

  console.log('\n✅ Test completado!')
}

testFullReportGeneration().catch(console.error)
```

---

## ⚡ Optimizaciones

### 1. Procesamiento Paralelo

```typescript
// Analizar competidores en paralelo
const analyses = await Promise.all(
  research.map(item => analyzeCompetitorNews(item.competitor, item.news))
)
```

### 2. Límite de Concurrencia

```typescript
// lib/utils/concurrency.ts
export async function promiseAllWithLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []

  for (const task of tasks) {
    const p = task().then(result => {
      results.push(result)
    })
    executing.push(p)

    if (executing.length >= limit) {
      await Promise.race(executing)
      executing.splice(executing.findIndex(p => p === p), 1)
    }
  }

  await Promise.all(executing)
  return results
}
```

### 3. Caché de Resultados

```typescript
// Caché de competidores identificados
const cacheKey = `competitors:${profile.id}`
let competitors = await cache.get(cacheKey)

if (!competitors) {
  competitors = await identifyCompetitors(profile)
  await cache.set(cacheKey, competitors, 86400) // 24 horas
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear API route para generar reportes
- [ ] Implementar generador de reportes
- [ ] Crear sistema de logging
- [ ] Implementar polling del frontend
- [ ] Crear hook useReportGeneration
- [ ] Implementar manejo de errores
- [ ] Agregar optimizaciones de rendimiento
- [ ] Testing de flujo completo
- [ ] Documentar tiempos estimados
- [ ] Implementar métricas de monitoreo

---

## 📈 Métricas Esperadas

| Métrica | Valor Estimado |
|---------|----------------|
| Tiempo total | 60-120 segundos |
| Identificación de competidores | 10-15 segundos |
| Búsqueda de noticias | 20-30 segundos |
| Análisis con IA | 30-50 segundos |
| Generación de reporte | 10-15 segundos |

---

## 🔗 Archivos Relacionados

- `app/api/reports/generate/route.ts`
- `app/api/reports/[id]/route.ts`
- `app/api/reports/[id]/status/route.ts`
- `lib/reports/generator.ts`
- `lib/reports/logger.ts`
- `lib/hooks/useReportGeneration.ts`

