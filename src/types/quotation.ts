// src/types/quotation.ts
export interface Quotation {
    quotationId: string
    quotationNumber: string
    clientName: string
    clientSurname: string
    vehicleInfo?: string
    quotationDate: string
    validUntil?: string
    status: QuotationStatus
    subtotal: number
    taxRate: number
    taxAmount: number
    discountPercentage: number
    discountAmount: number
    totalAmount: number
    notes?: string
    termsAndConditions?: string
    convertedToJobCard: boolean
    createdAt: string
    items: QuotationItem[]
}

export interface QuotationItem {
    itemId: string
    productCode?: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
    itemType: QuotationItemType
}

export interface CreateQuotationDto {
    clientId: string
    vehicleId?: string
    validUntil?: string
    taxRate?: number
    discountPercentage?: number
    notes?: string
    termsAndConditions?: string
    items: CreateQuotationItemDto[]
}

export interface CreateQuotationItemDto {
    productId?: string
    description: string
    quantity: number
    unitPrice: number
    itemType: QuotationItemType
}

export interface UpdateQuotationDto {
    clientId?: string
    vehicleId?: string
    validUntil?: string
    taxRate?: number
    discountPercentage?: number
    notes?: string
    termsAndConditions?: string
    items?: CreateQuotationItemDto[]
}

export interface UpdateQuotationStatusDto {
    status: QuotationStatus
    notes?: string
}

export interface QuotationListFilters {
    status?: QuotationStatus
    clientId?: string
    dateFrom?: string
    dateTo?: string
    search?: string
}

export interface QuotationSummary {
    totalQuotations: number
    totalAmount: number
    pendingAmount: number
    approvedAmount: number
    draftCount: number
    pendingCount: number
    approvedCount: number
    rejectedCount: number
    expiredCount: number
    convertedCount: number
}

export enum QuotationStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    CONVERTED = 'CONVERTED'
}

export enum QuotationItemType {
    PART = 'PART',
    LABOR = 'LABOR',
    SERVICE = 'SERVICE',
    MISC = 'MISC'
}

export const QUOTATION_STATUS_LABELS = {
    [QuotationStatus.DRAFT]: 'Draft',
    [QuotationStatus.PENDING]: 'Pending',
    [QuotationStatus.APPROVED]: 'Approved',
    [QuotationStatus.REJECTED]: 'Rejected',
    [QuotationStatus.EXPIRED]: 'Expired',
    [QuotationStatus.CONVERTED]: 'Converted'
} as const

export const QUOTATION_STATUS_COLORS = {
    [QuotationStatus.DRAFT]: 'secondary',
    [QuotationStatus.PENDING]: 'warning',
    [QuotationStatus.APPROVED]: 'success',
    [QuotationStatus.REJECTED]: 'error',
    [QuotationStatus.EXPIRED]: 'gray',
    [QuotationStatus.CONVERTED]: 'blue'
} as const

export const QUOTATION_ITEM_TYPE_LABELS = {
    [QuotationItemType.PART]: 'Part',
    [QuotationItemType.LABOR]: 'Labor',
    [QuotationItemType.SERVICE]: 'Service',
    [QuotationItemType.MISC]: 'Miscellaneous'
} as const

// Product search for quotation items
export interface ProductSearchResult {
    productId: string
    productCode: string
    productName: string
    description: string
    sellingPrice: number
    currentStock: number
    unitOfMeasure: string
}

// Utility types for quotation calculations
export interface QuotationCalculations {
    subtotal: number
    taxAmount: number
    discountAmount: number
    totalAmount: number
}

// Quotation PDF generation
export interface QuotationPdfOptions {
    includeTerms?: boolean
    includeNotes?: boolean
    template?: 'standard' | 'detailed' | 'simple'
}

// Constants
export const DEFAULT_QUOTATION_TAX_RATE = 15 // 15% for Zimbabwe
export const DEFAULT_QUOTATION_VALID_DAYS = 30 // 30 days validity
export const QUOTATION_NUMBER_PREFIX = 'QUO'