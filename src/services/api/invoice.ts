// src/services/api/invoice.ts
import { ApiService } from './base'
import {
    Invoice,
    CreateInvoiceDto,
    UpdateInvoiceDto,
    UpdateInvoiceStatusDto,
    InvoiceListFilters,
    InvoiceSummary,
    InvoicePayment,
    CreateInvoicePaymentDto,
    ProductSearchResult,
    InvoiceStatus
} from '@/types/invoice'
import { PaginatedResponse } from '@/types'

export interface InvoiceQueryParams {
    page?: number
    size?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
    filters?: InvoiceListFilters
}

export class InvoiceService extends ApiService {
    constructor() {
        super('/invoices')
    }

    async getAll(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
        const searchParams = new URLSearchParams()

        if (params?.page !== undefined) searchParams.set('page', params.page.toString())
        if (params?.size !== undefined) searchParams.set('size', params.size.toString())
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
        if (params?.sortDirection) searchParams.set('sortDirection', params.sortDirection)

        // Add filters
        if (params?.filters) {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.set(key, value.toString())
                }
            })
        }

        const queryString = searchParams.toString()
        const endpoint = queryString ? `/all?${queryString}` : '/all'

        return this.get<PaginatedResponse<Invoice>>(endpoint)
    }

    async getById(id: string): Promise<Invoice> {
        return this.get<Invoice>(`/get/${id}`)
    }

    async create(invoice: CreateInvoiceDto): Promise<Invoice> {
        return this.post<Invoice>('/new', invoice)
    }

    async update(id: string, invoice: UpdateInvoiceDto): Promise<Invoice> {
        return this.put<Invoice>(`/update/${id}`, invoice)
    }

    async delete(id: string): Promise<{ message: string }> {
        return super.delete<{ message: string }>(`/delete/${id}`)
    }

    async updateStatus(id: string, statusUpdate: UpdateInvoiceStatusDto): Promise<Invoice> {
        return this.put<Invoice>(`/status/${id}`, statusUpdate)
    }

    async sendToClient(id: string): Promise<{ message: string }> {
        return this.post<{ message: string }>(`/send/${id}`, {})
    }

    async emailToClient(id: string, emailData?: any): Promise<{ message: string }> {
        return this.post<{ message: string }>(`/email/${id}`, emailData || {})
    }

    async downloadPdf(id: string): Promise<Blob> {
        const response = await fetch(`${this.baseUrl}/pdf/${id}`, {
            method: 'GET',
            headers: this.getHeaders(),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.blob()
    }

    async getSummary(filters?: { dateFrom?: string; dateTo?: string }): Promise<InvoiceSummary> {
        const searchParams = new URLSearchParams()
        if (filters?.dateFrom) searchParams.set('dateFrom', filters.dateFrom)
        if (filters?.dateTo) searchParams.set('dateTo', filters.dateTo)

        const queryString = searchParams.toString()
        const endpoint = queryString ? `/summary?${queryString}` : '/summary'

        return this.get<InvoiceSummary>(endpoint)
    }

    async searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
        return this.get<ProductSearchResult[]>(`/products/search?q=${encodeURIComponent(searchTerm)}`)
    }

    // Auto-update overdue invoices
    async checkOverdueInvoices(): Promise<{ updatedCount: number }> {
        return this.post<{ updatedCount: number }>('/check-overdue', {})
    }
}

export class InvoicePaymentService extends ApiService {
    constructor() {
        super('/api/invoice-payments')
    }

    async getByInvoiceId(invoiceId: string): Promise<InvoicePayment[]> {
        return this.get<InvoicePayment[]>(`/invoice/${invoiceId}`)
    }

    async create(payment: CreateInvoicePaymentDto): Promise<InvoicePayment> {
        return this.post<InvoicePayment>('/new', payment)
    }

    async refund(paymentId: string, refundData?: any): Promise<InvoicePayment> {
        return this.post<InvoicePayment>(`/refund/${paymentId}`, refundData || {})
    }
}

// Export service instances
export const invoiceService = new InvoiceService()
export const invoicePaymentService = new InvoicePaymentService()