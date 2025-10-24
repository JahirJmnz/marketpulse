# F002 - Base de Datos Supabase

**Estado:** 🔴 Pendiente  
**Prioridad:** 🔥 Alta  
**Dependencias:** Ninguna  
**Estimación:** 0.5 días

---

## 📋 Descripción

Configuración de la base de datos PostgreSQL en Supabase con las tablas necesarias para almacenar perfiles de empresas y reportes generados.

---

## 🎯 Objetivos

- Crear proyecto en Supabase
- Definir esquema de base de datos
- Crear tablas con relaciones apropiadas
- Configurar políticas de acceso (RLS)
- Configurar cliente de Supabase en Next.js

---

## 🗄️ Esquema de Base de Datos

### Tabla: `profiles`

Almacena la información de configuración de cada empresa.

```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Tabla: `reports`

Almacena los reportes de inteligencia competitiva generados.

```sql
CREATE TYPE report_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  status report_status DEFAULT 'PENDING',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_reports_profile_id ON reports(profile_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_profile_created ON reports(profile_id, created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_reports_updated_at 
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Relaciones

```
profiles (1) ─── (N) reports
```

Un perfil puede tener múltiples reportes, pero cada reporte pertenece a un solo perfil.

---

## 🔒 Políticas de Seguridad (RLS)

**Nota:** Para el MVP sin autenticación, las políticas serán permisivas. En producción se deberían ajustar.

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para MVP (ajustar para producción)
CREATE POLICY "Permitir todas las operaciones en profiles"
  ON profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir todas las operaciones en reports"
  ON reports
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**⚠️ Importante:** Estas políticas son solo para desarrollo. En producción se debe implementar autenticación adecuada.

---

## 🏗️ Implementación Técnica

### Cliente de Supabase

#### `lib/db/supabase.ts`
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey)
}
```

### Tipos TypeScript

#### `types/database.ts`
```typescript
export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface Profile {
  id: string
  company_name: string
  company_description: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  profile_id: string
  content: string | null
  status: ReportStatus
  error_message: string | null
  created_at: string
  completed_at: string | null
  metadata: Record<string, any>
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      reports: {
        Row: Report
        Insert: Omit<Report, 'id' | 'created_at'>
        Update: Partial<Omit<Report, 'id' | 'created_at'>>
      }
    }
  }
}
```

### Funciones de Utilidad

#### `lib/db/queries.ts`
```typescript
import { createClient, createServerClient } from './supabase'
import type { Profile, Report, ReportStatus } from '@/types/database'

// PROFILES
export async function createProfile(data: {
  company_name: string
  company_description: string
}): Promise<Profile> {
  const supabase = createServerClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return profile
}

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

// REPORTS
export async function createReport(profileId: string): Promise<Report> {
  const supabase = createServerClient()
  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      profile_id: profileId,
      status: 'PENDING'
    })
    .select()
    .single()
  
  if (error) throw error
  return report
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  content?: string,
  errorMessage?: string
): Promise<void> {
  const supabase = createServerClient()
  const updates: any = { status }
  
  if (content) updates.content = content
  if (errorMessage) updates.error_message = errorMessage
  if (status === 'COMPLETED' || status === 'FAILED') {
    updates.completed_at = new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
  
  if (error) throw error
}

export async function getReport(id: string): Promise<Report | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reports')
    .select()
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function getReportsByProfile(
  profileId: string,
  limit = 10
): Promise<Report[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reports')
    .select()
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}
```

---

## 📦 Dependencias

- `@supabase/supabase-js` (v2.x)

```bash
npm install @supabase/supabase-js
```

---

## 🧪 Testing

### Casos de Prueba

1. **Crear perfil**
   - Insertar nuevo perfil
   - Verificar que se genera UUID automáticamente
   - Verificar timestamps

2. **Crear reporte**
   - Crear reporte asociado a perfil
   - Verificar estado inicial 'PENDING'
   - Verificar relación con perfil

3. **Actualizar reporte**
   - Cambiar estado a 'COMPLETED'
   - Agregar contenido
   - Verificar completed_at se actualiza

4. **Consultar reportes por perfil**
   - Crear múltiples reportes
   - Consultar por profile_id
   - Verificar ordenamiento por fecha

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Pasos de Configuración

1. **Crear proyecto en Supabase**
   - Ir a https://supabase.com
   - Crear nuevo proyecto
   - Copiar URL y API keys

2. **Ejecutar migraciones SQL**
   - Ir a SQL Editor en Supabase Dashboard
   - Ejecutar scripts de creación de tablas
   - Verificar que las tablas se crearon correctamente

3. **Configurar variables de entorno**
   - Copiar keys al archivo `.env.local`
   - Reiniciar servidor de desarrollo

4. **Verificar conexión**
   - Crear test query desde la aplicación
   - Verificar logs de Supabase

---

## 📝 Migraciones SQL

Todas las migraciones SQL deben guardarse en:

```
/docs/features/sql/
├── 001_create_profiles.sql
├── 002_create_reports.sql
└── 003_create_indexes.sql
```

---

## ✅ Checklist de Implementación

- [ ] Crear proyecto en Supabase
- [ ] Copiar URL y API keys
- [ ] Ejecutar SQL para tabla `profiles`
- [ ] Ejecutar SQL para tabla `reports`
- [ ] Crear índices
- [ ] Configurar RLS policies
- [ ] Instalar `@supabase/supabase-js`
- [ ] Crear cliente de Supabase
- [ ] Crear tipos TypeScript
- [ ] Crear funciones de utilidad (queries)
- [ ] Configurar variables de entorno
- [ ] Testing de conexión
- [ ] Documentar estructura de datos

---

## 🔗 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)

