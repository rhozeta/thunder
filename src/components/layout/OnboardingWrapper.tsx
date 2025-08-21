'use client'

import React, { useEffect } from 'react'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useAuth } from '@/contexts/AuthContext'

interface OnboardingWrapperProps {
  children: React.ReactNode
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { showOnboarding, completeOnboarding, triggerOnboarding } = useOnboarding()
  const { user } = useAuth()

  // Trigger onboarding on first login
  useEffect(() => {
    if (user) {
      // Small delay to ensure the app is fully loaded
      const timer = setTimeout(() => {
        triggerOnboarding()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, triggerOnboarding])

  const handleComplete = () => {
    completeOnboarding()
  }

  return (
    <>
      {children}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleComplete}
        onComplete={handleComplete}
      />
    </>
  )
}
