'use client'

interface StatusChipProps {
  value: string
  color: string
  bgColor: string
  textColor: string
  size?: 'sm' | 'md'
  className?: string
}

export function StatusChip({ 
  value, 
  color, 
  bgColor, 
  textColor, 
  size = 'sm',
  className = '' 
}: StatusChipProps) {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1.5 text-sm'

  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: color
      }}
    >
      {value}
    </span>
  )
}
