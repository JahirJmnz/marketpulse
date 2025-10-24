# 🚀 Instrucciones de Configuración - MarketPulse

## ✅ ¡Progreso Completado!

Has completado exitosamente la **Fase 1** del proyecto MarketPulse:

- ✅ **F002**: Base de Datos Supabase (código listo)
- ✅ **F003**: Sistema de Sesiones con localStorage
- ✅ **F001**: Formulario de Perfil de Empresa

---

## 🔧 Pasos Finales para Ejecutar la Aplicación

### 1. Crear Proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una nueva cuenta o inicia sesión
3. Haz clic en "New Project"
4. Llena los datos:
   - **Name**: `marketpulse` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala bien)
   - **Region**: Selecciona la región más cercana
5. Espera a que el proyecto se cree (toma ~2 minutos)

### 2. Ejecutar los Scripts SQL

Una vez creado el proyecto en Supabase:

1. Ve a **SQL Editor** en el panel izquierdo
2. Crea una nueva query y ejecuta los siguientes scripts en orden:

#### Script 1: Crear tabla de perfiles
```sql
-- Contenido de: docs/features/sql/001_create_profiles.sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

COMMENT ON TABLE profiles IS 'Perfiles de empresas configurados por los usuarios';
COMMENT ON COLUMN profiles.company_name IS 'Nombre de la empresa';
COMMENT ON COLUMN profiles.company_description IS 'Descripción del negocio y mercado de la empresa';
```

#### Script 2: Crear tabla de reportes
```sql
-- Contenido de: docs/features/sql/002_create_reports.sql
CREATE TYPE report_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  status report_status DEFAULT 'PENDING',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_reports_profile_id ON reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_profile_created ON reports(profile_id, created_at DESC);

COMMENT ON TABLE reports IS 'Reportes de inteligencia competitiva generados';
COMMENT ON COLUMN reports.profile_id IS 'Referencia al perfil de empresa';
COMMENT ON COLUMN reports.content IS 'Contenido del reporte en formato Markdown';
COMMENT ON COLUMN reports.status IS 'Estado actual del reporte: PENDING, PROCESSING, COMPLETED, FAILED';
COMMENT ON COLUMN reports.error_message IS 'Mensaje de error si el reporte falló';
COMMENT ON COLUMN reports.completed_at IS 'Fecha y hora cuando el reporte fue completado';
COMMENT ON COLUMN reports.metadata IS 'Metadatos adicionales en formato JSON';
```

#### Script 3: Crear triggers
```sql
-- Contenido de: docs/features/sql/003_create_triggers.sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS 'Actualiza automáticamente el campo updated_at cuando se modifica un registro';
```

#### Script 4: Configurar políticas RLS
```sql
-- Contenido de: docs/features/sql/004_rls_policies.sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todas las operaciones en profiles" ON profiles;
CREATE POLICY "Permitir todas las operaciones en profiles"
  ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todas las operaciones en reports" ON reports;
CREATE POLICY "Permitir todas las operaciones en reports"
  ON reports
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3. Obtener las Credenciales de Supabase

1. Ve a **Project Settings** (icono de engranaje en el panel izquierdo)
2. Ve a **API** en el menú
3. Copia las siguientes credenciales:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (empieza con `eyJ...`)
   - **service_role key** (empieza con `eyJ...`) - ⚠️ **Mantener secreta**

### 4. Crear el Archivo .env.local

En la raíz del proyecto, crea un archivo llamado `.env.local` con el siguiente contenido:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=TU_PROJECT_URL_AQUI
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY_AQUI

# APIs de IA (por ahora puedes dejarlas vacías)
SAPTIVA_API_KEY=
TAVILY_API_KEY=

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**⚠️ Importante**: 
- Reemplaza los valores `TU_XXX_AQUI` con tus credenciales reales de Supabase
- Nunca compartas tu `SUPABASE_SERVICE_ROLE_KEY` públicamente
- El archivo `.env.local` ya está en `.gitignore` para proteger tus credenciales

### 5. Ejecutar la Aplicación

```bash
npm run dev
```

Abre tu navegador en: http://localhost:3000

---

## 🎯 ¿Qué Puedes Hacer Ahora?

### ✅ Funcionalidades Implementadas:

1. **Crear tu perfil de empresa**
   - Ve a http://localhost:3000
   - Llena el formulario con el nombre y descripción de tu empresa
   - Haz clic en "Guardar y Continuar"

2. **Ver el dashboard**
   - Después de crear tu perfil, serás redirigido al dashboard
   - El dashboard mostrará información básica de tu empresa
   - Tu sesión se guarda automáticamente en el navegador

3. **Persistencia de sesión**
   - Si cierras el navegador y vuelves a abrir la app, tu sesión se mantiene
   - No necesitas volver a llenar el formulario

---

## 📋 Próximas Features (Pendientes)

Las siguientes funcionalidades están documentadas pero aún no implementadas:

- **F004**: Integración con Saptiva AI
- **F005**: Integración con Tavily Search  
- **F006**: Generación de Reportes
- **F007**: Dashboard Completo con Estado de Reportes
- **F008**: Visualización de Reportes

---

## 🧪 Testing Manual

Para verificar que todo funciona:

1. **Test de Creación de Perfil**:
   - Ve a http://localhost:3000
   - Llena el formulario con datos válidos
   - Verifica que te redirige al dashboard
   - Abre las DevTools del navegador (F12)
   - Ve a Application > Local Storage
   - Verifica que existen las keys: `marketpulse_profile_id` y `marketpulse_profile_data`

2. **Test de Persistencia**:
   - Recarga la página (F5)
   - Verifica que sigues en el dashboard
   - Verifica que tu información se muestra correctamente

3. **Test de Logout**:
   - Haz clic en "Cerrar Sesión"
   - Verifica que te redirige a la página principal
   - Verifica que el localStorage se limpió

4. **Test de Base de Datos**:
   - Ve al dashboard de Supabase
   - Ve a Table Editor > profiles
   - Verifica que tu perfil aparece en la tabla

---

## 🐛 Solución de Problemas

### Error: "Faltan variables de entorno de Supabase"
- Verifica que el archivo `.env.local` existe en la raíz del proyecto
- Verifica que las variables están escritas correctamente (sin espacios)
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "No se pudo crear el perfil"
- Verifica que ejecutaste todos los scripts SQL en Supabase
- Verifica que las credenciales en `.env.local` son correctas
- Verifica la consola del navegador para más detalles del error

### El formulario no se ve bien
- Verifica que shadcn/ui se instaló correctamente
- Ejecuta: `npm install` para asegurar que todas las dependencias están instaladas

---

## 📊 Estructura del Proyecto Creada

```
marketpulse/
├── app/
│   ├── api/
│   │   └── profiles/
│   │       ├── route.ts           ✅ API para crear perfiles
│   │       └── [id]/route.ts      ✅ API para obtener perfil
│   ├── dashboard/
│   │   └── page.tsx               ✅ Página del dashboard
│   ├── layout.tsx                 ✅ Layout principal
│   └── page.tsx                   ✅ Página de inicio con formulario
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx     ✅ Protección de rutas
│   ├── forms/
│   │   └── CompanyProfileForm.tsx ✅ Formulario de perfil
│   └── ui/                        ✅ Componentes shadcn/ui
├── lib/
│   ├── db/
│   │   ├── supabase.ts            ✅ Cliente de Supabase
│   │   └── queries.ts             ✅ Funciones de base de datos
│   ├── hooks/
│   │   └── useSession.ts          ✅ Hook de sesión
│   └── session.ts                 ✅ Manejo de localStorage
├── types/
│   └── database.ts                ✅ Tipos TypeScript
├── docs/
│   └── features/
│       └── sql/                   ✅ Scripts SQL
└── .env.local                     ⏳ Por crear
```

---

## ✨ ¡Todo Listo!

Una vez que completes los pasos 1-5, tendrás una aplicación funcional de MarketPulse con:

- ✅ Onboarding completo
- ✅ Sistema de sesiones
- ✅ Base de datos configurada
- ✅ Dashboard básico funcionando

**¿Listo para continuar?** Una vez que verifiques que todo funciona, podemos avanzar a las siguientes features: Integración con las APIs de IA (Saptiva y Tavily) y la generación automática de reportes.

---

**Fecha de creación**: 24 de Octubre de 2025  
**Versión**: 1.0.0

