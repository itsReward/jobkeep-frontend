// src/services/api/invoice.ts

import { ApiService } from './base'
import { PaginatedResponse } from '@/types'
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
    InvoiceCalculations
} from '@/types'

class InvoiceService extends ApiService {
    constructor() {
        super('/invoices')
    }

    // Get all invoices with pagination and filters
    async getAll(params?: {
        page?: number
        size?: number
        sortBy?: string
        sortDirection?: 'asc' | 'desc'
        filters?: InvoiceListFilters
    }): Promise<PaginatedResponse<Invoice>> {
        try {
            console.log('🚀 InvoiceService.getAll()', params)

            const searchParams = new URLSearchParams()

            if (params?.page !== undefined) searchParams.set('page', params.page.toString())
            if (params?.size !== undefined) searchParams.set('size', params.size.toString())
            if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
            if (params?.sortDirection) searchParams.set('sortDirection', params.sortDirection)

            // Add filters
            if (params?.filters) {
                if (params.filters.status) searchParams.set('status', params.filters.status)
                if (params.filters.clientId) searchParams.set('clientId', params.filters.clientId)
                if (params.filters.dateFrom) searchParams.set('dateFrom', params.filters.dateFrom)
                if (params.filters.dateTo) searchParams.set('dateTo', params.filters.dateTo)
                if (params.filters.search) searchParams.set('search', params.filters.search)
            }

            const query = searchParams.toString()
            const endpoint = query ? `/all?${query}` : '/all'

            const response = await this.get<{
                content: Invoice[]
                totalElements: number
                totalPages: number
                size: number
                number: number
            }>(endpoint)

            console.log('✅ InvoiceService.getAll() - Success:', response?.content?.length || 0, 'invoices')

            return {
                data: response?.content || [],
                total: response?.totalElements || 0,
                page: response?.number || 0,
                limit: response?.size || 20,
                totalPages: response?.totalPages || 0
            }
        } catch (error: any) {
            console.error('❌ InvoiceService.getAll() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Get invoice by ID
    async getById(id: string): Promise<Invoice> {
        try {
            console.log(`🚀 InvoiceService.getById(${id})`)
            const result = await this.get<Invoice>(`/${id}`)
            console.log('✅ InvoiceService.getById() - Success:', result?.invoiceNumber)
            return result
        } catch (error: any) {
            console.error('❌ InvoiceService.getById() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Create new invoice
    async create(invoice: CreateInvoiceDto): Promise<Invoice> {
        try {
            console.log('🚀 InvoiceService.create()', invoice)
            const result = await this.post<Invoice>('/new', invoice)
            console.log('✅ InvoiceService.create() - Success:', result?.invoiceNumber)
            return result
        } catch (error: any) {
            console.error('❌ InvoiceService.create() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Update invoice
    async update(id: string, invoice: UpdateInvoiceDto): Promise<Invoice> {
        try {
            console.log(`🚀 InvoiceService.update(${id})`, invoice)
            const result = await this.put<Invoice>(`/update/${id}`, invoice)
            console.log('✅ InvoiceService.update() - Success:', result?.invoiceNumber)
            return result
        } catch (error: any) {
            console.error('❌ InvoiceService.update() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Delete invoice
    async delete(id: string): Promise<void> {
        try {
            console.log(`🚀 InvoiceService.delete(${id})`)
            await this.delete(`/delete/${id}`)
            console.log('✅ InvoiceService.delete() - Success')
        } catch (error: any) {
            console.error('❌ InvoiceService.delete() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Update invoice status
    async updateStatus(id: string, statusUpdate: UpdateInvoiceStatusDto): Promise<Invoice> {
        try {
            console.log(`🚀 InvoiceService.updateStatus(${id})`, statusUpdate)
            const result = await this.put<Invoice>(`/${id}/status`, statusUpdate)
            console.log('✅ InvoiceService.updateStatus() - Success:', result?.status)
            return result
        } catch (error: any) {
            console.error('❌ InvoiceService.updateStatus() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Send invoice to client
    async sendToClient(id: string): Promise<void> {
        try {
            console.log(`🚀 InvoiceService.sendToClient(${id})`)
            await this.post(`/${id}/send`)
            console.log('✅ InvoiceService.sendToClient() - Success')
        } catch (error: any) {
            console.error('❌ InvoiceService.sendToClient() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Email invoice to client
    async emailToClient(id: string, emailData?: { to?: string; subject?: string; message?: string }): Promise<void> {
        try {
            console.log(`🚀 InvoiceService.emailToClient(${id})`, emailData)
            await this.post(`/${id}/email`, emailData)
            console.log('✅ InvoiceService.emailToClient() - Success')
        } catch (error: any) {
            console.error('❌ InvoiceService.emailToClient() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Generate and download invoice PDF
    async downloadPdf(id: string): Promise<Blob> {
        try {
            console.log(`🚀 InvoiceService.downloadPdf(${id})`)
            const response = await this.get(`/${id}/pdf`, { responseType: 'blob' })
            console.log('✅ InvoiceService.downloadPdf() - Success')
            return response as Blob
        } catch (error: any) {
            console.error('❌ InvoiceService.downloadPdf() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Get invoice summary/statistics
    async getSummary(filters?: { dateFrom?: string; dateTo?: string }): Promise<InvoiceSummary> {
        try {
            console.log('🚀 InvoiceService.getSummary()', filters)

            const searchParams = new URLSearchParams()
            if (filters?.dateFrom) searchParams.set('dateFrom', filters.dateFrom)
            if (filters?.dateTo) searchParams.set('dateTo', filters.dateTo)

            const query = searchParams.toString()
            const endpoint = query ? `/summary?${query}` : '/summary'

            const result = await this.get<InvoiceSummary>(endpoint)
            console.log('✅ InvoiceService.getSummary() - Success')
            return result
        } catch (error: any) {
            console.error('❌ InvoiceService.getSummary() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Search products for invoice items
    async searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
        try {
            console.log(`🚀 InvoiceService.searchProducts(${searchTerm})`)
            // This calls the products API for searching
            const response = await this.get<ProductSearchResult[]>(`/products/search?term=${encodeURIComponent(searchTerm)}`)
            console.log('✅ InvoiceService.searchProducts() - Success:', response?.length || 0, 'products')
            return response || []
        } catch (error: any) {
            console.error('❌ InvoiceService.searchProducts() - Error:', error?.response?.status, error?.message)
            // Fallback to empty array if search fails
            return []
        }
    }

    // Calculate invoice totals
    calculateTotals(items: { quantity: number; unitPrice: number }[], taxRate: number = 15, discountPercentage: number = 0): InvoiceCalculations {
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
    }
}

// Payment service for invoice payments
class InvoicePaymentService extends ApiService {
    constructor() {
        super('/payments')
    }

    // Process payment for invoice
    async processPayment(payment: CreateInvoicePaymentDto): Promise<InvoicePayment> {
        try {
            console.log('🚀 InvoicePaymentService.processPayment()', payment)
            const result = await this.post<InvoicePayment>('/process', payment)
            console.log('✅ InvoicePaymentService.processPayment() - Success:', result?.paymentId)
            return result
        } catch (error: any) {
            console.error('❌ InvoicePaymentService.processPayment() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Get payments for an invoice
    async getByInvoiceId(invoiceId: string): Promise<InvoicePayment[]> {
        try {
            console.log(`🚀 InvoicePaymentService.getByInvoiceId(${invoiceId})`)
            const result = await this.get<InvoicePayment[]>(`/invoice/${invoiceId}`)
            console.log('✅ InvoicePaymentService.getByInvoiceId() - Success:', result?.length || 0, 'payments')
            return result || []
        } catch (error: any) {
            console.error('❌ InvoicePaymentService.getByInvoiceId() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    // Refund a payment
    async refundPayment(paymentId: string, refundData?: { amount?: number; reason?: string }): Promise<InvoicePayment> {
        try {
            console.log(`🚀 InvoicePaymentService.refundPayment(${paymentId})`, refundData)
            const result = await this.post<InvoicePayment>(`/refund/${paymentId}`, refundData)
            console.log('✅ InvoicePaymentService.refundPayment() - Success')
            return result
        } catch (error: any) {
            console.error('❌ InvoicePaymentService.refundPayment() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }
}

// Export service instances
export const invoiceService = new InvoiceService()
export const invoicePaymentService = new InvoicePaymentService()

// Export classes for testing or custom instances
export { InvoiceService, InvoicePaymentService }