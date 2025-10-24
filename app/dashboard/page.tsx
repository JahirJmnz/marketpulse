'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useSession } from '@/lib/hooks/useSession'
import { GenerateReportButton } from '@/components/reports/GenerateReportButton'
import { ReportList } from '@/components/reports/ReportList'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const { profileId, profile, isAuthenticated, isLoading, logout } = useSession()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar y no está autenticado
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleReportCompleted = () => {
    // Refrescar la lista de reportes
    setRefreshKey(prev => prev + 1)
  }

  const handleChangeCompany = () => {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated || !profileId) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto py-12 px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                🎯 MarketPulse
              </h1>
              <p className="text-lg text-muted-foreground">
                Dashboard de Inteligencia Competitiva
              </p>
              {profile && (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.company_name}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleChangeCompany}
              className="flex items-center gap-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Cambiar Empresa
            </Button>
          </div>

          {/* Generar Reporte */}
          <div className="mb-8">
            <GenerateReportButton
              profileId={profileId}
              onReportCompleted={handleReportCompleted}
            />
          </div>

          {/* Lista de Reportes */}
          <ReportList key={refreshKey} profileId={profileId} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
