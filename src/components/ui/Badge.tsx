import React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray'
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'badge',
        {
          'badge-primary': variant === 'primary',
          'badge-secondary': variant === 'secondary',
          'badge-success': variant === 'success',
          'badge-warning': variant === 'warning',
          'badge-error': variant === 'error',
          'bg-gray-100 text-gray-800': variant === 'gray',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
