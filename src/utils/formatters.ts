// src/utils/formatters.ts
/**
 * Format currency values for Zimbabwe (ZWL)
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZW', {
        style: 'currency',
        currency: 'USD', // Using USD as it's widely used in Zimbabwe
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat('en-ZW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(dateObj)
}

/**
 * Format date and time for display
 */
export const formatDateTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat('en-ZW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj)
}

/**
 * Format time for display
 */
export const formatTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat('en-ZW', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj)
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('en-ZW', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
    }).format(value / 100)
}

/**
 * Format number with thousands separator
 */
export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-ZW').format(value)
}

/**
 * Format phone number for Zimbabwe
 */
export const formatPhoneNumber = (phone: string): string => {
    // Remove any non-numeric characters
    const cleaned = phone.replace(/\D/g, '')

    // Zimbabwe phone number formats
    if (cleaned.length === 9) {
        // Mobile numbers starting with 7
        return `+263 ${cleaned.substring(0, 1)} ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`
    } else if (cleaned.length === 10) {
        // Mobile numbers starting with 07
        return `+263 ${cleaned.substring(1, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`
    } else if (cleaned.length === 12 && cleaned.startsWith('263')) {
        // Numbers starting with 263
        return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)} ${cleaned.substring(10)}`
    }

    // Return original if format not recognized
    return phone
}

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, length: number): string => {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

/**
 * Format business registration number
 */
export const formatBusinessRegNumber = (regNumber: string): string => {
    // Remove any non-alphanumeric characters
    const cleaned = regNumber.replace(/[^A-Za-z0-9]/g, '')

    // Zimbabwe business registration format: XX/XXXX/XX
    if (cleaned.length >= 8) {
        return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 6)}/${cleaned.substring(6, 8)}`
    }

    return regNumber
}

/**
 * Format vehicle registration number
 */
export const formatVehicleRegNumber = (regNumber: string): string => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleaned = regNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

    // Zimbabwe vehicle registration formats
    if (cleaned.length === 6) {
        // Format: AAA 123
        return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`
    } else if (cleaned.length === 7 && /^\d{3}[A-Z]{4}$/.test(cleaned)) {
        // Format: 123 ABCD
        return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`
    }

    return regNumber.toUpperCase()
}

/**
 * Format duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min${minutes !== 1 ? 's' : ''}`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
        return `${hours} hr${hours !== 1 ? 's' : ''}`
    }

    return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`
}

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: string | Date): number => {
    const today = new Date()
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth

    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

/**
 * Format initials from name
 */
export const formatInitials = (firstName: string, lastName?: string): string => {
    const first = firstName.charAt(0).toUpperCase()
    const last = lastName ? lastName.charAt(0).toUpperCase() : ''
    return first + last
}

/**
 * Format full name
 */
export const formatFullName = (firstName: string, lastName?: string): string => {
    return lastName ? `${firstName} ${lastName}` : firstName
}

/**
 * Format address for display
 */
export const formatAddress = (address: string): string => {
    // Basic address formatting - you can enhance this based on Zimbabwe address formats
    return address.split('\n').join(', ')
}

/**
 * Format tax ID/VAT number for Zimbabwe
 */
export const formatTaxId = (taxId: string): string => {
    // Remove any non-alphanumeric characters
    const cleaned = taxId.replace(/[^A-Za-z0-9]/g, '')

    // Zimbabwe VAT number format (example)
    if (cleaned.length >= 10) {
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`
    }

    return taxId
}