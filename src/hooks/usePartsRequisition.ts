// src/hooks/usePartsRequisition.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { partRequisitionService } from '@/services/api/partRequisition'
import {
    PartRequisition,
    CreatePartRequisitionDto,
    ApprovePartRequisitionDto,
    DisbursePartRequisitionDto,
    ApproveAndDisburseDto,
    MarkAsUsedDto,
    MarkAsNotAvailableDto,
    PartRequisitionFilters
} from '@/types/partRequisition'

// Query Keys
export const partRequisitionKeys = {
    all: ['partRequisitions'] as const,
    lists: () => [...partRequisitionKeys.all, 'list'] as const,
    list: (filters: PartRequisitionFilters) => [...partRequisitionKeys.lists(), filters] as const,
    details: () => [...partRequisitionKeys.all, 'detail'] as const,
    detail: (id: string) => [...partRequisitionKeys.details(), id] as const,
    byJobCard: (jobCardId: string) => [...partRequisitionKeys.all, 'byJobCard', jobCardId] as const,
    myRequests: () => [...partRequisitionKeys.all, 'myRequests'] as const,
    pending: () => [...partRequisitionKeys.all, 'pending'] as const,
    usedParts: (jobCardId: string) => [...partRequisitionKeys.all, 'usedParts', jobCardId] as const,
    products: (searchTerm: string) => [...partRequisitionKeys.all, 'products', searchTerm] as const,
}

// Get requisitions by job card
export const usePartRequisitionsByJobCard = (jobCardId: string) => {
    return useQuery({
        queryKey: partRequisitionKeys.byJobCard(jobCardId),
        queryFn: () => partRequisitionService.getRequisitionsByJobCard(jobCardId),
        enabled: !!jobCardId,
        staleTime: 30 * 1000, // 30 seconds for real-time updates
    })
}

// Get requisition by ID
export const usePartRequisition = (requisitionId: string) => {
    return useQuery({
        queryKey: partRequisitionKeys.detail(requisitionId),
        queryFn: () => partRequisitionService.getRequisitionById(requisitionId),
        enabled: !!requisitionId,
        staleTime: 30 * 1000,
    })
}

// Get my requisitions
export const useMyPartRequisitions = () => {
    return useQuery({
        queryKey: partRequisitionKeys.myRequests(),
        queryFn: () => partRequisitionService.getMyRequisitions(),
        staleTime: 30 * 1000,
    })
}

// Get pending requisitions (for stores)
export const usePendingPartRequisitions = () => {
    return useQuery({
        queryKey: partRequisitionKeys.pending(),
        queryFn: () => partRequisitionService.getPendingRequisitions(),
        staleTime: 30 * 1000,
    })
}

// Get all requisitions (for stores/admin page)
export const useAllPartRequisitions = (filters?: PartRequisitionFilters) => {
    return useQuery({
        queryKey: partRequisitionKeys.list(filters || {}),
        queryFn: async () => {
            const requisitions = await partRequisitionService.getAllRequisitions()

            if (!filters) return requisitions

            // Apply client-side filters
            let filtered = requisitions

            if (filters.status) {
                filtered = filtered.filter(r => r.status === filters.status)
            }

            if (filters.jobCardNumber) {
                const searchTerm = filters.jobCardNumber.toLowerCase()
                filtered = filtered.filter(r =>
                    r.jobCardNumber.toString().includes(searchTerm)
                )
            }

            if (filters.employeeName) {
                const searchTerm = filters.employeeName.toLowerCase()
                filtered = filtered.filter(r =>
                    r.requestedBy.name.toLowerCase().includes(searchTerm)
                )
            }

            if (filters.productName) {
                const searchTerm = filters.productName.toLowerCase()
                filtered = filtered.filter(r =>
                    r.productName.toLowerCase().includes(searchTerm) ||
                    r.productCode.toLowerCase().includes(searchTerm)
                )
            }

            if (filters.dateFrom) {
                filtered = filtered.filter(r => r.requestedAt >= filters.dateFrom!)
            }

            if (filters.dateTo) {
                filtered = filtered.filter(r => r.requestedAt <= filters.dateTo!)
            }

            return filtered
        },
        staleTime: 30 * 1000,
    })
}

// Get used parts for invoicing
export const useUsedPartsForInvoicing = (jobCardId: string) => {
    return useQuery({
        queryKey: partRequisitionKeys.usedParts(jobCardId),
        queryFn: () => partRequisitionService.getUsedPartsForInvoicing(jobCardId),
        enabled: !!jobCardId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Search products for requisition
export const useProductSearchForRequisition = (searchTerm: string) => {
    return useQuery({
        queryKey: partRequisitionKeys.products(searchTerm),
        queryFn: () => partRequisitionService.searchProducts(searchTerm),
        enabled: !!searchTerm && searchTerm.length >= 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Create parts requisition mutation
export const useCreatePartRequisition = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePartRequisitionDto) =>
            partRequisitionService.createRequisition(data),
        onSuccess: (newRequisition) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.byJobCard(newRequisition.jobCardId) })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.myRequests() })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.lists() })

            toast.success('Parts requisition created successfully!', {
                icon: '📦',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create parts requisition', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Mark parts as used mutation
export const useMarkPartsAsUsed = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ requisitionId, data }: { requisitionId: string; data: MarkAsUsedDto }) =>
            partRequisitionService.markAsUsed(requisitionId, data),
        onSuccess: (updatedRequisition) => {
            // Update cache
            queryClient.setQueryData(
                partRequisitionKeys.detail(updatedRequisition.requisitionId),
                updatedRequisition
            )

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.byJobCard(updatedRequisition.jobCardId) })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.lists() })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.usedParts(updatedRequisition.jobCardId) })

            toast.success('Parts marked as used successfully!', {
                icon: '✅',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to mark parts as used', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Approve and disburse mutation
export const useApproveAndDisburseRequisition = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ requisitionId, data }: { requisitionId: string; data: ApproveAndDisburseDto }) =>
            partRequisitionService.approveAndDisburse(requisitionId, data),
        onSuccess: (updatedRequisition) => {
            // Update cache
            queryClient.setQueryData(
                partRequisitionKeys.detail(updatedRequisition.requisitionId),
                updatedRequisition
            )

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.byJobCard(updatedRequisition.jobCardId) })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.pending() })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.lists() })

            toast.success('Parts requisition approved and disbursed successfully!', {
                icon: '📦',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to approve and disburse requisition', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Separate approve mutation
export const useApproveRequisition = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ requisitionId, data }: { requisitionId: string; data: ApprovePartRequisitionDto }) =>
            partRequisitionService.approveRequisition(requisitionId, data),
        onSuccess: (updatedRequisition) => {
            queryClient.setQueryData(
                partRequisitionKeys.detail(updatedRequisition.requisitionId),
                updatedRequisition
            )

            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.byJobCard(updatedRequisition.jobCardId) })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.pending() })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.lists() })

            toast.success('Parts requisition approved successfully!', {
                icon: '✅',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to approve requisition', {
                icon: '❌'
            })
        },
    })
}

// Separate disburse mutation
export const useDisburseRequisition = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ requisitionId, data }: { requisitionId: string; data: DisbursePartRequisitionDto }) =>
            partRequisitionService.disburseRequisition(requisitionId, data),
        onSuccess: (updatedRequisition) => {
            queryClient.setQueryData(
                partRequisitionKeys.detail(updatedRequisition.requisitionId),
                updatedRequisition
            )

            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.byJobCard(updatedRequisition.jobCardId) })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.lists() })

            toast.success('Parts disbursed successfully!', {
                icon: '📦',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to disburse parts', {
                icon: '❌'
            })
        },
    })
}

// Mark as not available mutation
export const useMarkAsNotAvailable = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ requisitionId, data }: { requisitionId: string; data: MarkAsNotAvailableDto }) =>
            partRequisitionService.markAsNotAvailable(requisitionId, data),
        onSuccess: (updatedRequisition) => {
            queryClient.setQueryData(
                partRequisitionKeys.detail(updatedRequisition.requisitionId),
                updatedRequisition
            )

            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.byJobCard(updatedRequisition.jobCardId) })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.pending() })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.lists() })

            toast.success('Requisition marked as not available', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFF3E0',
                    color: '#E65100',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to mark as not available', {
                icon: '❌'
            })
        },
    })
}

// Reject requisition mutation
export const useRejectRequisition = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ requisitionId, reason }: { requisitionId: string; reason: string }) =>
            partRequisitionService.rejectRequisition(requisitionId, reason),
        onSuccess: (updatedRequisition) => {
            queryClient.setQueryData(
                partRequisitionKeys.detail(updatedRequisition.requisitionId),
                updatedRequisition
            )

            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.byJobCard(updatedRequisition.jobCardId) })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.pending() })
            queryClient.invalidateQueries({ queryKey: partRequisitionKeys.lists() })

            toast.success('Requisition rejected', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to reject requisition', {
                icon: '❌'
            })
        },
    })
}