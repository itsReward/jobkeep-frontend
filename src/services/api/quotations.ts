// src/services/api/quotations.ts
import { ApiService } from './base'
import {
    Quotation,
    CreateQuotationDto,
    UpdateQuotationDto,
    UpdateQuotationStatusDto,
    QuotationStatus,
    ProductSearchResult
} from '@/types/quotation'

export class QuotationService extends ApiService {
    constructor() {
        super('/quotations')
    }

    async getAll(): Promise<Quotation[]> {
        return this.get<Quotation[]>('/all')
    }

    async getById(id: string): Promise<Quotation> {
        return this.get<Quotation>(`/${id}`)
    }

    async create(quotation: CreateQuotationDto): Promise<Quotation> {
        return this.post<Quotation>('/new', quotation)
    }

    async updateStatus(id: string, status: QuotationStatus): Promise<Quotation> {
        return this.put<Quotation>(`/${id}/status`, null, { status })
    }

    async convertToJobCard(quotationId: string, jobCardId: string): Promise<Quotation> {
        return this.post<Quotation>(`/${quotationId}/convert-to-job-card`, null, { jobCardId })
    }

    // Product search for quotation items (reusing invoice product search endpoint)
    async searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
        // This would use the same product search as invoices
        return this.get<ProductSearchResult[]>(`/products/search`, { q: searchTerm })
    }

    // Generate PDF (if available)
    async generatePdf(id: string): Promise<Blob> {
        const response = await this.apiClient.get(`${this.baseUrl}/${id}/pdf`, {
            responseType: 'blob'
        })
        return response.data
    }

    // Send quotation via email (if available)
    async sendEmail(id: string, email?: string): Promise<{ message: string }> {
        return this.post<{ message: string }>(`/${id}/email`, { email })
    }

    // Get quotation summary/statistics
    async getSummary(): Promise<{
        totalQuotations: number
        totalAmount: number
        pendingAmount: number
        approvedAmount: number
        statusCounts: Record<QuotationStatus, number>
    }> {
        return this.get<{
            totalQuotations: number
            totalAmount: number
            pendingAmount: number
            approvedAmount: number
            statusCounts: Record<QuotationStatus, number>
        }>('/summary')
    }
}

export const quotationService = new QuotationService()