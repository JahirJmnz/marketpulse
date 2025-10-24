'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/hooks/useSession'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Componente que protege rutas requiriendo una sesión activa
 * Si no hay sesión, redirige a la página principal
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useSession()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loader mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no renderizar nada (el useEffect redirigirá)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}


