'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useReportGeneration } from '@/lib/hooks/useReportGeneration'

interface GenerateReportButtonProps {
  profileId: string
  onReportCompleted?: () => void
}

export function GenerateReportButton({ profileId, onReportCompleted }: GenerateReportButtonProps) {
  const { status, error, generateReport, reset, isGenerating } = useReportGeneration()

  const handleGenerate = async () => {
    await generateReport(profileId)
  }

  const handleReportCompleted = () => {
    reset()
    if (onReportCompleted) {
      onReportCompleted()
    }
  }

  // Estado: Generando
  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>⏳ Generando tu reporte...</CardTitle>
          <CardDescription>
            Tu análisis está en proceso. Esto puede tardar entre 1-2 minutos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Analizando competidores y noticias del mercado...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado: Completado
  if (status === 'completed') {
    return (
      <Alert>
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>✅ ¡Reporte generado exitosamente!</span>
            <Button onClick={handleReportCompleted} variant="outline" size="sm">
              Ver Reporte
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Estado: Error
  if (status === 'failed') {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <div className="space-y-2">
            <p>❌ Error: {error}</p>
            <Button onClick={reset} variant="outline" size="sm">
              Intentar de nuevo
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Estado: Idle (botón normal)
  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">✨ Genera tu Reporte del Día</h3>
            <p className="text-muted-foreground">
              Análisis completo de inteligencia competitiva con IA
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            size="lg"
            className="w-full sm:w-auto"
          >
            🚀 Generar Reporte
          </Button>
          <p className="text-xs text-muted-foreground">
            El proceso toma aproximadamente 1-2 minutos
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

