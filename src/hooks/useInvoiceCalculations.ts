import { useMemo } from 'react'
import { CreateInvoiceItemDto, InvoiceCalculations } from '@/types'

export const useInvoiceCalculations = (
    items: CreateInvoiceItemDto[],
    taxRate: number = 15,
    discountPercentage: number = 0
): InvoiceCalculations => {
    return useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        const discountAmount = (subtotal * discountPercentage) / 100
        const discountedSubtotal = subtotal - discountAmount
        const taxAmount = (discountedSubtotal * taxRate) / 100
        const totalAmount = discountedSubtotal + taxAmount

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2))
        }
    }, [items, taxRate, discountPercentage])
}
