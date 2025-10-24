/**
 * Script de testing del flujo completo de generación de reportes
 * Ejecutar con: npx tsx scripts/test-full-report.ts
 */

// Cargar variables de entorno
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

import { generateCompetitiveReport } from '../lib/ai/orchestrator'
import type { Profile } from '../types/database'
import { writeFileSync } from 'fs'

async function main() {
  console.log('🧪 Test de Generación Completa de Reporte\n')
  
  // Perfil de prueba
  const testProfile: Profile = {
    id: 'test-123',
    company_name: 'Notion',
    company_description: 'Plataforma de productividad todo-en-uno que combina notas, wikis, bases de datos y gestión de proyectos en un solo espacio de trabajo colaborativo.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  console.log('📋 Perfil de prueba:')
  console.log(`   Empresa: ${testProfile.company_name}`)
  console.log(`   Descripción: ${testProfile.company_description}\n`)
  
  // Generar reporte
  const result = await generateCompetitiveReport(testProfile, {
    days: 7,
    maxResults: 10
  })
  
  if (result.success && result.report) {
    console.log('✅ Reporte generado exitosamente!\n')
    
    // Guardar reporte en archivo
    const filename = `report_${testProfile.company_name.toLowerCase()}_${Date.now()}.md`
    writeFileSync(filename, result.report)
    
    console.log(`📄 Reporte guardado en: ${filename}`)
    console.log(`\n📊 Métricas:`)
    console.log(`   - Competidores identificados: ${result.metrics.competitorsIdentified}`)
    console.log(`   - Competidores con noticias: ${result.metrics.competitorsWithNews}`)
    console.log(`   - Total de noticias: ${result.metrics.totalNews}`)
    console.log(`   - Duración: ${(result.metrics.durationMs / 1000).toFixed(2)}s`)
    
    // Mostrar preview del reporte
    console.log(`\n📄 Preview del reporte (primeras 500 caracteres):\n`)
    console.log('─'.repeat(60))
    console.log(result.report.substring(0, 500) + '...')
    console.log('─'.repeat(60))
    
  } else {
    console.error('❌ Error generando reporte:', result.error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})

