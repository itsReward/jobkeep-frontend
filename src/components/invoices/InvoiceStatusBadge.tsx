import React from 'react'
import { Chip } from '@mui/material'
import { InvoiceStatus, INVOICE_STATUS_LABELS } from '@/types'

interface InvoiceStatusBadgeProps {
    status: InvoiceStatus
    size?: 'small' | 'medium'
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status, size = 'small' }) => {
    const getStatusColor = (status: InvoiceStatus) => {
        const colorMap = {
            [InvoiceStatus.DRAFT]: 'default',
            [InvoiceStatus.SENT]: 'warning',
            [InvoiceStatus.PAID]: 'success',
            [InvoiceStatus.OVERDUE]: 'error',
            [InvoiceStatus.CANCELLED]: 'secondary'
        } as const
        return colorMap[status] || 'default'
    }

    return (
        <Chip
            label={INVOICE_STATUS_LABELS[status]}
            color={getStatusColor(status)}
            size={size}
        />
    )
}

export default InvoiceStatusBadge