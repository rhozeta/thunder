'use client'

import { useState, useEffect } from 'react'
import { Settings, Eye, EyeOff, X, ToggleLeft, ToggleRight } from 'lucide-react'

export interface DashboardSection {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface DashboardSettingsProps {
  sections: DashboardSection[]
  onSectionsChange: (sections: DashboardSection[]) => void
}

export default function DashboardSettings({ sections, onSectionsChange }: DashboardSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localSections, setLocalSections] = useState<DashboardSection[]>([])

  useEffect(() => {
    if (sections && sections.length > 0) {
      setLocalSections(sections)
    }
  }, [sections])

  const handleToggleSection = (sectionId: string) => {
    const updatedSections = localSections.map(section =>
      section.id === sectionId ? { ...section, enabled: !section.enabled } : section
    )
    setLocalSections(updatedSections)
    onSectionsChange(updatedSections)
    // Auto-save to localStorage
    localStorage.setItem('dashboardSections', JSON.stringify(updatedSections))
  }

  const handleResetToDefault = () => {
    const defaultSections = sections.map(section => ({ ...section, enabled: true }))
    setLocalSections(defaultSections)
    onSectionsChange(defaultSections)
    localStorage.removeItem('dashboardSections')
  }

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
        title="Dashboard Settings"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal panel */}
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Dashboard Settings</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Choose which sections to display on your dashboard. Changes are saved automatically.
              </p>

              {/* Dashboard Sections Header */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Dashboard Sections
                </h3>
                
                {/* Section toggles */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {localSections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50">
                      <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>Loading dashboard sections...</p>
                    </div>
                  ) : (
                    localSections.map((section, index) => (
                      <div key={section.id} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                        index !== localSections.length - 1 ? 'border-b border-gray-200' : ''
                      }`}>
                        <div className="flex-1">
                          <h4 className={`font-medium ${section.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                            {section.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                        </div>
                        <button
                          onClick={() => handleToggleSection(section.id)}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            section.enabled 
                              ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title={section.enabled ? 'Hide section' : 'Show section'}
                        >
                          {section.enabled ? (
                            <ToggleRight className="w-6 h-6" />
                          ) : (
                            <ToggleLeft className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={handleResetToDefault}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  {localSections.filter(s => s.enabled).length} of {localSections.length} sections enabled
                </p>
              </div>
          </div>
        </div>
      )}
    </>
  )
}
