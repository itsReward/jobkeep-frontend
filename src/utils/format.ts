// src/utils/format.ts
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount)
}

export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date))
}

export const formatDateTime = (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

export const formatNumber = (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num)
}

export const formatPercentage = (num: number, decimals: number = 1): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num / 100)
}

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

export const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export const formatStockLevel = (current: number, minimum: number): {
    level: 'high' | 'normal' | 'low' | 'out'
    color: string
    label: string
} => {
    if (current === 0) {
        return { level: 'out', color: 'text-red-600', label: 'Out of Stock' }
    } else if (current <= minimum) {
        return { level: 'low', color: 'text-orange-600', label: 'Low Stock' }
    } else if (current <= minimum * 2) {
        return { level: 'normal', color: 'text-yellow-600', label: 'Normal' }
    } else {
        return { level: 'high', color: 'text-green-600', label: 'In Stock' }
    }
}