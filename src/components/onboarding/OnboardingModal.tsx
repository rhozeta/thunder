'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Home, Users, Building2, Briefcase, Calendar, CheckSquare, Settings, CheckCircle } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  pageName: string
  icon: React.ElementType
  features: string[]
  tips: string[]
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Thunder CRM!',
    description: 'Your complete real estate management solution',
    pageName: 'Getting Started',
    icon: Home,
    features: [
      'Manage contacts, properties, and deals in one place',
      'Track your entire sales pipeline',
      'Never lose important client information',
      'Close deals faster with organized workflows'
    ],
    tips: [
      'This tour will walk you through each section',
      'You can skip this tour and revisit it from the help menu',
      'Start with adding your first contact or property'
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard - Your Command Center',
    description: 'Get a complete overview of your real estate business',
    pageName: 'Dashboard',
    icon: Home,
    features: [
      'Quick stats showing total contacts, properties, and deals',
      'Recent activity timeline with all interactions',
      'Pipeline overview with deal values and stages',
      'Upcoming tasks and appointments'
    ],
    tips: [
      'Check your dashboard daily for quick updates',
      'Use the stats to track your performance',
      'Click on any stat to dive deeper into that section'
    ]
  },
  {
    id: 'contacts',
    title: 'Contacts - Your Client Database',
    description: 'Manage all your clients, leads, and partners',
    pageName: 'Contacts',
    icon: Users,
    features: [
      'Complete contact profiles with communication history',
      'Lead scoring and qualification tracking',
      'Email and phone integration with follow-up reminders',
      'Group contacts by deal stage or property interest'
    ],
    tips: [
      'Add detailed notes after each client interaction',
      'Use tags to organize contacts (Hot Lead, Buyer, Seller, etc.)',
      'Set follow-up reminders for important conversations'
    ]
  },
  {
    id: 'properties',
    title: 'Properties - Listings & Client Interests',
    description: 'Manage your listings and track client property interests',
    pageName: 'Properties',
    icon: Building2,
    features: [
      'Property galleries with unlimited high-quality photos',
      'Advanced filtering by price, location, bedrooms, and more',
      'Market analysis and pricing recommendations',
      'Integration with contacts to track client interest'
    ],
    tips: [
      'Upload professional photos for better engagement',
      'Use the map view to visualize property locations',
      'Track which clients are interested in each property'
    ]
  },
  {
    id: 'deals',
    title: 'Deals - Your Sales Pipeline',
    description: 'Track every deal from first contact to closing',
    pageName: 'Deals',
    icon: Briefcase,
    features: [
      'Visual pipeline with drag-and-drop deal stages',
      'Deal value tracking and revenue forecasting',
      'Document management and e-signature integration',
      'Commission calculations and closing tracking'
    ],
    tips: [
      'Update deal stages regularly to track progress',
      'Attach important documents directly to deals',
      'Use deal value for accurate revenue forecasting'
    ]
  },
  {
    id: 'calendar',
    title: 'Calendar - Scheduling & Appointments',
    description: 'Never miss an appointment or deadline',
    pageName: 'Calendar',
    icon: Calendar,
    features: [
      'Integrated calendar with property and contact links',
      'Appointment scheduling with automatic reminders',
      'Task management with priority levels',
      'Sync with external calendars (Google, Outlook)'
    ],
    tips: [
      'Schedule property showings directly from the calendar',
      'Set reminders for important follow-ups',
      'Link appointments to specific contacts and properties'
    ]
  },
  {
    id: 'tasks',
    title: 'Tasks - Stay Organized',
    description: 'Manage your daily tasks and to-dos',
    pageName: 'Tasks',
    icon: CheckSquare,
    features: [
      'Task lists with priority and due dates',
      'Recurring tasks for regular follow-ups',
      'Integration with deals and contacts',
      'Progress tracking and completion analytics'
    ],
    tips: [
      'Create task templates for common activities',
      'Set due dates to stay on track',
      'Use task categories for better organization'
    ]
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Ready to start closing more deals',
    pageName: 'Getting Started',
    icon: CheckCircle,
    features: [
      'Start by adding your first contact',
      'Create your first property listing',
      'Set up your first deal pipeline',
      'Schedule your first appointment'
    ],
    tips: [
      'Take the tour again anytime from the help menu',
      'Check the knowledge base for detailed guides',
      'Contact support if you need any help'
    ]
  }
]

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsCompleted(true)
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    setIsCompleted(true)
    onComplete()
  }

  const currentStepData = onboardingSteps[currentStep]
  const IconComponent = currentStepData.icon

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
              <p className="text-sm text-gray-600">{currentStepData.description}</p>
            </div>
          </div>
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Page Preview */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <IconComponent className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">{currentStepData.pageName}</h3>
            </div>
            
            {/* Placeholder for actual page screenshot */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center">
                <IconComponent className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{currentStepData.pageName}</h4>
                <p className="text-gray-600">Interactive page preview</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
            <ul className="space-y-2">
              {currentStepData.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Pro Tips:</h4>
            <ul className="space-y-2">
              {currentStepData.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-4 h-4 bg-blue-100 rounded-full mr-2 mt-0.5 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-blue-600 font-bold">!</span>
                  </div>
                  <span className="text-sm text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={skipTour}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tour
            </button>
            
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <span>{currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}</span>
              {currentStep < onboardingSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
