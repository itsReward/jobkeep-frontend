// src/types/invoice.ts
export interface Invoice {
    invoiceId: string
    invoiceNumber: string
    clientId: string
    clientName: string
    vehicleId: string
    vehicleInfo?: string
    jobCardId?: string
    quotationId?: string
    invoiceDate: string
    dueDate: string
    subtotal: number
    taxAmount: number
    taxRate: number
    discountAmount: number
    discountPercentage: number
    totalAmount: number
    amountPaid: number
    balanceDue: number
    status: InvoiceStatus
    paymentTerms: string
    notes?: string
    createdAt: string
    updatedAt: string
    items: InvoiceItem[]
}

export interface InvoiceItem {
    itemId: string
    invoiceId: string
    productId?: string
    productCode?: string
    productName?: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
    itemType: InvoiceItemType
}

export interface CreateInvoiceDto {
    clientId: string
    vehicleId: string
    jobCardId?: string
    quotationId?: string
    invoiceDate: string
    dueDate: string
    taxRate?: number
    discountPercentage?: number
    paymentTerms?: string
    notes?: string
    items: CreateInvoiceItemDto[]
}

export interface CreateInvoiceItemDto {
    productId?: string
    description: string
    quantity: number
    unitPrice: number
    itemType: InvoiceItemType
}

export interface UpdateInvoiceDto {
    clientId?: string
    vehicleId?: string
    invoiceDate?: string
    dueDate?: string
    taxRate?: number
    discountPercentage?: number
    paymentTerms?: string
    notes?: string
    items?: CreateInvoiceItemDto[]
}

export interface UpdateInvoiceStatusDto {
    status: InvoiceStatus
    notes?: string
}

export interface InvoiceListFilters {
    status?: InvoiceStatus
    clientId?: string
    dateFrom?: string
    dateTo?: string
    search?: string
}

export interface InvoiceSummary {
    totalInvoices: number
    totalAmount: number
    paidAmount: number
    pendingAmount: number
    overdueAmount: number
    draftCount: number
    sentCount: number
    paidCount: number
    overdueCount: number
    cancelledCount: number
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

export enum InvoiceItemType {
    LABOR = 'LABOR',
    PART = 'PART',
    CONSUMABLE = 'CONSUMABLE'
}

export const INVOICE_STATUS_LABELS = {
    [InvoiceStatus.DRAFT]: 'Draft',
    [InvoiceStatus.SENT]: 'Sent',
    [InvoiceStatus.PAID]: 'Paid',
    [InvoiceStatus.OVERDUE]: 'Overdue',
    [InvoiceStatus.CANCELLED]: 'Cancelled'
} as const

export const INVOICE_STATUS_COLORS = {
    [InvoiceStatus.DRAFT]: 'secondary',
    [InvoiceStatus.SENT]: 'warning',
    [InvoiceStatus.PAID]: 'success',
    [InvoiceStatus.OVERDUE]: 'error',
    [InvoiceStatus.CANCELLED]: 'gray'
} as const

export const INVOICE_ITEM_TYPE_LABELS = {
    [InvoiceItemType.LABOR]: 'Labor',
    [InvoiceItemType.PART]: 'Part',
    [InvoiceItemType.CONSUMABLE]: 'Consumable'
} as const

// Payment types for invoice payments
export interface InvoicePayment {
    paymentId: string
    invoiceId: string
    amount: number
    paymentMethod: string
    paymentDate: string
    status: string
    notes?: string
    createdAt: string
}

export interface CreateInvoicePaymentDto {
    invoiceId: string
    amount: number
    paymentMethod: string
    paymentDate: string
    notes?: string
}

export const PAYMENT_METHODS = {
    CASH: 'CASH',
    CARD: 'CARD',
    BANK_TRANSFER: 'BANK_TRANSFER',
    MOBILE_MONEY: 'MOBILE_MONEY',
    CHEQUE: 'CHEQUE'
} as const

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.CASH]: 'Cash',
    [PAYMENT_METHODS.CARD]: 'Card',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
    [PAYMENT_METHODS.MOBILE_MONEY]: 'Mobile Money',
    [PAYMENT_METHODS.CHEQUE]: 'Cheque'
} as const

// Product search for invoice items
export interface ProductSearchResult {
    productId: string
    productCode: string
    productName: string
    description: string
    sellingPrice: number
    currentStock: number
    unitOfMeasure: string
}

// Utility types for invoice calculations
export interface InvoiceCalculations {
    subtotal: number
    taxAmount: number
    discountAmount: number
    totalAmount: number
}

// Invoice PDF generation
export interface InvoicePdfOptions {
    includePayments?: boolean
    includeTaxBreakdown?: boolean
    includeTerms?: boolean
}

// Pagination response type
export interface PaginatedResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
}