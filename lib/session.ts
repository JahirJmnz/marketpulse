import type { Profile } from '@/types/database'

const PROFILE_ID_KEY = 'marketpulse_profile_id'
const PROFILE_DATA_KEY = 'marketpulse_profile_data'

/**
 * Obtiene el profile_id almacenado en localStorage
 * @returns El UUID del perfil o null si no existe
 */
export function getProfileId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PROFILE_ID_KEY)
}

/**
 * Guarda el profile_id en localStorage
 * @param profileId - UUID del perfil
 */
export function setProfileId(profileId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_ID_KEY, profileId)
}

/**
 * Obtiene los datos del perfil almacenados en localStorage
 * @returns El perfil completo o null si no existe
 */
export function getStoredProfile(): Profile | null {
  if (typeof window === 'undefined') return null
  
  const profileData = localStorage.getItem(PROFILE_DATA_KEY)
  if (!profileData) return null
  
  try {
    return JSON.parse(profileData) as Profile
  } catch (error) {
    console.error('Error parseando datos del perfil:', error)
    return null
  }
}

/**
 * Guarda los datos del perfil en localStorage
 * @param profile - Objeto Profile completo
 */
export function storeProfile(profile: Profile): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profile))
  localStorage.setItem(PROFILE_ID_KEY, profile.id)
}

/**
 * Verifica si existe una sesión activa
 * @returns true si hay un perfil guardado
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
 * Útil para refrescar datos después de actualizaciones
 * @returns El perfil actualizado o null si hay error
 */
export async function syncProfile(): Promise<Profile | null> {
  const profileId = getProfileId()
  if (!profileId) return null
  
  try {
    const response = await fetch(`/api/profiles/${profileId}`)
    
    if (!response.ok) {
      console.error('Error al sincronizar perfil:', response.statusText)
      return null
    }
    
    const profile: Profile = await response.json()
    storeProfile(profile)
    return profile
  } catch (error) {
    console.error('Error sincronizando perfil:', error)
    return null
  }
}


