// src/hooks/useQuotations.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { quotationService } from '@/services/api/quotations'
import {
    Quotation,
    CreateQuotationDto,
    UpdateQuotationDto,
    UpdateQuotationStatusDto,
    QuotationStatus,
    QuotationListFilters
} from '@/types/quotation'

// Query Keys
export const quotationKeys = {
    all: ['quotations'] as const,
    lists: () => [...quotationKeys.all, 'list'] as const,
    list: (filters: QuotationListFilters) => [...quotationKeys.lists(), filters] as const,
    details: () => [...quotationKeys.all, 'detail'] as const,
    detail: (id: string) => [...quotationKeys.details(), id] as const,
    summary: () => [...quotationKeys.all, 'summary'] as const,
    products: (searchTerm: string) => [...quotationKeys.all, 'products', searchTerm] as const,
}

// Get all quotations
export const useQuotations = (filters?: QuotationListFilters) => {
    return useQuery({
        queryKey: quotationKeys.list(filters || {}),
        queryFn: async () => {
            const quotations = await quotationService.getAll()

            if (!filters) return quotations

            // Apply client-side filters
            let filtered = quotations

            if (filters.status) {
                filtered = filtered.filter(q => q.status === filters.status)
            }

            if (filters.clientId) {
                filtered = filtered.filter(q =>
                    q.clientName?.toLowerCase().includes(filters.clientId!.toLowerCase()) ||
                    q.clientSurname?.toLowerCase().includes(filters.clientId!.toLowerCase())
                )
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase()
                filtered = filtered.filter(q =>
                    q.quotationNumber.toLowerCase().includes(searchTerm) ||
                    q.clientName.toLowerCase().includes(searchTerm) ||
                    q.clientSurname.toLowerCase().includes(searchTerm) ||
                    q.vehicleInfo?.toLowerCase().includes(searchTerm) ||
                    q.notes?.toLowerCase().includes(searchTerm)
                )
            }

            if (filters.dateFrom) {
                filtered = filtered.filter(q => q.quotationDate >= filters.dateFrom!)
            }

            if (filters.dateTo) {
                filtered = filtered.filter(q => q.quotationDate <= filters.dateTo!)
            }

            return filtered
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Get quotation by ID
export const useQuotation = (quotationId: string) => {
    return useQuery({
        queryKey: quotationKeys.detail(quotationId),
        queryFn: () => quotationService.getById(quotationId),
        enabled: !!quotationId,
        staleTime: 5 * 60 * 1000,
    })
}

// Get quotation summary
export const useQuotationSummary = () => {
    return useQuery({
        queryKey: quotationKeys.summary(),
        queryFn: () => quotationService.getSummary(),
        staleTime: 2 * 60 * 1000,
    })
}

// Search products for quotation items
export const useProductSearch = (searchTerm: string) => {
    return useQuery({
        queryKey: quotationKeys.products(searchTerm),
        queryFn: () => quotationService.searchProducts(searchTerm),
        enabled: !!searchTerm && searchTerm.length >= 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Create quotation mutation
export const useCreateQuotation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (quotation: CreateQuotationDto) => quotationService.create(quotation),
        onSuccess: (newQuotation) => {
            // Invalidate and refetch quotations list
            queryClient.invalidateQueries({ queryKey: quotationKeys.lists() })

            // Add the new quotation to cache
            queryClient.setQueryData(quotationKeys.detail(newQuotation.quotationId), newQuotation)

            // Invalidate summary
            queryClient.invalidateQueries({ queryKey: quotationKeys.summary() })

            toast.success('Quotation created successfully!', {
                icon: '📄',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to create quotation', {
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

// Update quotation status mutation
export const useUpdateQuotationStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: QuotationStatus }) =>
            quotationService.updateStatus(id, status),
        onSuccess: (updatedQuotation, { status }) => {
            // Update the quotation in cache
            queryClient.setQueryData(quotationKeys.detail(updatedQuotation.quotationId), updatedQuotation)

            // Invalidate lists to ensure consistency
            queryClient.invalidateQueries({ queryKey: quotationKeys.lists() })

            // Invalidate summary
            queryClient.invalidateQueries({ queryKey: quotationKeys.summary() })

            const statusLabels = {
                [QuotationStatus.DRAFT]: 'draft',
                [QuotationStatus.PENDING]: 'sent to client',
                [QuotationStatus.APPROVED]: 'approved',
                [QuotationStatus.REJECTED]: 'rejected',
                [QuotationStatus.EXPIRED]: 'marked as expired',
                [QuotationStatus.CONVERTED]: 'converted to job card'
            }

            toast.success(`Quotation ${statusLabels[status]}!`, {
                icon: status === QuotationStatus.APPROVED ? '✅' : '📄',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to update quotation status', {
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

// Convert quotation to job card mutation
export const useConvertToJobCard = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ quotationId, jobCardId }: { quotationId: string; jobCardId: string }) =>
            quotationService.convertToJobCard(quotationId, jobCardId),
        onSuccess: (updatedQuotation) => {
            // Update the quotation in cache
            queryClient.setQueryData(quotationKeys.detail(updatedQuotation.quotationId), updatedQuotation)

            // Invalidate lists and summary
            queryClient.invalidateQueries({ queryKey: quotationKeys.lists() })
            queryClient.invalidateQueries({ queryKey: quotationKeys.summary() })

            // Invalidate job cards if we have that query key
            queryClient.invalidateQueries({ queryKey: ['jobcards'] })

            toast.success('Quotation converted to job card successfully!', {
                icon: '🔄',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to convert quotation to job card', {
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

// Send quotation email mutation
export const useSendQuotationEmail = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, email }: { id: string; email?: string }) =>
            quotationService.sendEmail(id, email),
        onSuccess: () => {
            toast.success('Quotation sent successfully!', {
                icon: '📧',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to send quotation', {
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

// Download quotation PDF mutation
export const useDownloadQuotationPdf = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const blob = await quotationService.generatePdf(id)

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `quotation-${id}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            return blob
        },
        onSuccess: () => {
            toast.success('Quotation PDF downloaded successfully!', {
                icon: '📄',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error('Failed to download quotation PDF', {
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