'use client'

import React from 'react'
import { RotateCcw } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'

export function OnboardingResetButton() {
  const { resetOnboarding } = useOnboarding()

  const handleReset = () => {
    if (confirm('Reset onboarding tour? This will show the tour on your next visit.')) {
      resetOnboarding()
    }
  }

  return (
    <button
      onClick={handleReset}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <RotateCcw className="w-4 h-4" />
      <span>Restart Tour</span>
    </button>
  )
}
