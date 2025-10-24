# F001 - Configuración de Perfil de Empresa

**Estado:** 🔴 Pendiente  
**Prioridad:** 🔥 Alta  
**Dependencias:** F002 (Base de Datos), F003 (Sesiones)  
**Estimación:** 1 día

---

## 📋 Descripción

Formulario de onboarding donde el usuario configura su perfil de empresa por primera vez. Esta información se usa para identificar competidores y generar análisis relevantes.

---

## 🎯 Objetivos

- Permitir al usuario introducir el nombre y descripción de su empresa
- Guardar la información en Supabase
- Crear una sesión local usando localStorage
- Redirigir al dashboard después de completar

---

## 👤 Historia de Usuario

**Como** un nuevo usuario,  
**quiero** introducir el nombre y la descripción de mi empresa,  
**para que** el sistema pueda identificar a mis competidores y generar análisis relevantes para mi contexto.

---

## ✅ Criterios de Aceptación

1. El formulario debe tener dos campos:
   - `company_name` (Input text, requerido)
   - `company_description` (Textarea, requerido, mínimo 50 caracteres)

2. El botón de guardar debe estar deshabilitado hasta que ambos campos sean válidos

3. Al enviar el formulario:
   - Se debe crear un registro en la tabla `profiles` de Supabase
   - Se debe guardar el `profile_id` en localStorage
   - El usuario debe ser redirigido a `/dashboard`

4. Si ocurre un error, debe mostrarse un mensaje claro al usuario

5. El formulario debe tener validación en tiempo real con mensajes de error

---

## 🎨 Diseño y UX

### Pantalla de Bienvenida
```
┌─────────────────────────────────────┐
│                                     │
│   🎯 Tu Analista de Competencia    │
│         Personal                    │
│                                     │
│   Configura tu perfil empresarial  │
│   y recibe reportes de inteligencia│
│   competitiva generados con IA     │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Nombre de la empresa        │  │
│   │ [__________________]        │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Descripción del negocio     │  │
│   │ [                          ]│  │
│   │ [                          ]│  │
│   │ [                          ]│  │
│   └─────────────────────────────┘  │
│                                     │
│   [ Guardar y Continuar ] (disabled)│
│                                     │
└─────────────────────────────────────┘
```

### Estados del Formulario
- **Inicial:** Campos vacíos, botón deshabilitado
- **Validando:** Mostrar errores de validación en tiempo real
- **Enviando:** Botón con spinner, campos deshabilitados
- **Error:** Mostrar alert con mensaje de error
- **Éxito:** Redirección automática al dashboard

---

## 🏗️ Implementación Técnica

### Componentes Necesarios

#### 1. `CompanyProfileForm.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CompanyProfileForm() {
  // Estado del formulario
  // Validación
  // Manejo de envío
  // Guardar en Supabase
  // Guardar en localStorage
  // Redirección
}
```

### API Route

#### `app/api/profiles/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase'

export async function POST(request: Request) {
  try {
    const { company_name, company_description } = await request.json()
    
    // Validación
    if (!company_name || !company_description) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }
    
    // Crear perfil en Supabase
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        company_name,
        company_description
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear perfil' },
      { status: 500 }
    )
  }
}
```

### Validación con Zod

```typescript
import { z } from 'zod'

export const profileSchema = z.object({
  company_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  company_description: z.string()
    .min(50, 'La descripción debe tener al menos 50 caracteres')
    .max(1000, 'La descripción es demasiado larga')
})
```

---

## 🧪 Testing

### Casos de Prueba

1. **Validación de campos vacíos**
   - Intentar enviar con campos vacíos
   - Verificar que el botón esté deshabilitado

2. **Validación de longitud mínima**
   - Descripción con menos de 50 caracteres
   - Verificar mensaje de error

3. **Envío exitoso**
   - Llenar formulario correctamente
   - Verificar creación en Supabase
   - Verificar guardado en localStorage
   - Verificar redirección

4. **Manejo de errores de red**
   - Simular error de Supabase
   - Verificar mensaje de error

---

## 📦 Dependencias

- `@supabase/supabase-js`
- `zod` para validación
- shadcn/ui componentes: Button, Input, Textarea, Label, Alert

---

## 🔗 Archivos Relacionados

- `app/page.tsx` - Página principal con el formulario
- `app/api/profiles/route.ts` - API para crear perfiles
- `components/forms/CompanyProfileForm.tsx` - Componente del formulario
- `lib/db/supabase.ts` - Cliente de Supabase
- `lib/session.ts` - Funciones de manejo de sesión
- `types/database.ts` - Tipos TypeScript

---

## 📝 Notas Adicionales

- **Sin autenticación:** Este formulario no requiere login
- **Una sola vez:** El usuario solo llena este formulario una vez
- **Edición futura:** Para MVP, no hay opción de editar el perfil
- **Multilenguaje:** Considerar internacionalización en el futuro

---

## ✅ Checklist de Implementación

- [ ] Crear componente `CompanyProfileForm`
- [ ] Crear API route `POST /api/profiles`
- [ ] Implementar validación con Zod
- [ ] Integrar con Supabase
- [ ] Implementar manejo de sesión
- [ ] Crear página principal con el formulario
- [ ] Agregar manejo de errores
- [ ] Testing manual del flujo completo
- [ ] Validar redirección al dashboard
- [ ] Documentar código

