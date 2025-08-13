'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
  color?: string
  description?: string
}

interface ClickableChipDropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  chipColor?: string
  chipBgColor?: string
  chipTextColor?: string
  className?: string
}

export function ClickableChipDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select option...",
  chipColor,
  chipBgColor,
  chipTextColor,
  className = ""
}: ClickableChipDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleChipClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {value ? (
        // Show colored chip when value is selected
        <button
          type="button"
          onClick={handleChipClick}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer hover:shadow-sm"
          style={{
            backgroundColor: chipBgColor || '#f3f4f6',
            color: chipTextColor || '#374151',
            borderColor: chipColor || '#d1d5db'
          }}
        >
          <span>{selectedOption?.label || value}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        // Show regular dropdown button when no value selected
        <button
          type="button"
          onClick={handleChipClick}
          className="w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors bg-white cursor-pointer"
        >
          <span className="text-gray-500">{placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                ${value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
              `}
            >
              <div className="flex items-center space-x-2">
                {option.color && (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
