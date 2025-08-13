'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface ChipOption {
  value: string
  label: string
  color: string
  bgColor: string
  textColor: string
}

interface ChipSelectorProps {
  value: string
  onChange: (value: string) => void
  options: ChipOption[]
  className?: string
  disabled?: boolean
}

export function ChipSelector({ 
  value, 
  onChange, 
  options, 
  className = "",
  disabled = false 
}: ChipSelectorProps) {
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

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium
          border transition-all duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-sm'}
          ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        `}
        style={{
          backgroundColor: selectedOption?.bgColor || '#f3f4f6',
          color: selectedOption?.textColor || '#374151',
          borderColor: selectedOption?.color || '#d1d5db'
        }}
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-full">
          <div className="flex flex-col">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  flex items-center justify-center mx-2 my-1 px-3 py-1.5 rounded-full text-sm font-medium
                  border transition-all duration-200 hover:shadow-sm
                  ${value === option.value ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                `}
                style={{
                  backgroundColor: option.bgColor,
                  color: option.textColor,
                  borderColor: option.color
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
