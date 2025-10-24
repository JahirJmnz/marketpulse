# 📊 Migraciones SQL para MarketPulse

Scripts SQL para configurar la base de datos en Supabase.

---

## 🚀 Orden de Ejecución

Ejecutar los scripts en el siguiente orden:

1. **001_create_profiles.sql** - Crear tabla de perfiles
2. **002_create_reports.sql** - Crear tabla de reportes
3. **003_create_triggers.sql** - Crear triggers automáticos
4. **004_rls_policies.sql** - Configurar políticas de seguridad

---

## 📝 Instrucciones de Uso

### Opción 1: SQL Editor de Supabase (Recomendado)

1. Ir a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navegar a **SQL Editor** en el menú lateral
3. Crear una nueva query
4. Copiar y pegar el contenido de cada archivo en orden
5. Ejecutar cada script con el botón "Run"
6. Verificar que no haya errores

### Opción 2: CLI de Supabase

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Link a tu proyecto
supabase link --project-ref tu-project-ref

# Ejecutar migraciones
supabase db push
```

### Opción 3: Ejecutar todo de una vez

Puedes crear un script maestro que ejecute todo en orden:

```sql
-- all-migrations.sql
\i 001_create_profiles.sql
\i 002_create_reports.sql
\i 003_create_triggers.sql
\i 004_rls_policies.sql
```

---

## 🔍 Verificación

Después de ejecutar las migraciones, verificar:

### 1. Tablas Creadas

```sql
-- Listar todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Debe mostrar: profiles, reports
```

### 2. Estructura de Profiles

```sql
-- Ver estructura de la tabla profiles
\d profiles

-- O usando SQL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### 3. Estructura de Reports

```sql
-- Ver estructura de la tabla reports
\d reports

-- Ver el tipo ENUM
\dT report_status
```

### 4. Índices Creados

```sql
-- Listar índices
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 5. Políticas RLS

```sql
-- Ver políticas de RLS
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public';
```

### 6. Triggers

```sql
-- Ver triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## 🧪 Datos de Prueba

Insertar datos de prueba para verificar que todo funciona:

```sql
-- Insertar perfil de prueba
INSERT INTO profiles (company_name, company_description)
VALUES (
  'Test Company',
  'Una empresa de prueba para verificar la configuración de la base de datos'
)
RETURNING *;

-- Copiar el ID generado y usarlo para crear un reporte de prueba
INSERT INTO reports (profile_id, status, content)
VALUES (
  'uuid-del-perfil-de-arriba',
  'COMPLETED',
  '# Reporte de Prueba\n\nEste es un reporte de prueba.'
)
RETURNING *;

-- Verificar que se crearon correctamente
SELECT 
  p.company_name,
  r.status,
  r.created_at
FROM profiles p
JOIN reports r ON r.profile_id = p.id;
```

---

## 🔄 Rollback (Deshacer Cambios)

Si necesitas deshacer las migraciones:

```sql
-- CUIDADO: Esto eliminará todas las tablas y datos

-- Eliminar políticas
DROP POLICY IF EXISTS "Permitir todas las operaciones en profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir todas las operaciones en reports" ON reports;

-- Eliminar triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Eliminar función
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar tablas (en orden inverso por las foreign keys)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Eliminar tipo ENUM
DROP TYPE IF EXISTS report_status;
```

---

## 📊 Diagrama de Base de Datos

```
┌─────────────────────────────────┐
│         profiles                │
├─────────────────────────────────┤
│ id (UUID) PK                    │
│ company_name (TEXT)             │
│ company_description (TEXT)      │
│ created_at (TIMESTAMP)          │
│ updated_at (TIMESTAMP)          │
└─────────────────────────────────┘
              │ 1
              │
              │ N
┌─────────────────────────────────┐
│         reports                 │
├─────────────────────────────────┤
│ id (UUID) PK                    │
│ profile_id (UUID) FK            │
│ content (TEXT)                  │
│ status (report_status)          │
│ error_message (TEXT)            │
│ created_at (TIMESTAMP)          │
│ completed_at (TIMESTAMP)        │
│ metadata (JSONB)                │
└─────────────────────────────────┘
```

---

## ⚠️ Notas Importantes

### Seguridad (RLS)

Las políticas de RLS configuradas son **permisivas** y solo apropiadas para:
- ✅ Desarrollo local
- ✅ MVP sin autenticación
- ✅ Prototipos

**NO usar en producción** sin implementar autenticación adecuada.

### Para Producción

Antes de lanzar a producción:
1. Implementar Supabase Auth
2. Agregar columna `user_id` a la tabla `profiles`
3. Actualizar políticas RLS para usar `auth.uid()`
4. Implementar políticas específicas por operación (SELECT, INSERT, UPDATE, DELETE)
5. Auditar todas las políticas de seguridad

### Backups

Siempre hacer backup antes de ejecutar migraciones en producción:

```sql
-- Supabase hace backups automáticos, pero puedes crear uno manual:
-- Settings > Database > Backups > Create backup
```

---

## 🔗 Referencias

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview#the-sql-editor)

---

**Última Actualización:** 24 de Octubre de 2025

