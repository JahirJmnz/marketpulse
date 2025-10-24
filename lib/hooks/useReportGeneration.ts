'use client'

import { useState, useCallback } from 'react'

export type ReportStatus = 'idle' | 'generating' | 'completed' | 'failed'

export interface ReportGenerationState {
  reportId: string | null
  status: ReportStatus
  error: string | null
}

/**
 * Hook para manejar la generación de reportes con polling
 */
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

      console.log('🚀 Iniciando generación de reporte...')

      // Solicitar generación
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(error.error || 'Error al generar reporte')
      }

      const { report_id } = await response.json()
      console.log(`✅ Reporte ${report_id} iniciado`)

      setState(prev => ({
        ...prev,
        reportId: report_id
      }))

      // Iniciar polling del estado
      pollReportStatus(report_id)

    } catch (error) {
      console.error('❌ Error:', error)
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
        
        if (!response.ok) {
          throw new Error('Error verificando estado')
        }
        
        const data = await response.json()
        console.log(`[${attempts + 1}/${maxAttempts}] Status: ${data.status}`)

        if (data.status === 'COMPLETED') {
          console.log('✅ Reporte completado!')
          setState({
            reportId,
            status: 'completed',
            error: null
          })
          return
        }

        if (data.status === 'FAILED') {
          console.error('❌ Reporte falló:', data.error_message)
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
            error: 'Timeout: El reporte está tardando más de lo esperado'
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
    isGenerating: state.status === 'generating',
    isCompleted: state.status === 'completed',
    isFailed: state.status === 'failed'
  }
}

