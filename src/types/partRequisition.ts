// src/types/partsRequisition.ts
export interface PartRequisition {
    requisitionId: string
    jobCardId: string
    jobCardNumber: number
    productId: string
    productName: string
    productCode: string
    requestedBy: EmployeeSummary
    requestedQuantity: number
    approvedQuantity: number
    disbursedQuantity: number
    usedQuantity: number
    status: PartRequisitionStatus
    requestedAt: string
    approvedAt?: string
    approvedBy?: EmployeeSummary
    disbursedAt?: string
    disbursedBy?: EmployeeSummary
    usedAt?: string
    markedUsedBy?: EmployeeSummary
    unitCost?: number
    totalCost?: number
    notes?: string
    rejectionReason?: string
}

export interface EmployeeSummary {
    employeeId: string
    name: string
    role: string
}

export interface CreatePartRequisitionDto {
    jobCardId: string
    productId: string
    requestedQuantity: number
    notes?: string
}

export interface ApprovePartRequisitionDto {
    approvedQuantity: number
    notes?: string
}

export interface DisbursePartRequisitionDto {
    disbursedQuantity: number
    notes?: string
}

export interface ApproveAndDisburseDto {
    approve: ApprovePartRequisitionDto
    disburse: DisbursePartRequisitionDto
}

export interface MarkAsUsedDto {
    usedQuantity: number
    notes?: string
}

export interface MarkAsNotAvailableDto {
    reason: string
    notes?: string
}

export enum PartRequisitionStatus {
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED',
    DISBURSED = 'DISBURSED',
    USED = 'USED',
    PARTIALLY_USED = 'PARTIALLY_USED',
    NOT_AVAILABLE = 'NOT_AVAILABLE',
    REJECTED = 'REJECTED'
}

export const PART_REQUISITION_STATUS_LABELS = {
    [PartRequisitionStatus.REQUESTED]: 'Requested',
    [PartRequisitionStatus.APPROVED]: 'Approved',
    [PartRequisitionStatus.DISBURSED]: 'Disbursed',
    [PartRequisitionStatus.USED]: 'Used',
    [PartRequisitionStatus.PARTIALLY_USED]: 'Partially Used',
    [PartRequisitionStatus.NOT_AVAILABLE]: 'Not Available',
    [PartRequisitionStatus.REJECTED]: 'Rejected'
} as const

export const PART_REQUISITION_STATUS_COLORS = {
    [PartRequisitionStatus.REQUESTED]: 'warning',
    [PartRequisitionStatus.APPROVED]: 'secondary',
    [PartRequisitionStatus.DISBURSED]: 'blue',
    [PartRequisitionStatus.USED]: 'success',
    [PartRequisitionStatus.PARTIALLY_USED]: 'success',
    [PartRequisitionStatus.NOT_AVAILABLE]: 'gray',
    [PartRequisitionStatus.REJECTED]: 'error'
} as const

export interface PartRequisitionFilters {
    status?: PartRequisitionStatus
    jobCardNumber?: string
    employeeName?: string
    productName?: string
    dateFrom?: string
    dateTo?: string
}

export interface PartRequisitionSummary {
    totalRequisitions: number
    pendingApproval: number
    disbursed: number
    used: number
    notAvailable: number
    totalValue: number
}

// Product search result for requisition creation
export interface ProductSearchResult {
    productId: string
    productCode: string
    productName: string
    description: string
    currentStock: number
    unitOfMeasure: string
    sellingPrice: number
    costPrice: number
}