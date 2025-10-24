'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/hooks/useSession'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FormErrors {
  company_name?: string
  company_description?: string
  general?: string
}

export function CompanyProfileForm() {
  const router = useRouter()
  const { saveSession } = useSession()
  
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Validación en tiempo real
  const validateField = (field: 'company_name' | 'company_description', value: string) => {
    const newErrors = { ...errors }
    
    if (field === 'company_name') {
      if (value.length === 0) {
        delete newErrors.company_name
      } else if (value.length < 2) {
        newErrors.company_name = 'El nombre debe tener al menos 2 caracteres'
      } else if (value.length > 100) {
        newErrors.company_name = 'El nombre es demasiado largo (máximo 100 caracteres)'
      } else {
        delete newErrors.company_name
      }
    }
    
    if (field === 'company_description') {
      if (value.length === 0) {
        delete newErrors.company_description
      } else if (value.length < 50) {
        newErrors.company_description = `La descripción debe tener al menos 50 caracteres (actual: ${value.length})`
      } else if (value.length > 1000) {
        newErrors.company_description = 'La descripción es demasiado larga (máximo 1000 caracteres)'
      } else {
        delete newErrors.company_description
      }
    }
    
    setErrors(newErrors)
  }

  // Verificar si el formulario es válido
  const isFormValid = () => {
    return (
      companyName.length >= 2 &&
      companyName.length <= 100 &&
      companyDescription.length >= 50 &&
      companyDescription.length <= 1000 &&
      Object.keys(errors).length === 0
    )
  }

  // Manejar cambio en nombre de empresa
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCompanyName(value)
    validateField('company_name', value)
  }

  // Manejar cambio en descripción
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCompanyDescription(value)
    validateField('company_description', value)
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_name: companyName,
          company_description: companyDescription
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear perfil')
      }
      
      // Guardar sesión con el perfil creado
      saveSession(data.profile)
      
      // Mostrar mensaje de éxito
      setShowSuccess(true)
      
      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
    } catch (error) {
      console.error('Error al crear perfil:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Error al crear perfil. Por favor, intenta nuevamente.'
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <span className="text-2xl">🎯</span>
        </div>
        <CardTitle className="text-3xl font-bold">
          Tu Analista de Competencia Personal
        </CardTitle>
        <CardDescription className="text-base mt-3">
          Configura tu perfil empresarial y recibe reportes de inteligencia
          competitiva generados con IA
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo: Nombre de la Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company_name">
              Nombre de la empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company_name"
              type="text"
              placeholder="Ej: TechStartup Inc."
              value={companyName}
              onChange={handleNameChange}
              disabled={isSubmitting}
              className={errors.company_name ? 'border-red-500' : ''}
            />
            {errors.company_name && (
              <p className="text-sm text-red-500">{errors.company_name}</p>
            )}
          </div>

          {/* Campo: Descripción del Negocio */}
          <div className="space-y-2">
            <Label htmlFor="company_description">
              Descripción del negocio <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="company_description"
              placeholder="Describe tu empresa, productos/servicios, mercado objetivo y principales competidores conocidos..."
              value={companyDescription}
              onChange={handleDescriptionChange}
              disabled={isSubmitting}
              rows={6}
              className={errors.company_description ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center text-sm">
              {errors.company_description ? (
                <p className="text-red-500">{errors.company_description}</p>
              ) : (
                <p className="text-gray-500">
                  Mínimo 50 caracteres para un mejor análisis
                </p>
              )}
              <p className={`${
                companyDescription.length >= 50 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {companyDescription.length} / 50
              </p>
            </div>
          </div>

          {/* Mensaje de Error General */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Mensaje de Éxito */}
          {showSuccess && (
            <Alert className="border-green-500 bg-green-50">
              <AlertDescription className="text-green-800">
                ✓ Perfil creado exitosamente. Redirigiendo al dashboard...
              </AlertDescription>
            </Alert>
          )}

          {/* Botón de Envío */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid() || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Guardando...
              </>
            ) : (
              'Guardar y Continuar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


