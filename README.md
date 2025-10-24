# 🎯 MarketPulse

**Tu Analista de Competencia Personal impulsado por IA**

Dashboard web que genera reportes diarios de inteligencia competitiva automáticamente usando IA, analizando la actividad web de tus competidores en las últimas 24 horas.

---

## 🚀 Estado del Proyecto

### ✅ Fase 1 Completada: Fundación

- ✅ **F001**: Configuración de Perfil de Empresa
- ✅ **F002**: Base de Datos Supabase  
- ✅ **F003**: Sistema de Sesiones (localStorage)

### 🔄 Próximas Features

- ⏳ **F004**: Integración con Saptiva AI
- ⏳ **F005**: Integración con Tavily Search
- ⏳ **F006**: Generación de Reportes
- ⏳ **F007**: Dashboard Principal
- ⏳ **F008**: Visualización de Reportes

---

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en Supabase (gratis)
- Cuenta en Saptiva AI (para futuras features)
- Cuenta en Tavily (para futuras features)

---

## ⚡ Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

Sigue las instrucciones detalladas en [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md)

### 3. Crear archivo .env.local

```bash
# Copia el ejemplo y llena tus credenciales
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Opcional (por ahora)
SAPTIVA_API_KEY=
TAVILY_API_KEY=

# Configuración local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## 🏗️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **IA**: Vercel AI SDK + Saptiva
- **Búsqueda**: Tavily API
- **Validación**: Zod
- **Sesiones**: localStorage (MVP)

---

## 📁 Estructura del Proyecto

```
marketpulse/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React
│   ├── auth/             # Autenticación y protección
│   ├── forms/            # Formularios
│   └── ui/               # Componentes UI (shadcn)
├── lib/                  # Lógica de negocio
│   ├── db/              # Cliente y queries de Supabase
│   ├── hooks/           # Custom React hooks
│   └── session.ts       # Manejo de sesiones
├── types/               # Tipos TypeScript
└── docs/                # Documentación del proyecto
    └── features/        # Especificaciones de features
```

---

## 🎯 Funcionalidades Actuales

### ✅ Lo que ya funciona:

1. **Onboarding Completo**
   - Formulario de configuración de empresa
   - Validación en tiempo real
   - Guardado en base de datos

2. **Sistema de Sesiones**
   - Persistencia automática en el navegador
   - No requiere login/registro
   - Protección de rutas

3. **Dashboard Básico**
   - Visualización de información de la empresa
   - Estructura lista para mostrar reportes

---

## 📖 Documentación

- **[Idea General](./docs/idea-general.md)**: Visión completa del producto
- **[Setup Instructions](./SETUP_INSTRUCTIONS.md)**: Guía de configuración paso a paso
- **[Features](./docs/features/README.md)**: Especificaciones detalladas de cada feature
- **[Progress](./docs/PROGRESS.md)**: Registro del progreso del proyecto

---

## 🧪 Testing

### Testing Manual

```bash
# 1. Crear perfil
# Ve a http://localhost:3000 y llena el formulario

# 2. Verificar sesión
# Abre DevTools > Application > Local Storage
# Verifica: marketpulse_profile_id y marketpulse_profile_data

# 3. Verificar base de datos
# Ve a Supabase Dashboard > Table Editor > profiles
```

---

## 🔒 Seguridad

**⚠️ IMPORTANTE**: Esta es una versión MVP para desarrollo local.

- No tiene autenticación real
- Usa localStorage sin encriptación
- Las políticas RLS son permisivas
- No está listo para producción

Para producción se debe implementar:
- Autenticación con Supabase Auth
- Tokens JWT
- Políticas RLS restrictivas
- Rate limiting

---

## 🤝 Contribuir

Este es un proyecto personal en desarrollo. Si tienes sugerencias:

1. Revisa la documentación en `docs/`
2. Crea un issue describiendo tu sugerencia
3. Sigue las convenciones de código del proyecto

---

## 📝 Notas del MVP

### Limitaciones Conocidas:
- Sin multi-usuario
- Sin autenticación real
- Sin edición de perfil
- Sin eliminación de reportes
- Funciona solo en localhost

### Futuras Mejoras:
- Autenticación con email/password
- Deployment a producción
- Programación automática de reportes
- Exportar reportes a PDF
- Dashboard con gráficos interactivos
- Análisis de tendencias históricas

---

## 📞 Soporte

¿Problemas durante la configuración?

1. Revisa [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md)
2. Verifica que todas las variables de entorno están configuradas
3. Consulta la consola del navegador para errores
4. Verifica los logs de Supabase

---

## 📊 Progreso

**Última Actualización**: 24 de Octubre de 2025

- **Features Completadas**: 3/8 (37.5%)
- **Líneas de Código**: ~1,500
- **Tiempo Invertido**: ~2 días

---

## 📄 Licencia

Este proyecto es privado y de uso personal.

---

**Desarrollado con** ❤️ **usando IA y tecnologías modernas**

[Documentación](./docs/) | [Features](./docs/features/) | [Setup](./SETUP_INSTRUCTIONS.md)
