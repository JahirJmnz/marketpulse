### **1. Resumen del Producto (MVP)**

Un dashboard web que corre en localhost donde un usuario configura su perfil de empresa una sola vez. Luego, cada día, puede entrar y, con un solo clic, generar un reporte de inteligencia competitiva sobre sus rivales, basado en la actividad web de las últimas 24 horas y se muestra en la interfaz cuando está listo.

---

### **2. Historias de Usuario (MVP)**

1.  **Configuración Inicial:**
    *   **Como** un nuevo usuario,
    *   **quiero** introducir el nombre y la descripción de mi empresa,
    *   **para que** el sistema pueda identificar a mis competidores y generar análisis relevantes para mi contexto.

2.  **Generación de Reporte:**
    *   **Como** un usuario configurado,
    *   **quiero** presionar un botón para generar un reporte de inteligencia del día,
    *   **para que** pueda obtener un resumen accionable de los movimientos de mis competidores sin tener que investigar manualmente.

3.  **Visualización de Reporte:**
    *   **Como** un usuario que ha solicitado un reporte,
    *   **quiero** ver el informe generado en una interfaz limpia y fácil de leer,
    *   **para que** pueda consumir la información de manera rápida y eficiente.

---

### **3. Stack Tecnológico Detallado**

*   **Framework:** Next.js (App Router)
*   **Estilos:** Tailwind CSS con shadcn/ui para componentes pre-construidos y accesibles.
*   **IA y Búsqueda:**
    *   **Orquestador de IA:** Vercel AI SDK.
    *   **Motor de Búsqueda:** Tavily API (usaremos el endpoint `/search`).
    *   **Modelos de Razonamiento:** Modelos de Saptiva (a tu eleccion): 
https://saptiva.gitbook.io/saptiva-docs/basicos/modelos-disponibles
https://saptiva.gitbook.io/saptiva-docs/basicos/api-reference


*   **Base de Datos:** Supabase (Postgres) para guardar perfiles de usuario y los reportes generados.
*   **Tareas en Segundo Plano:** Procesamiento local en localhost
*   **Deployment:** Aplicación completa corriendo en localhost (http://localhost:3000)

---

### **3.1. Entorno de Desarrollo Local**

**Configuración del Entorno:**
- **Aplicación Next.js**: `http://localhost:3000`
- **Base de datos**: Supabase (cloud) - accesible desde localhost
- **APIs externas**: Saptiva y Tavily (cloud) - accesibles desde localhost
- **Procesamiento**: Todo el análisis de IA se ejecuta localmente
- **Almacenamiento**: Perfiles y reportes se guardan en Supabase (cloud)

**Ventajas del Desarrollo Local:**
- **Sin límites de tiempo**: No hay restricciones de timeout de Vercel
- **Procesamiento completo**: Los reportes se generan completamente en localhost
- **Debugging fácil**: Acceso directo a logs y errores
- **Desarrollo rápido**: Cambios inmediatos sin deployment

---

### **3.2. Arquitectura de IA y Flujo de Datos**

#### **A. Vercel AI SDK - Orquestación de IA**

El **Vercel AI SDK** actúa como el orquestador principal que coordina todo el flujo de generación de reportes:

**Funciones Principales:**
- **Streaming de Respuestas:** Maneja la comunicación en tiempo real con los modelos de IA
- **Gestión de Estado:** Controla el estado de las conversaciones y el contexto
- **Integración Multi-Modelo:** Permite usar diferentes modelos según la tarea específica
- **Manejo de Errores:** Gestiona fallos y reintentos automáticos

**Implementación:**
```typescript
// Ejemplo de uso del Vercel AI SDK con Saptiva
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Saptiva es compatible con OpenAI API
const saptiva = createOpenAI({
  apiKey: process.env.SAPTIVA_API_KEY,
  baseURL: 'https://api.saptiva.com/v1',
})

// Para análisis de competencia
const analysis = await generateText({
  model: saptiva('Saptiva Turbo'),  // Modelo rápido para extracción
  messages: [
    {
      role: 'system',
      content: 'Eres un analista de inteligencia competitiva.'
    },
    {
      role: 'user',
      content: `Analiza la información de competencia para ${companyName}...`
    }
  ]
})
```

#### **B. Saptiva - Modelos de Razonamiento**

**Saptiva** proporciona los modelos de IA que realizan el análisis inteligente:

**Modelos Recomendados (Saptiva):**
- **`Saptiva Turbo`** (Qwen 3:30B): Para análisis general y síntesis rápida ($0.2/$0.6 por millón)
- **`Saptiva Cortex`** (Qwen 3:30B Think): Para análisis complejos con razonamiento ($0.30/$0.8 por millón)
- **`Saptiva Legacy`** (LLama 3.3:70B): Para reportes ejecutivos detallados ($0.2/$0.6 por millón)

**Casos de Uso por Modelo:**
1. **Identificación de Competidores:** Usar `Saptiva Turbo` para extraer competidores relevantes (rápido y económico)
2. **Análisis de Tendencias:** Usar `Saptiva Cortex` para análisis profundo de datos (mejor razonamiento)
3. **Generación de Reportes:** Usar `Saptiva Legacy` para crear reportes estructurados y accionables (contexto largo)

**Documentación oficial:** https://saptiva.gitbook.io/saptiva-docs/basicos/modelos-disponibles

#### **C. Tavily API - Motor de Búsqueda**

**Tavily** se encarga de recopilar información actualizada de la web:

**Flujo de Búsqueda:**
1. **Búsqueda Inicial:** Identifica competidores basándose en la descripción de la empresa
2. **Búsqueda Específica:** Busca noticias y actualizaciones de cada competidor
3. **Filtrado Temporal:** Se enfoca en información de las últimas 24 horas
4. **Agregación:** Combina resultados de múltiples fuentes

**Configuración de Búsqueda:**
```typescript
// Ejemplo de configuración Tavily
const searchConfig = {
  query: `${companyName} competidores noticias`,
  search_depth: "advanced",
  include_answer: true,
  include_raw_content: false,
  max_results: 10,
  include_domains: ["techcrunch.com", "forbes.com", "bloomberg.com"]
}
```

---

### **3.2. Estructura de la Aplicación**

#### **A. Arquitectura de Carpetas**

```
marketpulse/
├── app/
│   ├── api/                    # API Routes
│   │   ├── reports/           # Endpoints de reportes
│   │   │   ├── generate/       # POST: Generar nuevo reporte
│   │   │   └── [id]/          # GET: Obtener reporte específico
│   │   └── profiles/          # Endpoints de perfiles
│   ├── dashboard/             # Dashboard principal
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/                # Componentes reutilizables
│   ├── ui/                    # Componentes shadcn/ui
│   ├── forms/                 # Formularios
│   │   ├── CompanyForm.tsx
│   │   └── ReportForm.tsx
│   ├── dashboard/             # Componentes del dashboard
│   │   ├── ReportCard.tsx
│   │   ├── ReportList.tsx
│   │   └── GenerateButton.tsx
│   └── layout/                # Componentes de layout
│       ├── Header.tsx
│       └── Sidebar.tsx
├── lib/                       # Utilidades y configuración
│   ├── ai/                    # Configuración de IA
│   │   ├── saptiva.ts        # Cliente Saptiva
│   │   ├── tavily.ts         # Cliente Tavily
│   │   └── prompts.ts        # Prompts del sistema
│   ├── db/                    # Configuración de base de datos
│   │   ├── supabase.ts
│   │   └── types.ts
│   └── utils.ts
├── types/                     # Tipos TypeScript
│   ├── database.ts
│   ├── ai.ts
│   └── reports.ts
└── docs/                      # Documentación
    └── idea-general.md
```

#### **B. Flujo de Generación de Reportes**

```mermaid
graph TD
    A[Usuario hace clic en "Generar Reporte"] --> B[API Route: /api/reports/generate]
    B --> C[Crear registro en DB con status: PENDING]
    C --> D[Iniciar proceso en background]
    D --> E[Buscar competidores con Tavily]
    E --> F[Recopilar noticias recientes]
    F --> G[Analizar con Saptiva]
    G --> H[Generar reporte estructurado]
    H --> I[Guardar reporte en DB]
    I --> J[Actualizar status: COMPLETED]
    J --> K[Notificar al frontend]
    K --> L[Mostrar reporte al usuario]
```

#### **C. Componentes Clave**

**1. CompanyForm.tsx**
- Formulario de configuración inicial
- Validación de campos requeridos
- Integración con Supabase

**2. GenerateButton.tsx**
- Botón principal para generar reportes
- Estados: idle, loading, success, error
- Polling para verificar estado del reporte

**3. ReportCard.tsx**
- Visualización de reportes individuales
- Formateo de Markdown
- Fechas y metadatos

**4. ReportList.tsx**
- Lista de reportes históricos
- Ordenamiento por fecha
- Paginación (futuro)

#### **D. API Routes Específicas**

**POST /api/reports/generate**
```typescript
// Genera un nuevo reporte
export async function POST(request: Request) {
  const { profileId } = await request.json()
  
  // 1. Crear registro en DB
  const report = await createReport(profileId)
  
  // 2. Iniciar proceso en background
  generateReportInBackground(report.id, profileId)
  
  return Response.json({ reportId: report.id })
}
```

**GET /api/reports/[id]**
```typescript
// Obtiene un reporte específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const report = await getReport(params.id)
  return Response.json(report)
}
```

**GET /api/reports/status/[id]**
```typescript
// Verifica el estado de un reporte
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const status = await getReportStatus(params.id)
  return Response.json({ status })
}
```

---

### **3.3. Implementación Técnica Detallada**

#### **A. Configuración de Prompts del Sistema**

**1. Prompt para Identificación de Competidores:**
```typescript
const COMPETITOR_IDENTIFICATION_PROMPT = `
Eres un analista de inteligencia competitiva especializado. 
Basándote en la siguiente información de la empresa:
- Nombre: ${companyName}
- Descripción: ${companyDescription}

Identifica los 5-7 competidores más relevantes en su mercado. 
Considera:
- Competidores directos (mismo producto/servicio)
- Competidores indirectos (solucionan el mismo problema)
- Competidores emergentes
- Empresas de mayor escala que podrían expandirse a este nicho

Responde en formato JSON con la siguiente estructura:
{
  "competitors": [
    {
      "name": "Nombre de la empresa",
      "type": "direct|indirect|emerging|potential",
      "reason": "Por qué es relevante como competidor"
    }
  ]
}
`
```

**2. Prompt para Análisis de Tendencias:**
```typescript
const TREND_ANALYSIS_PROMPT = `
Analiza las siguientes noticias y actualizaciones de los últimos 7 días sobre los competidores:
${competitorNews}

Identifica:
1. Tendencias emergentes en el sector
2. Movimientos estratégicos de competidores
3. Oportunidades de mercado
4. Amenazas potenciales
5. Patrones de comportamiento del mercado

Formato de respuesta en Markdown estructurado.
`
```

**3. Prompt para Generación de Reportes:**
```typescript
const REPORT_GENERATION_PROMPT = `
Genera un reporte ejecutivo de inteligencia competitiva basado en:

Empresa objetivo: ${companyName}
Análisis de competidores: ${competitorAnalysis}
Tendencias del mercado: ${marketTrends}
Noticias relevantes: ${relevantNews}

El reporte debe incluir:
1. **Resumen Ejecutivo** (2-3 párrafos)
2. **Movimientos Clave de Competidores** (lista con detalles)
3. **Tendencias Emergentes** (análisis de patrones)
4. **Oportunidades Identificadas** (recomendaciones accionables)
5. **Amenazas Potenciales** (riesgos a monitorear)
6. **Próximos Pasos Recomendados** (acciones específicas)

Usa un tono profesional pero accesible. Incluye datos específicos y fechas cuando sea relevante.
`
```

#### **B. Configuración de Variables de Entorno**

```bash
# .env.local
# Saptiva Configuration
SAPTIVA_API_KEY=your_saptiva_api_key_here

# Tavily Configuration  
TAVILY_API_KEY=your_tavily_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration (Desarrollo Local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### **C. Tipos TypeScript**

```typescript
// types/database.ts
export interface Profile {
  id: string
  company_name: string
  company_description: string
  created_at: string
}

export interface Report {
  id: string
  profile_id: string
  content: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  created_at: string
  completed_at?: string
}

// types/ai.ts
export interface Competitor {
  name: string
  type: 'direct' | 'indirect' | 'emerging' | 'potential'
  reason: string
}

export interface CompetitorAnalysis {
  competitors: Competitor[]
  market_trends: string[]
  opportunities: string[]
  threats: string[]
}

// types/reports.ts
export interface ReportContent {
  executive_summary: string
  key_movements: Array<{
    competitor: string
    movement: string
    impact: 'high' | 'medium' | 'low'
    date: string
  }>
  emerging_trends: string[]
  opportunities: string[]
  threats: string[]
  next_steps: string[]
}
```

#### **D. Funciones de Utilidad**

```typescript
// lib/ai/prompts.ts
export const createCompetitorPrompt = (companyName: string, description: string) => {
  return `Identifica competidores para ${companyName}: ${description}`
}

export const createAnalysisPrompt = (competitors: Competitor[], news: any[]) => {
  return `Analiza estos competidores y noticias: ${JSON.stringify({competitors, news})}`
}

// lib/ai/saptiva.ts
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const saptiva = createOpenAI({
  apiKey: process.env.SAPTIVA_API_KEY!,
  baseURL: 'https://api.saptiva.com/v1',
})

export const analyzeCompetitors = async (companyName: string, description: string) => {
  const prompt = createCompetitorPrompt(companyName, description)
  
  const result = await generateText({
    model: saptiva('Saptiva Turbo'),
    messages: [
      {
        role: 'system',
        content: 'Eres un analista de inteligencia competitiva.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    maxTokens: 600
  })
  
  return JSON.parse(result.text)
}

// lib/ai/tavily.ts
export const searchCompetitorNews = async (competitorName: string) => {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
    },
    body: JSON.stringify({
      query: `${competitorName} noticias actualizaciones`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 5,
      include_domains: ['techcrunch.com', 'forbes.com', 'bloomberg.com', 'reuters.com']
    })
  })
  
  return response.json()
}
```

---

### **4. Flujo del Usuario y Experiencia (UX)**

#### **Fase 1: Onboarding (Primera Visita)**

1.  **Pantalla de Bienvenida:** El usuario llega a la página principal. Es minimalista.
    *   **UX:** Un título claro: "Tu Analista de Competencia Personal".
    *   **Componentes (shadcn/ui):** `Card` con `CardHeader`, `CardTitle`, `CardDescription` y `CardContent`.
    *   **Acción:** El usuario introduce el nombre de su empresa (`Input`) y una descripción de su producto/mercado (`Textarea`). Un `Button` ("Guardar y Continuar") está deshabilitado hasta que ambos campos estén llenos.
2.  **Guardado y Redirección:**
    *   **UX:** Al hacer clic, el botón muestra un `Loader` (spinner). La información se guarda en Supabase. Se crea un identificador único para este "perfil" y se guarda en `localStorage` (sin necesidad de autenticación). El usuario es redirigido al dashboard principal.

#### **Fase 2: El Dashboard (Uso Diario)**

1.  **Estado Vacío:** La primera vez que llega, el dashboard es simple.
    *   **UX:** Un título: "Tu Dashboard de Inteligencia". Un área principal con un mensaje: "No has generado ningún reporte todavía".
    *   **Componentes (shadcn/ui):** Un gran `Button` prominente en el centro: **"✨ Generar el reporte de hoy"**.
2.  **Solicitud del Reporte:**
    *   **UX:** El usuario hace clic en el botón. El botón entra en estado de carga y se deshabilita. Debajo, aparece un `Alert` informativo:
        > **"Estamos generando tu reporte...** Tu análisis personalizado está en proceso. Esto puede tardar entre 1 y 2 minutos. La página se actualizará automáticamente cuando esté listo."
    *   **La clave de la UX aquí es gestionar la expectativa.** El usuario sabe que el proceso no es instantáneo pero que no necesita esperar activamente ni recargar la página.
3.  **Estado Lleno y Visualización:**
    *   **UX:** Una vez que el reporte está listo, la página se actualiza (usando SWR o React Query para revalidar los datos). El área principal ahora muestra una lista de reportes generados, con el más reciente arriba.
    *   **Componentes (shadcn/ui):** Se muestra un `Accordion`. El `AccordionTrigger` dice "Reporte del 24 de Octubre de 2025". Al hacer clic, el `AccordionContent` se expande y muestra el reporte formateado en Markdown (títulos, negritas, listas).

---

### **5. Documentación y Arquitectura para el Desarrollo**

#### **A. Configuración de la Base de Datos (Supabase)**

Necesitarás dos tablas simples:

1.  **`profiles`**
    *   `id` (uuid, primary key)
    *   `company_name` (text)
    *   `company_description` (text)
    *   `created_at` (timestamp)
2.  **`reports`**
    *   `id` (uuid, primary key)
    *   `profile_id` (uuid, foreign key to `profiles.id`)
    *   `content` (text, contendrá el Markdown del reporte)
    *   `status` (enum: 'PENDING', 'COMPLETED', 'FAILED')
    *   `created_at` (timestamp)

#### **B. Manejo de Sesiones Sin Autenticación**

**Estrategia Simple para MVP:**
- **Identificación por localStorage**: Cada usuario se identifica por un UUID único guardado en `localStorage`
- **Sin contraseñas**: No hay sistema de login/registro
- **Persistencia local**: El perfil se mantiene en el navegador del usuario
- **Acceso directo**: Los usuarios pueden acceder directamente a su dashboard si tienen un perfil guardado

**Implementación:**
```typescript
// lib/session.ts
export const getOrCreateProfileId = (): string => {
  let profileId = localStorage.getItem('marketpulse_profile_id')
  
  if (!profileId) {
    profileId = crypto.randomUUID()
    localStorage.setItem('marketpulse_profile_id', profileId)
  }
  
  return profileId
}

export const getStoredProfile = () => {
  const profileData = localStorage.getItem('marketpulse_profile_data')
  return profileData ? JSON.parse(profileData) : null
}

export const storeProfile = (profile: any) => {
  localStorage.setItem('marketpulse_profile_data', JSON.stringify(profile))
}
```

**Flujo de Usuario Simplificado:**
1. **Primera visita**: Usuario llena formulario → Se crea perfil en DB → Se guarda ID en localStorage
2. **Visitas posteriores**: Se detecta ID en localStorage → Se carga perfil automáticamente
3. **Cambio de perfil**: Usuario puede "resetear" borrando localStorage y empezar de nuevo

#### **C. Proceso de Desarrollo Recomendado**

**Fase 1: Configuración Base (Días 1-2)**
1. Configurar Next.js con App Router
2. Instalar y configurar shadcn/ui
3. Configurar Supabase y crear tablas
4. Configurar variables de entorno

**Fase 2: Backend y IA (Días 3-5)**
1. Implementar clientes de Saptiva y Tavily
2. Crear API routes para reportes
3. Implementar sistema de prompts
4. Configurar procesamiento en background

**Fase 3: Frontend (Días 6-8)**
1. Crear formulario de configuración inicial
2. Implementar dashboard principal
3. Crear componentes de visualización de reportes
4. Implementar polling para actualizaciones

**Fase 4: Testing y Refinamiento (Días 9-10)**
1. Testing de flujo completo
2. Optimización de prompts
3. Mejoras de UX
4. Documentación final

#### **D. Consideraciones Técnicas Importantes**

**1. Manejo de Errores:**
- Implementar retry logic para llamadas a APIs externas
- Logging detallado para debugging
- Fallbacks cuando los servicios de IA no están disponibles
- Validación de datos en cada paso del proceso

**2. Optimización de Costos:**
- Cache de resultados de búsqueda para evitar llamadas duplicadas
- Límites en el número de competidores analizados
- Optimización de prompts para reducir tokens
- Monitoreo de uso de APIs

**3. Escalabilidad:**
- Implementar rate limiting en API routes
- Queue system para procesamiento de reportes
- Optimización de consultas a base de datos
- Considerar implementar Redis para cache

**4. Seguridad (Sin Autenticación):**
- Validación de inputs en todos los endpoints
- Sanitización de datos antes de guardar en DB
- Rate limiting por IP (no por usuario)
- Validación de API keys
- Validación de que el profile_id existe en la base de datos
- Límites en el número de reportes por perfil por día

#### **E. Recursos y Documentación**

*   **Next.js:** [https://nextjs.org/docs](https://nextjs.org/docs)
*   **Vercel AI SDK:** [https://sdk.vercel.ai/docs](https://sdk.vercel.ai/docs)
*   **Tavily API:** [https://docs.tavily.com/](https://docs.tavily.com/)
*   **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
*   **shadcn/ui:** [https://ui.shadcn.com/docs](https://ui.shadcn.com/docs)
*   **Saptiva Docs:** [https://saptiva.gitbook.io/saptiva-docs/](https://saptiva.gitbook.io/saptiva-docs/)

#### **F. Checklist de Implementación**

**Backend:**
- [ ] Configurar Supabase y crear tablas
- [ ] Implementar clientes de Saptiva y Tavily
- [ ] Crear API routes para reportes
- [ ] Implementar sistema de prompts
- [ ] Configurar procesamiento en background
- [ ] Implementar manejo de sesiones con localStorage

**Frontend:**
- [ ] Crear formulario de configuración inicial
- [ ] Implementar dashboard principal
- [ ] Crear componentes de visualización
- [ ] Implementar polling para actualizaciones
- [ ] Configurar manejo de estados de carga

**Testing:**
- [ ] Testing de flujo completo
- [ ] Testing de manejo de errores
- [ ] Testing de performance
- [ ] Testing de UX en diferentes dispositivos

**Desarrollo Local:**
- [ ] Configurar variables de entorno para localhost
- [ ] Testing en ambiente de desarrollo local
- [ ] Configurar logging local
- [ ] Documentación de setup local

