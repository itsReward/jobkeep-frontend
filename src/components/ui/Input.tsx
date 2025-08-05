import React from 'react'
import { cn } from '@/utils/cn'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        )}
        <input
          id={inputId}
          className={cn(
            'input',
            {
              'pl-10': Icon && iconPosition === 'left',
              'pr-10': Icon && iconPosition === 'right',
              'border-error-500 focus:border-error-500 focus:ring-error-500': error,
            },
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
