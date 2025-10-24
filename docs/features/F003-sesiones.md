# F003 - Sistema de Sesiones (localStorage)

**Estado:** 🔴 Pendiente  
**Prioridad:** 🔥 Alta  
**Dependencias:** Ninguna  
**Estimación:** 0.5 días

---

## 📋 Descripción

Sistema simple de identificación de usuarios usando localStorage del navegador, sin necesidad de autenticación tradicional (login/registro). Cada usuario se identifica por un UUID único almacenado localmente.

---

## 🎯 Objetivos

- Identificar usuarios de forma única sin autenticación
- Persistir el perfil del usuario en el navegador
- Permitir acceso rápido al dashboard
- Facilitar el MVP sin complejidad de auth

---

## 🏗️ Arquitectura

### Flujo de Sesión

```
┌─────────────────────────────────────────┐
│  Primera Visita                         │
│  1. Usuario llena formulario            │
│  2. Se crea perfil en Supabase          │
│  3. Se guarda profile_id en localStorage│
│  4. Redirección a /dashboard            │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Visitas Posteriores                    │
│  1. Se detecta profile_id en localStorage│
│  2. Se carga perfil automáticamente     │
│  3. Acceso directo al dashboard         │
└─────────────────────────────────────────┘
```

### Estructura de Datos en localStorage

```typescript
// Keys almacenadas
{
  "marketpulse_profile_id": "uuid-del-perfil",
  "marketpulse_profile_data": {
    "id": "uuid",
    "company_name": "Mi Empresa",
    "company_description": "Descripción...",
    "created_at": "2025-10-24T..."
  }
}
```

---

## 🏗️ Implementación Técnica

### Módulo Principal de Sesión

#### `lib/session.ts`
```typescript
import type { Profile } from '@/types/database'

const PROFILE_ID_KEY = 'marketpulse_profile_id'
const PROFILE_DATA_KEY = 'marketpulse_profile_data'

/**
 * Obtiene el profile_id almacenado en localStorage
 */
export function getProfileId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PROFILE_ID_KEY)
}

/**
 * Guarda el profile_id en localStorage
 */
export function setProfileId(profileId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_ID_KEY, profileId)
}

/**
 * Obtiene los datos del perfil almacenados en localStorage
 */
export function getStoredProfile(): Profile | null {
  if (typeof window === 'undefined') return null
  
  const profileData = localStorage.getItem(PROFILE_DATA_KEY)
  if (!profileData) return null
  
  try {
    return JSON.parse(profileData)
  } catch {
    return null
  }
}

/**
 * Guarda los datos del perfil en localStorage
 */
export function storeProfile(profile: Profile): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profile))
  localStorage.setItem(PROFILE_ID_KEY, profile.id)
}

/**
 * Verifica si existe una sesión activa
 */
export function hasActiveSession(): boolean {
  return getProfileId() !== null
}

/**
 * Limpia la sesión (para reset o logout)
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(PROFILE_ID_KEY)
  localStorage.removeItem(PROFILE_DATA_KEY)
}

/**
 * Sincroniza el perfil con la base de datos
 * Útil para refrescar datos
 */
export async function syncProfile(): Promise<Profile | null> {
  const profileId = getProfileId()
  if (!profileId) return null
  
  try {
    const response = await fetch(`/api/profiles/${profileId}`)
    if (!response.ok) throw new Error('Failed to fetch profile')
    
    const profile: Profile = await response.json()
    storeProfile(profile)
    return profile
  } catch (error) {
    console.error('Error syncing profile:', error)
    return null
  }
}
```

### Hook de React para Sesión

#### `lib/hooks/useSession.ts`
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'
import {
  getProfileId,
  getStoredProfile,
  storeProfile,
  clearSession,
  syncProfile
} from '@/lib/session'

export function useSession() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    loadSession()
  }, [])

  async function loadSession() {
    setIsLoading(true)
    
    const profileId = getProfileId()
    if (!profileId) {
      setIsLoading(false)
      return
    }

    const storedProfile = getStoredProfile()
    if (storedProfile) {
      setProfile(storedProfile)
      setIsAuthenticated(true)
      setIsLoading(false)
      
      // Sincronizar en background
      syncProfile().then(freshProfile => {
        if (freshProfile) setProfile(freshProfile)
      })
    } else {
      // Si hay ID pero no datos, intentar cargar
      const freshProfile = await syncProfile()
      if (freshProfile) {
        setProfile(freshProfile)
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
  }

  function saveSession(newProfile: Profile) {
    storeProfile(newProfile)
    setProfile(newProfile)
    setIsAuthenticated(true)
  }

  function logout() {
    clearSession()
    setProfile(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  async function refreshProfile() {
    const freshProfile = await syncProfile()
    if (freshProfile) {
      setProfile(freshProfile)
    }
    return freshProfile
  }

  return {
    profile,
    isLoading,
    isAuthenticated,
    saveSession,
    logout,
    refreshProfile
  }
}
```

### Middleware para Proteger Rutas

#### `middleware.ts` (raíz del proyecto)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas públicas
  const publicPaths = ['/', '/api/profiles']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Para rutas protegidas, verificar en el cliente
  // (no podemos acceder a localStorage desde middleware)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/reports/:path*'
  ]
}
```

### Componente de Protección de Rutas

#### `components/auth/ProtectedRoute.tsx`
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/hooks/useSession'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useSession()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
```

---

## 📦 Uso en la Aplicación

### En el Formulario de Configuración

```typescript
'use client'

import { useSession } from '@/lib/hooks/useSession'
import { useRouter } from 'next/navigation'

export function CompanyProfileForm() {
  const { saveSession } = useSession()
  const router = useRouter()

  async function handleSubmit(data: FormData) {
    // Crear perfil en Supabase
    const response = await fetch('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    const { profile } = await response.json()
    
    // Guardar sesión
    saveSession(profile)
    
    // Redirigir
    router.push('/dashboard')
  }
  
  return (
    // Formulario...
  )
}
```

### En el Dashboard

```typescript
'use client'

import { useSession } from '@/lib/hooks/useSession'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  const { profile, logout } = useSession()

  return (
    <ProtectedRoute>
      <div>
        <h1>Bienvenido, {profile?.company_name}</h1>
        <button onClick={logout}>Cerrar Sesión</button>
        {/* Resto del dashboard */}
      </div>
    </ProtectedRoute>
  )
}
```

---

## 🧪 Testing

### Casos de Prueba

1. **Primera visita**
   - Verificar que no hay profile_id en localStorage
   - Usuario debe ver formulario de configuración

2. **Guardar sesión**
   - Completar formulario
   - Verificar que se guarda en localStorage
   - Verificar redirección

3. **Visita posterior**
   - Recargar página
   - Verificar que se carga sesión automáticamente
   - Verificar acceso directo al dashboard

4. **Cerrar sesión**
   - Click en logout
   - Verificar que se limpia localStorage
   - Verificar redirección a home

5. **Sincronización**
   - Cambiar datos en Supabase
   - Recargar página
   - Verificar que se actualizan datos locales

---

## ⚠️ Consideraciones de Seguridad

### Limitaciones del Enfoque

1. **Sin autenticación real:** Cualquiera con acceso al navegador puede ver los datos
2. **Vulnerable a limpieza:** Si el usuario limpia localStorage, pierde acceso
3. **No apto para producción:** Solo para MVP/desarrollo

### Mejoras Futuras

- Implementar autenticación con email/password
- Agregar tokens JWT
- Implementar refresh tokens
- Agregar 2FA opcional

---

## 📝 Notas Adicionales

### Ventajas del Enfoque
- ✅ Implementación rápida
- ✅ Sin complejidad de auth
- ✅ Ideal para MVP
- ✅ Sin gestión de contraseñas

### Desventajas
- ❌ Sin seguridad real
- ❌ Pérdida de datos al limpiar navegador
- ❌ No multi-dispositivo
- ❌ No compartible

---

## ✅ Checklist de Implementación

- [ ] Crear módulo `lib/session.ts`
- [ ] Crear hook `useSession`
- [ ] Crear componente `ProtectedRoute`
- [ ] Configurar middleware (opcional)
- [ ] Integrar con formulario de perfil
- [ ] Integrar con dashboard
- [ ] Agregar botón de logout
- [ ] Testing de flujo completo
- [ ] Documentar limitaciones
- [ ] Preparar migración a auth real

---

## 🔗 Recursos

- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [React Hooks](https://react.dev/reference/react)

