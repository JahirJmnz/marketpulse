# 📚 Documentación de MarketPulse

Bienvenido a la documentación completa del proyecto **MarketPulse** - Tu dashboard de inteligencia competitiva con IA.

---

## 📋 Tabla de Contenidos

### 🎯 Documentación Principal

1. **[Idea General](./idea-general.md)** - Concepto completo del proyecto
   - Resumen del producto
   - Historias de usuario
   - Stack tecnológico
   - Arquitectura detallada
   - Guías de implementación

2. **[Registro de Progreso](./PROGRESS.md)** - Estado actual del proyecto
   - Progreso general
   - Fases del proyecto
   - Features por estado
   - Configuraciones necesarias
   - Próximos pasos

### 🔧 Features del Proyecto

3. **[Índice de Features](./features/README.md)** - Catálogo completo de funcionalidades

#### Features Individuales

| ID | Nombre | Descripción | Tiempo |
|----|--------|-------------|---------|
| [F001](./features/F001-perfil-empresa.md) | Configuración de Perfil | Formulario de onboarding para configurar empresa | 1 día |
| [F002](./features/F002-base-datos.md) | Base de Datos Supabase | Configuración de PostgreSQL y tablas | 0.5 días |
| [F003](./features/F003-sesiones.md) | Sistema de Sesiones | Manejo de sesiones con localStorage | 0.5 días |
| [F004](./features/F004-integracion-saptiva.md) | Integración Saptiva | Cliente de IA y sistema de prompts | 1.5 días |
| [F005](./features/F005-integracion-tavily.md) | Integración Tavily | Búsqueda web inteligente | 1 día |
| [F006](./features/F006-generacion-reportes.md) | Generación de Reportes | Flujo completo de generación con IA | 2 días |
| [F007](./features/F007-dashboard.md) | Dashboard Principal | Interfaz principal del usuario | 1.5 días |
| [F008](./features/F008-visualizacion-reportes.md) | Visualización de Reportes | Renderizado y display de reportes | 1 día |

### 🗄️ Base de Datos

4. **[Migraciones SQL](./features/sql/README.md)** - Scripts SQL para configurar la base de datos
   - [001_create_profiles.sql](./features/sql/001_create_profiles.sql)
   - [002_create_reports.sql](./features/sql/002_create_reports.sql)
   - [003_create_triggers.sql](./features/sql/003_create_triggers.sql)
   - [004_rls_policies.sql](./features/sql/004_rls_policies.sql)

---

## 🚀 Inicio Rápido

### 1. Configuración Inicial

```bash
# Clonar el repositorio (si aplica)
git clone <repo-url>
cd marketpulse

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus API keys
```

### 2. Configurar Supabase

1. Crear proyecto en [Supabase](https://app.supabase.com)
2. Ir a SQL Editor
3. Ejecutar scripts SQL en orden:
   - `001_create_profiles.sql`
   - `002_create_reports.sql`
   - `003_create_triggers.sql`
   - `004_rls_policies.sql`
4. Copiar URL y API keys a `.env.local`

### 3. Obtener API Keys

- **Saptiva:** [https://saptiva.ai](https://saptiva.ai)
- **Tavily:** [https://tavily.com](https://tavily.com)

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 📊 Estructura del Proyecto

```
marketpulse/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── profiles/           # Gestión de perfiles
│   │   └── reports/            # Gestión de reportes
│   ├── dashboard/              # Dashboard principal
│   └── page.tsx                # Landing page
├── components/                  # Componentes React
│   ├── ui/                     # shadcn/ui componentes
│   ├── forms/                  # Formularios
│   ├── dashboard/              # Componentes del dashboard
│   └── auth/                   # Protección de rutas
├── lib/                        # Utilidades y lógica
│   ├── ai/                     # Integración de IA
│   │   ├── saptiva.ts         # Cliente Saptiva
│   │   ├── tavily.ts          # Cliente Tavily
│   │   ├── prompts.ts         # Sistema de prompts
│   │   └── analysis.ts        # Funciones de análisis
│   ├── db/                     # Base de datos
│   │   ├── supabase.ts        # Cliente Supabase
│   │   └── queries.ts         # Queries reutilizables
│   ├── hooks/                  # React Hooks
│   │   ├── useSession.ts      # Manejo de sesión
│   │   └── useReports.ts      # Manejo de reportes
│   └── utils.ts               # Utilidades generales
├── types/                      # TypeScript types
│   ├── database.ts            # Tipos de base de datos
│   ├── ai.ts                  # Tipos de IA
│   └── reports.ts             # Tipos de reportes
└── docs/                       # Documentación (estás aquí)
    ├── README.md              # Este archivo
    ├── idea-general.md        # Concepto del proyecto
    ├── PROGRESS.md            # Registro de progreso
    └── features/              # Documentación de features
        ├── README.md          # Índice de features
        ├── F001-*.md          # Feature 1
        ├── F002-*.md          # Feature 2
        └── sql/               # Scripts SQL
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI:** React 19
- **Estilos:** Tailwind CSS
- **Componentes:** shadcn/ui
- **Markdown:** react-markdown

### Backend
- **Runtime:** Node.js
- **API Routes:** Next.js API Routes
- **Base de Datos:** Supabase (PostgreSQL)

### IA y Búsqueda
- **Orquestador:** Vercel AI SDK
- **Modelos de IA:** Saptiva (Llama, Claude)
- **Búsqueda Web:** Tavily API

### Desarrollo
- **Lenguaje:** TypeScript
- **Validación:** Zod
- **Formateo de Fechas:** date-fns
- **Linting:** ESLint

---

## 📖 Guías de Desarrollo

### Cómo Agregar una Nueva Feature

1. Crear documentación en `docs/features/`
2. Seguir el template de las features existentes
3. Actualizar el índice en `features/README.md`
4. Actualizar progreso en `PROGRESS.md`
5. Implementar siguiendo la documentación
6. Actualizar checklist al completar

### Convenciones de Código

#### Nombres de Archivos
```
PascalCase.tsx      # Componentes React
camelCase.ts        # Utilidades y módulos
useHookName.ts      # React Hooks
```

#### Estructura de Componentes
```typescript
'use client' // Si usa interactividad

import { ... } from '...'

interface ComponentProps {
  // Props tipadas con TypeScript
}

export function Component({ prop }: ComponentProps) {
  // Hooks primero
  // Lógica de negocio
  // Return JSX
}
```

#### Commits
```
feat: agregar componente de dashboard
fix: corregir error en generación de reportes
docs: actualizar documentación de features
refactor: optimizar búsqueda de competidores
test: agregar tests para análisis de IA
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### Estrategia de Testing

- **Unitarios:** Funciones de utilidad, hooks
- **Integración:** API routes, base de datos
- **E2E:** Flujos completos de usuario

---

## 📈 Roadmap

### ✅ Fase 0: Planificación (Completada)
- [x] Documentación de concepto
- [x] Definición de arquitectura
- [x] Documentación de features

### 🔄 Fase 1: Configuración Base (En Progreso)
- [ ] Configurar Supabase
- [ ] Obtener API keys
- [ ] Setup de proyecto

### ⏳ Fase 2-4: Implementación (Pendiente)
Ver [PROGRESS.md](./PROGRESS.md) para detalles

---

## 🤝 Contribución

### Workflow

1. Crear branch para feature: `git checkout -b feature/F001-perfil`
2. Implementar siguiendo documentación
3. Actualizar checklist en feature doc
4. Commit cambios con mensaje descriptivo
5. Crear Pull Request

### Code Review

- Verificar que sigue convenciones
- Verificar tests pasan
- Verificar documentación actualizada
- Verificar no hay errores de linting

---

## 🔗 Enlaces Útiles

### Documentación Externa
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Saptiva Docs](https://saptiva.gitbook.io/saptiva-docs/)
- [Tavily Docs](https://docs.tavily.com/)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Recursos de Aprendizaje
- [Next.js Learn](https://nextjs.org/learn)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

## ❓ FAQ

### ¿Por qué no hay autenticación?
Para el MVP priorizamos velocidad. El sistema de localStorage es suficiente para desarrollo local.

### ¿Cómo escala esto?
El MVP está diseñado para localhost. Para producción, se necesitaría:
- Autenticación real (Supabase Auth)
- Deployment (Vercel)
- Queue system para reportes (BullMQ, Inngest)
- Rate limiting
- Caching (Redis)

### ¿Cuánto cuesta ejecutar esto?
- **Supabase Free tier:** Suficiente para desarrollo
- **Saptiva:** Depende del uso, ~$0.01-0.10 por reporte
- **Tavily:** ~100 búsquedas gratis, luego $1 por 1000 búsquedas

### ¿Puedo usar otros modelos de IA?
Sí, el diseño es modular. Puedes cambiar Saptiva por OpenAI, Anthropic, etc. modificando `lib/ai/saptiva.ts`.

---

## 📞 Soporte

### Encontraste un bug?
1. Verificar que no sea un problema de configuración
2. Revisar documentación de la feature relacionada
3. Crear issue con descripción detallada

### Tienes una pregunta?
1. Revisar esta documentación
2. Revisar [idea-general.md](./idea-general.md)
3. Revisar documentación de la feature específica
4. Consultar documentación externa de las APIs

---

## 📝 Licencia

[Agregar información de licencia aquí]

---

## 👥 Equipo

[Agregar información del equipo aquí]

---

**Última Actualización:** 24 de Octubre de 2025  
**Versión:** 1.0.0  
**Estado del Proyecto:** 🔴 En Fase de Inicialización

