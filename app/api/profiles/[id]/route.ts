import { NextResponse } from 'next/server'
import { getProfile } from '@/lib/db/queries'

/**
 * GET /api/profiles/[id]
 * Obtiene un perfil específico por su ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // En Next.js 15+, params es una Promise
    const { id } = await params
    
    // Validar formato de UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de perfil inválido' },
        { status: 400 }
      )
    }
    
    const profile = await getProfile(id)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(profile)
    
  } catch (error) {
    console.error('Error en GET /api/profiles/[id]:', error)
    
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    )
  }
}


