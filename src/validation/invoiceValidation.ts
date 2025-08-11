import * as yup from 'yup'
import { InvoiceItemType } from '@/types'

export const invoiceItemSchema = yup.object({
    productId: yup.string(),
    description: yup.string().required('Description is required'),
    quantity: yup.number()
        .positive('Quantity must be positive')
        .required('Quantity is required'),
    unitPrice: yup.number()
        .min(0, 'Unit price must be non-negative')
        .required('Unit price is required'),
    itemType: yup.string()
        .oneOf(Object.values(InvoiceItemType))
        .required('Item type is required')
})

export const invoiceSchema = yup.object({
    clientId: yup.string().required('Client is required'),
    vehicleId: yup.string().required('Vehicle is required'),
    jobCardId: yup.string(),
    quotationId: yup.string(),
    invoiceDate: yup.string().required('Invoice date is required'),
    dueDate: yup.string().required('Due date is required')
        .test('due-after-invoice', 'Due date must be after invoice date', function(value) {
            const { invoiceDate } = this.parent
            if (!invoiceDate || !value) return true
            return new Date(value) >= new Date(invoiceDate)
        }),
    taxRate: yup.number()
        .min(0, 'Tax rate must be non-negative')
        .max(100, 'Tax rate cannot exceed 100%')
        .default(15),
    discountPercentage: yup.number()
        .min(0, 'Discount cannot be negative')
        .max(100, 'Discount cannot exceed 100%')
        .default(0),
    paymentTerms: yup.string().default('Net 30'),
    notes: yup.string(),
    items: yup.array()
        .of(invoiceItemSchema)
        .min(1, 'At least one item is required')
        .required('Items are required')
})

export const paymentSchema = yup.object({
    amount: yup.number()
        .positive('Amount must be positive')
        .required('Amount is required'),
    paymentMethod: yup.string().required('Payment method is required'),
    paymentDate: yup.string().required('Payment date is required'),
    notes: yup.string()
})