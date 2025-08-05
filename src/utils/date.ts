import { format, parseISO, isValid, differenceInDays, formatDistanceToNow } from 'date-fns'

export const formatDate = (dateString: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
    if (!dateString) return 'N/A'

    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : dateString

        if (!isValid(date)) return 'Invalid Date'

        return format(date, formatStr)
    } catch (error) {
        console.error('Error formatting date:', error)
        return 'Invalid Date'
    }
}

export const formatDateTime = (dateString: string | Date): string => {
    return formatDate(dateString, 'MMM dd, yyyy hh:mm aa')
}

export const formatTime = (dateString: string | Date): string => {
    return formatDate(dateString, 'hh:mm aa')
}

export const formatDateShort = (dateString: string | Date): string => {
    return formatDate(dateString, 'MMM dd')
}

export const isOverdue = (dateString: string | Date): boolean => {
    if (!dateString) return false

    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
        return isValid(date) && date < new Date()
    } catch (error) {
        return false
    }
}

export const getDaysUntilDue = (dateString: string | Date): number => {
    if (!dateString) return 0

    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : dateString

        if (!isValid(date)) return 0

        return differenceInDays(date, new Date())
    } catch (error) {
        return 0
    }
}

export const getRelativeTime = (dateString: string | Date): string => {
    if (!dateString) return 'N/A'

    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : dateString

        if (!isValid(date)) return 'Invalid Date'

        return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
        return 'Invalid Date'
    }
}

export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
    const start = formatDate(startDate, 'MMM dd')
    const end = formatDate(endDate, 'MMM dd, yyyy')

    return `${start} - ${end}`
}

export const getDueDateStatus = (dateString: string | Date): {
    status: 'overdue' | 'due-soon' | 'on-track'
    label: string
    className: string
} => {
    const daysUntil = getDaysUntilDue(dateString)

    if (daysUntil < 0) {
        return {
            status: 'overdue',
            label: `${Math.abs(daysUntil)} days overdue`,
            className: 'text-error-600 bg-error-50'
        }
    } else if (daysUntil <= 2) {
        return {
            status: 'due-soon',
            label: daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
            className: 'text-warning-600 bg-warning-50'
        }
    } else {
        return {
            status: 'on-track',
            label: `Due in ${daysUntil} days`,
            className: 'text-success-600 bg-success-50'
        }
    }
}