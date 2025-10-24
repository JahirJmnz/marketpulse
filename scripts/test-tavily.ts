/**
 * Script de testing para la integración con Tavily
 * Ejecutar con: npx tsx scripts/test-tavily.ts
 */

// Cargar variables de entorno ANTES de cualquier import
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

// Ahora importar módulos
import { getTavilyClient } from '../lib/search/tavily'
import { researchCompetitor, getResearchSummary } from '../lib/search/competitor-research'
import type { Competitor } from '../types/ai'

async function main() {
  console.log('🧪 Testing Integración con Tavily\n')
  console.log('=' .repeat(50))
  
  // Verificar variables de entorno
  console.log('\n📋 Variables de entorno:')
  console.log(`TAVILY_API_KEY: ${process.env.TAVILY_API_KEY ? '✅ Configurada' : '❌ No encontrada'}`)
  if (process.env.TAVILY_API_KEY) {
    console.log(`Valor: ${process.env.TAVILY_API_KEY.substring(0, 15)}...`)
  }
  console.log()
  
  const tavily = getTavilyClient()
  
  // Test 1: Conexión básica
  console.log('\n1️⃣ Test de Conexión Básica')
  console.log('-'.repeat(50))
  const connectionOk = await tavily.testConnection()
  
  if (!connectionOk) {
    console.error('\n❌ La conexión con Tavily falló')
    console.error('Verifica que TAVILY_API_KEY esté configurada en .env.local')
    process.exit(1)
  }
  
  // Test 2: Búsqueda básica
  console.log('\n\n2️⃣ Test de Búsqueda Básica')
  console.log('-'.repeat(50))
  
  try {
    const results = await tavily.search({
      query: 'Notion productivity app news',
      max_results: 5,
      days: 7
    })
    
    console.log(`✅ Búsqueda exitosa`)
    console.log(`   Resultados: ${results.results.length}`)
    console.log(`   Tiempo: ${results.response_time}s`)
    
    if (results.results.length > 0) {
      console.log(`\n   Primer resultado:`)
      console.log(`   - ${results.results[0].title}`)
      console.log(`   - Score: ${results.results[0].score.toFixed(2)}`)
      console.log(`   - URL: ${results.results[0].url}`)
    }
  } catch (error) {
    console.error('❌ Error en búsqueda básica:', error)
    process.exit(1)
  }
  
  // Test 3: Búsqueda de competidor
  console.log('\n\n3️⃣ Test de Búsqueda de Competidor')
  console.log('-'.repeat(50))
  
  try {
    const competitorResults = await tavily.searchCompetitor('Asana', {
      days: 7,
      maxResults: 10
    })
    
    console.log(`\n   Primeras 3 noticias:\n`)
    competitorResults.slice(0, 3).forEach((r, idx) => {
      console.log(`   ${idx + 1}. ${r.title}`)
      console.log(`      Score: ${r.score.toFixed(2)} | ${r.published_date || 'Sin fecha'}`)
      console.log(`      ${r.url}`)
      console.log()
    })
  } catch (error) {
    console.error('❌ Error en búsqueda de competidor:', error)
    process.exit(1)
  }
  
  // Test 4: Investigación completa de competidor
  console.log('\n4️⃣ Test de Investigación Completa')
  console.log('-'.repeat(50))
  
  const testCompetitor: Competitor = {
    name: 'ClickUp',
    type: 'direct',
    reason: 'Competidor directo en gestión de proyectos',
    website: 'https://clickup.com'
  }
  
  try {
    const research = await researchCompetitor(testCompetitor, {
      days: 7,
      maxResults: 10
    })
    
    console.log(`✅ Investigación completada:`)
    console.log(`   Competidor: ${research.competitor.name}`)
    console.log(`   Noticias encontradas: ${research.news.length}`)
    console.log(`   Tiene actividad: ${research.hasActivity ? '✅ Sí' : '❌ No'}`)
    
    if (research.news.length > 0) {
      console.log(`\n   Últimas 2 noticias:\n`)
      research.news.slice(0, 2).forEach((n, idx) => {
        console.log(`   ${idx + 1}. ${n.title}`)
        console.log(`      ${n.published_date}`)
        console.log(`      ${n.url}`)
        console.log()
      })
    }
  } catch (error) {
    console.error('❌ Error en investigación:', error)
    process.exit(1)
  }
  
  // Test 5: Búsquedas paralelas
  console.log('\n5️⃣ Test de Búsquedas Paralelas')
  console.log('-'.repeat(50))
  
  try {
    const competitors = ['Notion', 'Asana', 'Monday.com']
    const resultsMap = await tavily.searchMultipleCompetitors(competitors, {
      days: 7,
      maxResults: 5
    })
    
    console.log(`\n✅ Búsquedas completadas:`)
    resultsMap.forEach((results, competitor) => {
      console.log(`   ${competitor}: ${results.length} noticias`)
    })
  } catch (error) {
    console.error('❌ Error en búsquedas paralelas:', error)
    process.exit(1)
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(50))
  console.log('✅ Todos los tests pasaron correctamente!')
  console.log('='.repeat(50))
  console.log('\n💡 Próximo paso: Orquestar flujo completo de generación de reportes (F006)')
}

main().catch(error => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})

