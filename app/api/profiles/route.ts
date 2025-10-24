import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createProfile } from '@/lib/db/queries'

// Schema de validación para crear un perfil
const createProfileSchema = z.object({
  company_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  company_description: z.string()
    .min(50, 'La descripción debe tener al menos 50 caracteres')
    .max(1000, 'La descripción es demasiado larga')
})

/**
 * POST /api/profiles
 * Crea un nuevo perfil de empresa
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validar datos con Zod
    const validationResult = createProfileSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { company_name, company_description } = validationResult.data
    
    // Crear perfil en Supabase
    const profile = await createProfile({
      company_name,
      company_description
    })
    
    return NextResponse.json({ profile }, { status: 201 })
    
  } catch (error) {
    console.error('Error en POST /api/profiles:', error)
    
    return NextResponse.json(
      { error: 'Error al crear perfil. Por favor, intenta nuevamente.' },
      { status: 500 }
    )
  }
}


