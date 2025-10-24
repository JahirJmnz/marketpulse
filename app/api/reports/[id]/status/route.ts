import { NextResponse } from 'next/server'
import { getReport } from '@/lib/db/queries'

/**
 * GET /api/reports/[id]/status
 * Obtiene el estado actual de un reporte (para polling)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const report = await getReport(id)

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    // Retornar solo información de estado (sin contenido completo)
    return NextResponse.json({
      id: report.id,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
      completed_at: report.completed_at,
      error_message: report.error_message,
      has_content: !!report.content
    })
    
  } catch (error) {
    console.error('❌ Error obteniendo estado del reporte:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: 'Error al obtener estado', details: errorMessage },
      { status: 500 }
    )
  }
}

