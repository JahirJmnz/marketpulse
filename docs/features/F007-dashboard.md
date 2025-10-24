# F007 - Dashboard Principal

**Estado:** 🔴 Pendiente  
**Prioridad:** 🔥 Alta  
**Dependencias:** F001, F003, F006, F008  
**Estimación:** 1.5 días

---

## 📋 Descripción

Interfaz principal del usuario donde puede ver su perfil, generar nuevos reportes y visualizar el historial de reportes generados. Es el centro de control de la aplicación.

---

## 🎯 Objetivos

- Crear interfaz intuitiva y moderna
- Mostrar información del perfil de empresa
- Botón prominente para generar reportes
- Lista de reportes históricos
- Estados de carga y feedback visual
- Responsive design para diferentes dispositivos

---

## 🎨 Diseño y UX

### Estados del Dashboard

#### 1. Estado Inicial (Sin Reportes)
```
┌─────────────────────────────────────────────────┐
│  🎯 MarketPulse              [👤 Mi Empresa]   │
├─────────────────────────────────────────────────┤
│                                                 │
│    Dashboard de Inteligencia Competitiva       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │     📊 No hay reportes todavía           │ │
│  │                                           │ │
│  │     Genera tu primer reporte de          │ │
│  │     inteligencia competitiva             │ │
│  │                                           │ │
│  │   ┌─────────────────────────────────┐   │ │
│  │   │  ✨ Generar Reporte del Día     │   │ │
│  │   └─────────────────────────────────┘   │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 2. Estado Generando
```
┌─────────────────────────────────────────────────┐
│  🎯 MarketPulse              [👤 Mi Empresa]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ⏳ Generando tu reporte...              │ │
│  │                                           │ │
│  │  Tu análisis está en proceso. Esto puede │ │
│  │  tardar entre 1-2 minutos.               │ │
│  │                                           │ │
│  │  [████████░░░░░░░░] 60%                  │ │
│  │                                           │ │
│  │  Analizando noticias de competidores...  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 3. Estado con Reportes
```
┌─────────────────────────────────────────────────┐
│  🎯 MarketPulse              [👤 Mi Empresa]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  ✨ Generar Nuevo Reporte              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  📋 Reportes Anteriores                        │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  📊 Reporte del 24 de Octubre 2025      ▼│ │
│  ├───────────────────────────────────────────┤ │
│  │  [Contenido del reporte expandido...]    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  📊 Reporte del 23 de Octubre 2025      ▶│ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  📊 Reporte del 22 de Octubre 2025      ▶│ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ Implementación Técnica

### Página Principal del Dashboard

#### `app/dashboard/page.tsx`
```typescript
'use client'

import { useSession } from '@/lib/hooks/useSession'
import { useReports } from '@/lib/hooks/useReports'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { GenerateReportButton } from '@/components/dashboard/GenerateReportButton'
import { ReportsList } from '@/components/dashboard/ReportsList'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { GeneratingState } from '@/components/dashboard/GeneratingState'

export default function DashboardPage() {
  const { profile } = useSession()
  const { reports, isLoading, isGenerating, generationState, generateNewReport, refreshReports } = useReports()

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader profile={profile} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estado de generación */}
          {isGenerating && (
            <GeneratingState state={generationState} />
          )}

          {/* Botón de generar reporte */}
          {!isGenerating && (
            <div className="mb-8">
              <GenerateReportButton
                onGenerate={generateNewReport}
                disabled={isGenerating}
              />
            </div>
          )}

          {/* Lista de reportes o estado vacío */}
          {reports.length === 0 && !isGenerating ? (
            <EmptyState onGenerate={generateNewReport} />
          ) : (
            <ReportsList
              reports={reports}
              onRefresh={refreshReports}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
```

### Componente: Header del Dashboard

#### `components/dashboard/DashboardHeader.tsx`
```typescript
'use client'

import { useSession } from '@/lib/hooks/useSession'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, LogOut, Settings } from 'lucide-react'

export function DashboardHeader({ profile }: { profile: any }) {
  const { logout } = useSession()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">MP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MarketPulse</h1>
              <p className="text-xs text-gray-500">Inteligencia Competitiva</p>
            </div>
          </div>

          {/* Perfil de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span className="hidden sm:inline">{profile?.company_name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{profile?.company_name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {profile?.company_description}
                </p>
              </div>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
```

### Componente: Botón de Generar Reporte

#### `components/dashboard/GenerateReportButton.tsx`
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface GenerateReportButtonProps {
  onGenerate: () => void
  disabled?: boolean
}

export function GenerateReportButton({ onGenerate, disabled }: GenerateReportButtonProps) {
  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generar Nuevo Reporte
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
          Obtén un análisis actualizado de tus competidores basado en la actividad de los últimos 7 días
        </p>
        <Button
          onClick={onGenerate}
          disabled={disabled}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generar Reporte del Día
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Componente: Estado Vacío

#### `components/dashboard/EmptyState.tsx`
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, TrendingUp, Target } from 'lucide-react'

interface EmptyStateProps {
  onGenerate: () => void
}

export function EmptyState({ onGenerate }: EmptyStateProps) {
  return (
    <div className="space-y-6">
      {/* Estado vacío principal */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay reportes todavía
          </h3>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            Genera tu primer reporte de inteligencia competitiva para comenzar a monitorear a tus competidores
          </p>
          <Button onClick={onGenerate} size="lg" className="bg-blue-600 hover:bg-blue-700">
            ✨ Generar Primer Reporte
          </Button>
        </CardContent>
      </Card>

      {/* Beneficios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Análisis Automático
            </h4>
            <p className="text-sm text-gray-600">
              IA analiza automáticamente las noticias y movimientos de tus competidores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Insights Accionables
            </h4>
            <p className="text-sm text-gray-600">
              Recibe recomendaciones específicas basadas en el análisis de mercado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Reportes Ejecutivos
            </h4>
            <p className="text-sm text-gray-600">
              Reportes profesionales listos para compartir con tu equipo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### Componente: Estado de Generación

#### `components/dashboard/GeneratingState.tsx`
```typescript
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, Info } from 'lucide-react'

interface GeneratingStateProps {
  state: {
    progress: number
    message: string
  }
}

export function GeneratingState({ state }: GeneratingStateProps) {
  return (
    <div className="mb-8 space-y-4">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generando tu reporte...
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                {state.message}
              </p>
              <Progress value={state.progress} className="h-2" />
              <p className="text-xs text-gray-600 mt-2">
                {state.progress}% completado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Tu análisis está en proceso. Esto puede tardar entre 1 y 2 minutos.
          La página se actualizará automáticamente cuando esté listo.
        </AlertDescription>
      </Alert>
    </div>
  )
}
```

### Hook: useReports

#### `lib/hooks/useReports.ts`
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from './useSession'
import { useReportGeneration } from './useReportGeneration'
import type { Report } from '@/types/database'

export function useReports() {
  const { profile } = useSession()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const reportGeneration = useReportGeneration()

  // Cargar reportes
  const loadReports = useCallback(async () => {
    if (!profile?.id) return

    try {
      const response = await fetch(`/api/reports?profile_id=${profile.id}`)
      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error('Error cargando reportes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [profile?.id])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Recargar cuando termine la generación
  useEffect(() => {
    if (reportGeneration.status === 'completed') {
      loadReports()
    }
  }, [reportGeneration.status, loadReports])

  const generateNewReport = useCallback(async () => {
    if (!profile?.id) return
    await reportGeneration.generateReport(profile.id)
  }, [profile?.id, reportGeneration])

  return {
    reports,
    isLoading,
    isGenerating: reportGeneration.isGenerating,
    generationState: {
      progress: calculateProgress(reportGeneration.status),
      message: getProgressMessage(reportGeneration.status)
    },
    generateNewReport,
    refreshReports: loadReports
  }
}

function calculateProgress(status: string): number {
  switch (status) {
    case 'generating': return 50
    case 'completed': return 100
    default: return 0
  }
}

function getProgressMessage(status: string): string {
  switch (status) {
    case 'generating': return 'Analizando competidores y noticias...'
    case 'completed': return 'Reporte completado'
    default: return 'Iniciando análisis...'
  }
}
```

---

## 📦 Dependencias

Componentes de shadcn/ui necesarios:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add progress
```

---

## ✅ Checklist de Implementación

- [ ] Crear página `app/dashboard/page.tsx`
- [ ] Crear componente `DashboardHeader`
- [ ] Crear componente `GenerateReportButton`
- [ ] Crear componente `EmptyState`
- [ ] Crear componente `GeneratingState`
- [ ] Crear hook `useReports`
- [ ] Agregar componentes shadcn/ui necesarios
- [ ] Implementar responsive design
- [ ] Testing en diferentes dispositivos
- [ ] Optimizar rendimiento

---

## 🔗 Archivos Relacionados

- `app/dashboard/page.tsx`
- `components/dashboard/DashboardHeader.tsx`
- `components/dashboard/GenerateReportButton.tsx`
- `components/dashboard/EmptyState.tsx`
- `components/dashboard/GeneratingState.tsx`
- `lib/hooks/useReports.ts`

