# F008 - Visualización de Reportes

**Estado:** 🔴 Pendiente  
**Prioridad:** 🔥 Alta  
**Dependencias:** F006 (Generación de Reportes)  
**Estimación:** 1 día

---

## 📋 Descripción

Componentes para visualizar reportes de inteligencia competitiva de manera clara y profesional. Incluye formateo de Markdown, listas expandibles, y una interfaz fácil de leer.

---

## 🎯 Objetivos

- Renderizar contenido Markdown de los reportes
- Crear diseño atractivo y fácil de leer
- Implementar lista de reportes con acordeones
- Agregar funcionalidad de exportar/compartir
- Mostrar metadatos (fecha, estado, duración)
- Responsive design

---

## 🎨 Diseño y UX

### Vista de Lista de Reportes

```
┌─────────────────────────────────────────────────┐
│  📋 Tus Reportes (3)                           │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 📊 Reporte del 24 de Octubre 2025       ▼│ │
│  │ ✅ Completado • Hace 2 horas              │ │
│  ├───────────────────────────────────────────┤ │
│  │                                           │ │
│  │ # Reporte de Inteligencia Competitiva    │ │
│  │                                           │ │
│  │ ## 📊 Resumen Ejecutivo                  │ │
│  │ Durante los últimos 7 días...            │ │
│  │                                           │ │
│  │ ## 🏢 Actividad de Competidores          │ │
│  │ ...                                       │ │
│  │                                           │ │
│  │ [📥 Descargar PDF] [📋 Copiar]           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 📊 Reporte del 23 de Octubre 2025       ▶│ │
│  │ ✅ Completado • Hace 1 día                │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ Implementación Técnica

### Lista de Reportes

#### `components/dashboard/ReportsList.tsx`
```typescript
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ReportCard } from './ReportCard'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import type { Report } from '@/types/database'

interface ReportsListProps {
  reports: Report[]
  onRefresh: () => void
}

export function ReportsList({ reports, onRefresh }: ReportsListProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          📋 Tus Reportes ({reports.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Lista de reportes */}
      <div className="space-y-4">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* Paginación futura */}
      {reports.length >= 10 && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Cargar más reportes
          </Button>
        </div>
      )}
    </div>
  )
}
```

### Tarjeta de Reporte

#### `components/dashboard/ReportCard.tsx`
```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Download, Copy, ChevronDown, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ReportContent } from './ReportContent'
import type { Report } from '@/types/database'

interface ReportCardProps {
  report: Report
}

export function ReportCard({ report }: ReportCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (report.content) {
      await navigator.clipboard.writeText(report.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (!report.content) return

    const blob = new Blob([report.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${new Date(report.created_at).toLocaleDateString('es')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = () => {
    switch (report.status) {
      case 'COMPLETED':
        return (
          <Badge variant="success" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completado
          </Badge>
        )
      case 'PENDING':
      case 'PROCESSING':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1 animate-pulse" />
            En proceso
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
    }
  }

  const formattedDate = formatDistanceToNow(new Date(report.created_at), {
    addSuffix: true,
    locale: es
  })

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={report.id} className="border rounded-lg">
        <Card className="border-0">
          <AccordionTrigger className="hover:no-underline px-6 py-4">
            <div className="flex items-start justify-between w-full mr-2">
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reporte del {new Date(report.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {getStatusBadge()}
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <CardContent className="pt-0 px-6 pb-6">
              {report.status === 'COMPLETED' && report.content ? (
                <>
                  {/* Acciones */}
                  <div className="flex items-center space-x-2 mb-6 pb-4 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>

                  {/* Contenido del reporte */}
                  <ReportContent content={report.content} />
                </>
              ) : report.status === 'FAILED' ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-900 font-semibold mb-2">
                    Error al generar reporte
                  </p>
                  <p className="text-sm text-gray-600">
                    {report.error_message || 'Ocurrió un error inesperado'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-900 font-semibold mb-2">
                    Reporte en proceso
                  </p>
                  <p className="text-sm text-gray-600">
                    Tu reporte se está generando. Esto puede tomar unos minutos.
                  </p>
                </div>
              )}
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  )
}
```

### Renderizador de Contenido Markdown

#### `components/dashboard/ReportContent.tsx`
```typescript
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ReportContentProps {
  content: string
}

export function ReportContent({ content }: ReportContentProps) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-6 flex items-center" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-700 leading-relaxed mb-4" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props} />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props} />
            ),
          a: ({ node, ...props }) => (
            <a className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-gray-200" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

---

## 📦 Dependencias

```bash
# React Markdown para renderizar contenido
npm install react-markdown remark-gfm

# date-fns para formateo de fechas
npm install date-fns

# Componentes shadcn/ui
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add badge
```

---

## 🎨 Estilos de Prose

### Configuración de Tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

---

## 🧪 Testing

### Casos de Prueba

1. **Renderizado de Markdown**
   - Verificar todos los elementos (headings, listas, links, etc.)
   - Verificar emojis se renderizan correctamente
   - Verificar code blocks

2. **Interacciones**
   - Expandir/colapsar acordeón
   - Copiar contenido al portapapeles
   - Descargar como archivo .md

3. **Estados**
   - Reporte completado
   - Reporte en proceso
   - Reporte con error
   - Lista vacía

4. **Responsive**
   - Mobile (320px+)
   - Tablet (768px+)
   - Desktop (1024px+)

---

## ♿ Accesibilidad

- Usar etiquetas semánticas apropiadas
- ARIA labels para acciones
- Contraste de colores adecuado (WCAG AA)
- Navegación por teclado funcional
- Screen reader friendly

---

## ✅ Checklist de Implementación

- [ ] Instalar dependencias (react-markdown, date-fns)
- [ ] Crear componente `ReportsList`
- [ ] Crear componente `ReportCard`
- [ ] Crear componente `ReportContent`
- [ ] Agregar componentes shadcn/ui necesarios
- [ ] Configurar estilos de Tailwind Typography
- [ ] Implementar acciones (copiar, descargar)
- [ ] Testing de renderizado Markdown
- [ ] Testing responsive
- [ ] Verificar accesibilidad
- [ ] Optimizar rendimiento

---

## 🔗 Archivos Relacionados

- `components/dashboard/ReportsList.tsx`
- `components/dashboard/ReportCard.tsx`
- `components/dashboard/ReportContent.tsx`
- `app/dashboard/page.tsx` (integración)

---

## 🔗 Recursos

- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [date-fns](https://date-fns.org/)

