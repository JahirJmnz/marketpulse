import { NextResponse } from 'next/server'
import { createReport } from '@/lib/db/queries'
import { generateReportInBackground } from '@/lib/reports/generator'

/**
 * POST /api/reports/generate
 * Inicia la generación de un reporte de inteligencia competitiva
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { profile_id } = body

    // Validar profile_id
    if (!profile_id || typeof profile_id !== 'string') {
      return NextResponse.json(
        { error: 'profile_id es requerido y debe ser un string' },
        { status: 400 }
      )
    }

    console.log(`📥 Solicitud de generación de reporte para perfil ${profile_id}`)

    // Crear registro del reporte en DB con status PENDING
    const report = await createReport(profile_id)
    console.log(`✅ Reporte ${report.id} creado con status PENDING`)

    // Iniciar generación en background (no esperamos a que termine)
    // La respuesta se envía inmediatamente
    generateReportInBackground(report.id, profile_id).catch(error => {
      console.error('Error no capturado en generación de reporte:', error)
    })

    return NextResponse.json({
      report_id: report.id,
      status: 'PENDING',
      message: 'La generación del reporte ha comenzado. Usa /api/reports/{id}/status para verificar el progreso.'
    }, { status: 202 }) // 202 Accepted

  } catch (error) {
    console.error('❌ Error en endpoint de generación:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: 'Error al iniciar la generación del reporte', details: errorMessage },
      { status: 500 }
    )
  }
}

