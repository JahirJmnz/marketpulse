import { NextResponse } from 'next/server'
import { getReport } from '@/lib/db/queries'

/**
 * GET /api/reports/[id]
 * Obtiene un reporte completo por ID
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

    return NextResponse.json(report)
    
  } catch (error) {
    console.error('❌ Error obteniendo reporte:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: 'Error al obtener reporte', details: errorMessage },
      { status: 500 }
    )
  }
}

