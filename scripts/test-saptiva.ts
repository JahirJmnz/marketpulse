/**
 * Script de testing para la integración con Saptiva
 * Ejecutar con: npx tsx scripts/test-saptiva.ts
 */

// Cargar variables de entorno ANTES de cualquier import
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar .env.local antes de importar cualquier módulo
config({ path: resolve(__dirname, '../.env.local') })

// Ahora sí importar módulos que usan variables de entorno
import { identifyCompetitors, testSaptivaConnection } from '../lib/ai/analysis'
import type { Profile } from '../types/database'

async function main() {
  console.log('🧪 Testing Integración con Saptiva\n')
  console.log('=' .repeat(50))
  
  // Verificar variables de entorno
  console.log('\n📋 Variables de entorno:')
  console.log(`SAPTIVA_API_KEY: ${process.env.SAPTIVA_API_KEY ? '✅ Configurada' : '❌ No encontrada'}`)
  console.log(`Valor: ${process.env.SAPTIVA_API_KEY?.substring(0, 20)}...`)
  console.log()
  
  // Test 1: Conexión básica
  console.log('\n1️⃣ Test de Conexión Básica')
  console.log('-'.repeat(50))
  const connectionOk = await testSaptivaConnection()
  
  if (!connectionOk) {
    console.error('\n❌ La conexión con Saptiva falló')
    console.error('Verifica que SAPTIVA_API_KEY esté configurada en .env.local')
    process.exit(1)
  }
  
  // Test 2: Identificación de competidores
  console.log('\n\n2️⃣ Test de Identificación de Competidores')
  console.log('-'.repeat(50))
  
  const testProfile: Profile = {
    id: 'test-id',
    company_name: 'Notion',
    company_description: 'Plataforma de productividad todo-en-uno que combina notas, wikis, bases de datos y gestión de proyectos en un solo espacio de trabajo colaborativo.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  try {
    const competitors = await identifyCompetitors(testProfile)
    
    console.log(`\n✅ Identificados ${competitors.length} competidores:\n`)
    
    competitors.forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.name}`)
      console.log(`   Tipo: ${c.type}`)
      console.log(`   Razón: ${c.reason}`)
      if (c.website) {
        console.log(`   Website: ${c.website}`)
      }
      console.log()
    })
    
  } catch (error) {
    console.error('\n❌ Error en identificación de competidores:', error)
    process.exit(1)
  }
  
  // Resumen
  console.log('\n' + '='.repeat(50))
  console.log('✅ Todos los tests pasaron correctamente!')
  console.log('='.repeat(50))
  console.log('\n💡 Próximo paso: Implementar integración con Tavily (F005)')
}

main().catch(error => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})

