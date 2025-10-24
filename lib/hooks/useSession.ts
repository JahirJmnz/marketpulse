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

interface UseSessionReturn {
  profile: Profile | null
  profileId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  saveSession: (profile: Profile) => void
  logout: () => void
  refreshProfile: () => Promise<Profile | null>
}

/**
 * Hook personalizado para manejar la sesión del usuario
 * Maneja la carga, guardado y sincronización del perfil desde localStorage
 */
export function useSession(): UseSessionReturn {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    loadSession()
  }, [])

  /**
   * Carga la sesión desde localStorage
   * Si no hay datos locales pero hay un ID, intenta sincronizar
   */
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
      
      // Sincronizar en background para obtener datos frescos
      syncProfile().then(freshProfile => {
        if (freshProfile) {
          setProfile(freshProfile)
        }
      })
    } else {
      // Si hay ID pero no datos, intentar cargar desde la API
      const freshProfile = await syncProfile()
      if (freshProfile) {
        setProfile(freshProfile)
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
  }

  /**
   * Guarda una nueva sesión
   * @param newProfile - Perfil a guardar
   */
  function saveSession(newProfile: Profile) {
    storeProfile(newProfile)
    setProfile(newProfile)
    setIsAuthenticated(true)
  }

  /**
   * Cierra la sesión y limpia los datos
   * Redirige a la página principal
   */
  function logout() {
    clearSession()
    setProfile(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  /**
   * Refresca el perfil desde la base de datos
   * @returns El perfil actualizado
   */
  async function refreshProfile(): Promise<Profile | null> {
    const freshProfile = await syncProfile()
    if (freshProfile) {
      setProfile(freshProfile)
    }
    return freshProfile
  }

  return {
    profile,
    profileId: profile?.id || null,
    isLoading,
    isAuthenticated,
    saveSession,
    logout,
    refreshProfile
  }
}


