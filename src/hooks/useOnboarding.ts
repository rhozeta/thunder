'use client'

import { useState, useEffect } from 'react'

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    const completed = localStorage.getItem('onboardingCompleted')
    if (completed) {
      setHasCompletedOnboarding(true)
    }
  }, [])

  // Show onboarding on first login
  const triggerOnboarding = () => {
    const completed = localStorage.getItem('onboardingCompleted')
    if (!completed) {
      setShowOnboarding(true)
    }
  }

  // Mark onboarding as completed
  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true')
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
  }

  // Reset onboarding (for testing)
  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted')
    setHasCompletedOnboarding(false)
    setShowOnboarding(false)
  }

  return {
    showOnboarding,
    hasCompletedOnboarding,
    triggerOnboarding,
    completeOnboarding,
    resetOnboarding,
    setShowOnboarding
  }
}
