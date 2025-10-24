/**
 * Script de testing para las APIs de reportes
 * Ejecutar con: npx tsx scripts/test-api-reports.ts
 */

// Cargar variables de entorno
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

// Base URL de la API
const BASE_URL = 'http://localhost:3000'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testReportAPIs() {
  console.log('🧪 Testing APIs de Reportes\n')
  console.log('='.repeat(60))
  
  // Nota: Necesitamos un profile_id existente
  // Para este test, usaremos uno que debería estar en la DB
  // Si falla, crear un perfil primero
  
  let testProfileId = 'test-profile-id'
  let reportId: string | null = null
  
  try {
    // Test 1: Crear un perfil de prueba
    console.log('\n1️⃣ Creando perfil de prueba...')
    console.log('-'.repeat(60))
    
    const profileResponse = await fetch(`${BASE_URL}/api/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: `Test Company ${Date.now()}`,
        company_description: 'A test SaaS platform for project management and team collaboration'
      })
    })
    
    if (!profileResponse.ok) {
      throw new Error(`Error creating profile: ${profileResponse.statusText}`)
    }
    
    const profileData = await profileResponse.json()
    testProfileId = profileData.id
    console.log(`✅ Perfil creado: ${testProfileId}`)
    
    // Test 2: Generar un reporte
    console.log('\n2️⃣ Solicitando generación de reporte...')
    console.log('-'.repeat(60))
    
    const generateResponse = await fetch(`${BASE_URL}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: testProfileId
      })
    })
    
    if (!generateResponse.ok) {
      const error = await generateResponse.json()
      throw new Error(`Error generando reporte: ${JSON.stringify(error)}`)
    }
    
    const generateData = await generateResponse.json()
    reportId = generateData.report_id
    
    console.log(`✅ Reporte iniciado: ${reportId}`)
    console.log(`   Status: ${generateData.status}`)
    console.log(`   Mensaje: ${generateData.message}`)
    
    // Test 3: Polling del estado
    console.log('\n3️⃣ Monitoreando progreso del reporte...')
    console.log('-'.repeat(60))
    
    let attempts = 0
    const maxAttempts = 30 // 2.5 minutos (cada 5 segundos)
    let currentStatus = 'PENDING'
    
    while (attempts < maxAttempts) {
      await sleep(5000) // Esperar 5 segundos
      
      const statusResponse = await fetch(`${BASE_URL}/api/reports/${reportId}/status`)
      
      if (!statusResponse.ok) {
        throw new Error(`Error obteniendo estado: ${statusResponse.statusText}`)
      }
      
      const statusData = await statusResponse.json()
      currentStatus = statusData.status
      
      console.log(`   [${attempts + 1}/${maxAttempts}] Status: ${currentStatus}`)
      
      if (currentStatus === 'COMPLETED') {
        console.log(`\n✅ Reporte completado!`)
        console.log(`   Tiempo transcurrido: ${(attempts + 1) * 5}s`)
        console.log(`   Completado en: ${statusData.completed_at}`)
        break
      }
      
      if (currentStatus === 'FAILED') {
        console.log(`\n❌ Reporte falló`)
        console.log(`   Error: ${statusData.error_message}`)
        break
      }
      
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      console.log(`\n⏱️ Timeout: El reporte está tardando más de lo esperado`)
      console.log(`   Último status: ${currentStatus}`)
    }
    
    // Test 4: Obtener reporte completo
    if (currentStatus === 'COMPLETED') {
      console.log('\n4️⃣ Obteniendo reporte completo...')
      console.log('-'.repeat(60))
      
      const reportResponse = await fetch(`${BASE_URL}/api/reports/${reportId}`)
      
      if (!reportResponse.ok) {
        throw new Error(`Error obteniendo reporte: ${reportResponse.statusText}`)
      }
      
      const reportData = await reportResponse.json()
      
      console.log(`✅ Reporte obtenido`)
      console.log(`   ID: ${reportData.id}`)
      console.log(`   Status: ${reportData.status}`)
      console.log(`   Longitud del contenido: ${reportData.content?.length || 0} caracteres`)
      console.log(`\n   Preview (primeras 200 caracteres):`)
      console.log(`   ${'-'.repeat(60)}`)
      console.log(`   ${reportData.content?.substring(0, 200) || 'Sin contenido'}...`)
      console.log(`   ${'-'.repeat(60)}`)
    }
    
    // Test 5: Listar reportes del perfil
    console.log('\n5️⃣ Listando reportes del perfil...')
    console.log('-'.repeat(60))
    
    const listResponse = await fetch(`${BASE_URL}/api/profiles/${testProfileId}/reports`)
    
    if (!listResponse.ok) {
      throw new Error(`Error listando reportes: ${listResponse.statusText}`)
    }
    
    const listData = await listResponse.json()
    
    console.log(`✅ Reportes obtenidos: ${listData.total}`)
    listData.reports.forEach((report: any, idx: number) => {
      console.log(`\n   ${idx + 1}. ${report.id}`)
      console.log(`      Status: ${report.status}`)
      console.log(`      Creado: ${report.created_at}`)
      if (report.completed_at) {
        console.log(`      Completado: ${report.completed_at}`)
      }
    })
    
    // Resumen
    console.log('\n' + '='.repeat(60))
    console.log('✅ Todos los tests completados!')
    console.log('='.repeat(60))
    console.log(`\n📊 Resumen:`)
    console.log(`   Perfil de prueba: ${testProfileId}`)
    console.log(`   Reporte generado: ${reportId}`)
    console.log(`   Status final: ${currentStatus}`)
    
  } catch (error) {
    console.error('\n❌ Error en los tests:', error)
    process.exit(1)
  }
}

// Ejecutar tests
testReportAPIs().catch(error => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})

