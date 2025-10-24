'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CompanyProfileForm } from '@/components/forms/CompanyProfileForm'
import { hasActiveSession } from '@/lib/session'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Si ya hay una sesión activa, redirigir al dashboard
    if (hasActiveSession()) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <CompanyProfileForm />
      </div>
    </div>
  )
}
