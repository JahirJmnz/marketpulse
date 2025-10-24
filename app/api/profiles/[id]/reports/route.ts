import { NextResponse } from 'next/server'
import { getReportsByProfile } from '@/lib/db/queries'

/**
 * GET /api/profiles/[id]/reports
 * Obtiene todos los reportes de un perfil
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reports = await getReportsByProfile(id)

    // Retornar solo metadata (sin contenido completo)
    const reportsMetadata = reports.map(report => ({
      id: report.id,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
      completed_at: report.completed_at,
      error_message: report.error_message,
      has_content: !!report.content
    }))

    return NextResponse.json({
      profile_id: id,
      reports: reportsMetadata,
      total: reportsMetadata.length
    })
    
  } catch (error) {
    console.error('❌ Error obteniendo reportes del perfil:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: 'Error al obtener reportes', details: errorMessage },
      { status: 500 }
    )
  }
}

