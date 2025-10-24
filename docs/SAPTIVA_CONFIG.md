# 🤖 Configuración de Saptiva para MarketPulse

Documentación de cómo integrar Saptiva con Vercel AI SDK basada en la [documentación oficial](https://saptiva.gitbook.io/saptiva-docs).

---

## 🔗 Enlaces Oficiales

- **Documentación:** https://saptiva.gitbook.io/saptiva-docs
- **Modelos Disponibles:** https://saptiva.gitbook.io/saptiva-docs/basicos/modelos-disponibles
- **API Reference:** https://saptiva.gitbook.io/saptiva-docs/basicos/api-reference
- **Endpoint:** `https://api.saptiva.com/v1/chat/completions`

---

## ⚙️ Configuración Correcta

### Cliente con Vercel AI SDK

```typescript
import { generateText, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Saptiva es compatible con OpenAI API
const saptiva = createOpenAI({
  apiKey: process.env.SAPTIVA_API_KEY!,
  baseURL: 'https://api.saptiva.com/v1',  // ⚠️ Importante: .com no .ai
})
```

### Variables de Entorno

```bash
# .env.local
SAPTIVA_API_KEY=tu_api_key_aqui
```

---

## 🎯 Modelos Recomendados para MarketPulse

Según la [documentación de modelos](https://saptiva.gitbook.io/saptiva-docs/basicos/modelos-disponibles):

### Para Identificación de Competidores
**Modelo:** `Saptiva Turbo`
- **Base:** Qwen 3:30B (No Think)
- **Mejor para:** Respuestas rápidas, bajo costo
- **Precio:** $0.2 IN / $0.6 OUT por millón de tokens
- **Uso:** Extracción rápida de competidores

### Para Análisis de Noticias
**Modelo:** `Saptiva Cortex`
- **Base:** Qwen 3:30B (Think)
- **Mejor para:** Tareas de razonamiento
- **Precio:** $0.30 IN / $0.8 OUT por millón de tokens
- **Uso:** Análisis profundo de actividad de competidores

### Para Generación de Reportes
**Modelo:** `Saptiva Legacy`
- **Base:** LLama 3.3:70B
- **Mejor para:** Compatibilidad con herramientas, contexto largo
- **Precio:** $0.2 IN / $0.6 OUT por millón de tokens
- **Uso:** Generación de reportes ejecutivos detallados

### Para Análisis Complejos (Opcional)
**Modelo:** `grok3`
- **Base:** xAI Grok 3
- **Mejor para:** Razonamiento profundo y contexto medio-largo
- **Precio:** $15 IN / $45 OUT por millón de tokens
- **Uso:** Análisis muy complejos (solo si se requiere)

---

## 📝 Ejemplo de Uso

### Generación de Texto Simple

```typescript
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const saptiva = createOpenAI({
  apiKey: process.env.SAPTIVA_API_KEY!,
  baseURL: 'https://api.saptiva.com/v1',
})

const result = await generateText({
  model: saptiva('Saptiva Turbo'),
  messages: [
    {
      role: 'system',
      content: 'Eres un analista de inteligencia competitiva.'
    },
    {
      role: 'user',
      content: 'Identifica competidores de una empresa de SaaS para gestión de proyectos.'
    }
  ],
  temperature: 0.7,
  maxTokens: 600,
})

console.log(result.text)
```

### Streaming de Respuestas

```typescript
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const saptiva = createOpenAI({
  apiKey: process.env.SAPTIVA_API_KEY!,
  baseURL: 'https://api.saptiva.com/v1',
})

const result = await streamText({
  model: saptiva('Saptiva Cortex'),
  prompt: 'Analiza estas noticias...',
  temperature: 0.4,
  maxTokens: 2000,
})

// Usar el stream
for await (const chunk of result.textStream) {
  process.stdout.write(chunk)
}
```

### Generación de JSON Estructurado

```typescript
const result = await generateText({
  model: saptiva('Saptiva Turbo'),
  messages: [
    {
      role: 'system',
      content: 'Responde ÚNICAMENTE con JSON válido.'
    },
    {
      role: 'user',
      content: 'Lista 5 competidores de Notion en formato JSON'
    }
  ],
  temperature: 0.3,
})

const data = JSON.parse(result.text)
```

---

## 🔧 Parámetros Disponibles

Según la [API Reference](https://saptiva.gitbook.io/saptiva-docs/basicos/api-reference):

### Parámetros Obligatorios
- `model` (string): Nombre del modelo a usar
- `messages` (array): Historial de conversación

### Parámetros Opcionales
- `max_tokens` (number): Número máximo de tokens (default: 600)
- `temperature` (double): Aleatoriedad (0.0-1.0, default: 0.7)
- `top_p` (double): Diversidad (0.0-1.0, default: 0.9)
- `stream` (bool): Streaming activado/desactivado
- `stop` (string): Secuencias de parada

---

## 💰 Estrategia de Costos para MarketPulse

### Presupuesto Estimado por Reporte

| Paso | Modelo | Tokens IN | Tokens OUT | Costo |
|------|--------|-----------|------------|-------|
| Identificar competidores | Saptiva Turbo | 500 | 1,000 | $0.001 |
| Analizar 5 competidores | Saptiva Cortex | 5,000 | 2,500 | $0.004 |
| Generar reporte | Saptiva Legacy | 3,000 | 4,000 | $0.003 |
| **Total por reporte** | | | | **~$0.008** |

**Costo aproximado:** $0.01 USD por reporte generado (muy económico)

---

## ⚠️ Diferencias con la Documentación Interna

La documentación en `F004-integracion-saptiva.md` tenía algunas inconsistencias:

### ❌ Incorrecto (en docs internas):
```typescript
baseURL: 'https://api.saptiva.ai/v1'  // ❌ Dominio incorrecto
```

### ✅ Correcto (documentación oficial):
```typescript
baseURL: 'https://api.saptiva.com/v1'  // ✅ Usar .com
```

---

## 🎯 Implementación en MarketPulse

### 1. Cliente Base (`lib/ai/saptiva.ts`)

```typescript
import { generateText, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const saptiva = createOpenAI({
  apiKey: process.env.SAPTIVA_API_KEY!,
  baseURL: 'https://api.saptiva.com/v1',
})

export const saptivaModels = {
  fast: saptiva('Saptiva Turbo'),
  reasoning: saptiva('Saptiva Cortex'),
  advanced: saptiva('Saptiva Legacy'),
} as const

export type SaptivaModel = keyof typeof saptivaModels
```

### 2. Funciones Wrapper

```typescript
export async function generateWithSaptiva(
  prompt: string,
  options: {
    model?: SaptivaModel
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}
) {
  const {
    model = 'fast',
    temperature = 0.7,
    maxTokens = 600,
    systemPrompt
  } = options

  const messages: any[] = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })

  const result = await generateText({
    model: saptivaModels[model],
    messages,
    temperature,
    maxTokens,
  })

  return result.text
}
```

### 3. Generación de JSON

```typescript
export async function generateJSON<T = any>(
  prompt: string,
  options: {
    model?: SaptivaModel
    temperature?: number
    systemPrompt?: string
  } = {}
): Promise<T> {
  const messages: any[] = [
    {
      role: 'system',
      content: `${options.systemPrompt || ''}\n\nResponde ÚNICAMENTE con JSON válido, sin texto adicional.`
    },
    {
      role: 'user',
      content: prompt
    }
  ]

  const result = await generateText({
    model: saptivaModels[options.model || 'fast'],
    messages,
    temperature: options.temperature || 0.3,
  })

  // Extraer JSON del texto
  const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/) || 
                     result.text.match(/\{[\s\S]*\}/)
  
  if (!jsonMatch) {
    throw new Error('No se pudo extraer JSON de la respuesta')
  }

  const jsonText = jsonMatch[1] || jsonMatch[0]
  return JSON.parse(jsonText)
}
```

---

## 🧪 Testing

### Test Básico

```typescript
import { generateWithSaptiva } from '@/lib/ai/saptiva'

async function testSaptiva() {
  const result = await generateWithSaptiva(
    '¿Cuál es la capital de Francia?',
    {
      model: 'fast',
      temperature: 0.7,
      systemPrompt: 'Eres un asistente útil.'
    }
  )
  
  console.log('Respuesta:', result)
}

testSaptiva()
```

---

## 📚 Recursos Adicionales

- [Quickstart Guide](https://saptiva.gitbook.io/saptiva-docs/comienza/quickstart)
- [Rate Limits](https://saptiva.gitbook.io/saptiva-docs/basicos/limites-de-uso-rate-limits)
- [Códigos de Error](https://saptiva.gitbook.io/saptiva-docs/basicos/codigos-de-error)
- [Mejores Prácticas de Prompteo](https://saptiva.gitbook.io/saptiva-docs/mejores-practicas/prompteo)

---

**Última actualización:** 24 de Octubre de 2025  
**Basado en:** Documentación oficial de Saptiva  
**Proyecto:** MarketPulse MVP

