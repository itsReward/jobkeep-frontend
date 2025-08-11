import { Invoice, InvoiceStatus } from '@/types'

export const isInvoiceEditable = (invoice: Invoice): boolean => {
    return invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.SENT
}

export const isInvoiceOverdue = (invoice: Invoice): boolean => {
    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
        return false
    }
    const today = new Date()
    const dueDate = new Date(invoice.dueDate)
    return dueDate < today
}

export const calculateDaysOverdue = (invoice: Invoice): number => {
    if (!isInvoiceOverdue(invoice)) return 0
    const today = new Date()
    const dueDate = new Date(invoice.dueDate)
    return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
}

export const getPaymentProgress = (invoice: Invoice): number => {
    if (invoice.totalAmount === 0) return 0
    return (invoice.amountPaid / invoice.totalAmount) * 100
}

export const generateInvoiceNumber = (lastInvoiceNumber?: string): string => {
    if (!lastInvoiceNumber) return 'INV-000001'

    const match = lastInvoiceNumber.match(/INV-(\d+)/)
    if (!match) return 'INV-000001'

    const nextNumber = parseInt(match[1]) + 1
    return `INV-${nextNumber.toString().padStart(6, '0')}`
}

export const getInvoiceStatusLabel = (status: InvoiceStatus): string => {
    const labels = {
        [InvoiceStatus.DRAFT]: 'Draft',
        [InvoiceStatus.SENT]: 'Sent',
        [InvoiceStatus.PAID]: 'Paid',
        [InvoiceStatus.OVERDUE]: 'Overdue',
        [InvoiceStatus.CANCELLED]: 'Cancelled'
    }
    return labels[status] || status
}