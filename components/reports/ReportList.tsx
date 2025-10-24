'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ReportViewer } from './ReportViewer'

interface Report {
  id: string
  status: string
  created_at: string
  completed_at?: string
  has_content: boolean
  error_message?: string
}

interface ReportListProps {
  profileId: string
}

export function ReportList({ profileId }: ReportListProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedReportContent, setSelectedReportContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/profiles/${profileId}/reports`)
      
      if (!response.ok) {
        throw new Error('Error cargando reportes')
      }
      
      const data = await response.json()
      setReports(data.reports || [])
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [profileId])

  // Cargar lista de reportes
  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const loadReportContent = async (reportId: string) => {
    try {
      setLoadingContent(true)
      setSelectedReportId(reportId)
      
      const response = await fetch(`/api/reports/${reportId}`)
      
      if (!response.ok) {
        throw new Error('Error cargando contenido del reporte')
      }
      
      const report = await response.json()
      setSelectedReportContent(report.content)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoadingContent(false)
    }
  }

  const closeReport = () => {
    setSelectedReportId(null)
    setSelectedReportContent(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando reportes...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-2">
            <p className="text-xl text-muted-foreground">📊 No hay reportes todavía</p>
            <p className="text-sm text-muted-foreground">
              Genera tu primer reporte de inteligencia competitiva
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si hay un reporte seleccionado, mostrarlo
  if (selectedReportId && selectedReportContent) {
    const selectedReport = reports.find(r => r.id === selectedReportId)
    return (
      <div className="space-y-4">
        <Button onClick={closeReport} variant="outline">
          ← Volver a lista de reportes
        </Button>
        <ReportViewer
          content={selectedReportContent}
          createdAt={selectedReport?.created_at || ''}
          reportId={selectedReportId}
        />
      </div>
    )
  }

  // Lista de reportes
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📋 Reportes Anteriores</h2>
      
      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="hover:bg-accent transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    📊 Reporte del {new Date(report.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardTitle>
                  <CardDescription>
                    {report.status === 'COMPLETED' && '✅ Completado'}
                    {report.status === 'PROCESSING' && '⏳ Procesando...'}
                    {report.status === 'PENDING' && '⏸️ Pendiente'}
                    {report.status === 'FAILED' && '❌ Error'}
                    {report.completed_at && ` • ${new Date(report.completed_at).toLocaleTimeString('es-ES')}`}
                  </CardDescription>
                  {report.error_message && (
                    <p className="text-sm text-destructive mt-1">{report.error_message}</p>
                  )}
                </div>
                {report.status === 'COMPLETED' && report.has_content && (
                  <Button
                    onClick={() => loadReportContent(report.id)}
                    disabled={loadingContent && selectedReportId === report.id}
                  >
                    {loadingContent && selectedReportId === report.id ? 'Cargando...' : 'Ver Reporte →'}
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

