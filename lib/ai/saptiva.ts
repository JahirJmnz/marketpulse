import { generateText, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Cliente de Saptiva (se inicializa lazy)
let saptivaClient: ReturnType<typeof createOpenAI> | null = null

/**
 * Obtiene o crea el cliente de Saptiva
 */
function getSaptivaClient() {
  if (!saptivaClient) {
    const saptivaApiKey = process.env.SAPTIVA_API_KEY || process.env.OPENAI_API_KEY
    
    if (!saptivaApiKey) {
      throw new Error('SAPTIVA_API_KEY no está configurada en las variables de entorno')
    }
    
    saptivaClient = createOpenAI({
      apiKey: saptivaApiKey,
      baseURL: 'https://api.saptiva.com/v1',  // ⚠️ Nota: usar .com, no .ai
    })
  }
  
  return saptivaClient
}

/**
 * Modelos disponibles de Saptiva
 * Documentación: https://saptiva.gitbook.io/saptiva-docs/basicos/modelos-disponibles
 */
const MODEL_NAMES = {
  // Saptiva Turbo: Qwen 3:30B - $0.2/$0.6 por millón de tokens
  fast: 'Saptiva Turbo',
  // Saptiva Cortex: Qwen 3:30B Think - $0.30/$0.8 por millón de tokens
  reasoning: 'Saptiva Cortex',
  // Saptiva Legacy: LLama 3.3:70B - $0.2/$0.6 por millón de tokens
  advanced: 'Saptiva Legacy',
  // Grok 3: $15/$45 por millón de tokens
  premium: 'grok3',
} as const

/**
 * Obtiene el modelo de Saptiva por nombre
 */
function getSaptivaModel(modelName: keyof typeof MODEL_NAMES) {
  const client = getSaptivaClient()
  // Usar explícitamente .chat() para forzar el endpoint de chat/completions
  return client.chat(MODEL_NAMES[modelName])
}

export type SaptivaModel = keyof typeof MODEL_NAMES

/**
 * Genera texto usando un modelo de Saptiva
 */
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
    maxTokens = 8000,    // ⚡⚡⚡ Default alto para respuestas completas
    systemPrompt
  } = options

  const messages: any[] = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })

  const result = await generateText({
    model: getSaptivaModel(model),
    messages,
    temperature,
    maxTokens,
  })

  return result.text
}

/**
 * Genera texto en modo streaming
 */
export async function streamWithSaptiva(
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

  const result = await streamText({
    model: getSaptivaModel(model),
    messages,
    temperature,
    maxTokens,
  })

  return result.toTextStreamResponse()
}

/**
 * Genera y parsea respuesta JSON
 */
export async function generateJSON<T = any>(
  prompt: string,
  options: {
    model?: SaptivaModel
    temperature?: number
    systemPrompt?: string
    maxTokens?: number
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
    model: getSaptivaModel(options.model || 'fast'),
    messages,
    temperature: options.temperature || 0.3,
    maxTokens: options.maxTokens || 8000, // ⚡⚡⚡ Default alto para JSONs grandes
  })

  // Extraer JSON del texto (múltiples estrategias)
  let jsonText = result.text.trim()
  
  // Estrategia 1: JSON en markdown code block
  const markdownMatch = jsonText.match(/```json\n?([\s\S]*?)\n?```/)
  if (markdownMatch) {
    jsonText = markdownMatch[1].trim()
  } else {
    // Estrategia 2: JSON puro (buscar primer { hasta último })
    const startIndex = jsonText.indexOf('{')
    const endIndex = jsonText.lastIndexOf('}')
    
    if (startIndex !== -1 && endIndex !== -1) {
      jsonText = jsonText.substring(startIndex, endIndex + 1)
    }
  }
  
  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('❌ Error parseando JSON:', error)
    console.error('Texto recibido:', result.text.substring(0, 200))
    throw new Error('No se pudo extraer JSON válido de la respuesta')
  }
}

