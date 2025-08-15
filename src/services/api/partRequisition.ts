// src/services/api/partsRequisition.ts
import { ApiService } from './base'
import {
    PartRequisition,
    CreatePartRequisitionDto,
    ApprovePartRequisitionDto,
    DisbursePartRequisitionDto,
    ApproveAndDisburseDto,
    MarkAsUsedDto,
    MarkAsNotAvailableDto,
    ProductSearchResult
} from '@/types/partRequisition'

export class PartRequisitionService extends ApiService {
    constructor() {
        super('/jobcards/parts-requisition')
    }

    // Create parts requisition
    async createRequisition(data: CreatePartRequisitionDto): Promise<PartRequisition> {
        return this.post<PartRequisition>('/request', data)
    }

    // Mark parts as used
    async markAsUsed(requisitionId: string, data: MarkAsUsedDto): Promise<PartRequisition> {
        return this.put<PartRequisition>(`/${requisitionId}/mark-used`, data)
    }

    // Get my requisitions
    async getMyRequisitions(): Promise<PartRequisition[]> {
        return this.get<PartRequisition[]>('/my-requests')
    }

    // Get pending requisitions (for stores)
    async getPendingRequisitions(): Promise<PartRequisition[]> {
        return this.get<PartRequisition[]>('/pending')
    }

    // Approve and disburse requisition
    async approveAndDisburse(requisitionId: string, data: ApproveAndDisburseDto): Promise<PartRequisition> {
        return this.put<PartRequisition>(`/${requisitionId}/approve-and-disburse`, data)
    }

    // Mark as not available
    async markAsNotAvailable(requisitionId: string, data: MarkAsNotAvailableDto): Promise<PartRequisition> {
        return this.put<PartRequisition>(`/${requisitionId}/mark-not-available`, data)
    }

    // Get requisitions by job card
    async getRequisitionsByJobCard(jobCardId: string): Promise<PartRequisition[]> {
        return this.get<PartRequisition[]>(`/jobcard/${jobCardId}`)
    }

    // Get used parts for invoicing
    async getUsedPartsForInvoicing(jobCardId: string): Promise<PartRequisition[]> {
        return this.get<PartRequisition[]>(`/jobcard/${jobCardId}/used-parts`)
    }

    // Get requisition by ID
    async getRequisitionById(requisitionId: string): Promise<PartRequisition> {
        return this.get<PartRequisition>(`/${requisitionId}`)
    }

    // Search products for requisition
    async searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
        // This will use the existing product search endpoint
        return this.get<ProductSearchResult[]>('/products/search', { q: searchTerm })
    }

    // Get all requisitions (for stores/admin page)
    async getAllRequisitions(): Promise<PartRequisition[]> {
        return this.get<PartRequisition[]>('/all')
    }

    // Approve requisition only (separate from disburse)
    async approveRequisition(requisitionId: string, data: ApprovePartRequisitionDto): Promise<PartRequisition> {
        return this.put<PartRequisition>(`/${requisitionId}/approve`, data)
    }

    // Disburse requisition only (separate from approve)
    async disburseRequisition(requisitionId: string, data: DisbursePartRequisitionDto): Promise<PartRequisition> {
        return this.put<PartRequisition>(`/${requisitionId}/disburse`, data)
    }

    // Reject requisition
    async rejectRequisition(requisitionId: string, reason: string): Promise<PartRequisition> {
        return this.put<PartRequisition>(`/${requisitionId}/reject`, { reason })
    }
}

export const partRequisitionService = new PartRequisitionService()