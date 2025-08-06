import React from 'react'

// UI Components Exports
export { Button } from './Button'
export { Input } from './Input'
export { Card, CardContent, CardHeader, CardFooter } from './Card'
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table'
export { Badge } from './Badge'

// Loading Component
export const Loading: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }

    return (
        <div className="flex items-center justify-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-primary-200 border-t-primary-500`} > </div> </div>
    )
}