// src/hooks/useInvoices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    invoiceService,
    invoicePaymentService,
    InvoiceQueryParams
} from '@/services/api/invoice'
import {
    CreateInvoiceDto,
    UpdateInvoiceDto,
    UpdateInvoiceStatusDto,
    InvoiceListFilters,
    CreateInvoicePaymentDto
} from '@/types'
import toast from 'react-hot-toast'

// Query keys
export const invoiceKeys = {
    all: ['invoices'] as const,
    lists: () => [...invoiceKeys.all, 'list'] as const,
    list: (params?: InvoiceQueryParams) => [...invoiceKeys.lists(), params] as const,
    details: () => [...invoiceKeys.all, 'detail'] as const,
    detail: (id: string) => [...invoiceKeys.details(), id] as const,
    summary: (filters?: { dateFrom?: string; dateTo?: string }) => [...invoiceKeys.all, 'summary', filters] as const,
    payments: (invoiceId: string) => [...invoiceKeys.all, 'payments', invoiceId] as const,
    products: (searchTerm: string) => [...invoiceKeys.all, 'products', searchTerm] as const,
}

// Get all invoices with pagination and filters
export const useInvoices = (params?: InvoiceQueryParams) => {
    return useQuery({
        queryKey: invoiceKeys.list(params),
        queryFn: () => invoiceService.getAll(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })
}

// Get single invoice by ID
export const useInvoice = (id: string) => {
    return useQuery({
        queryKey: invoiceKeys.detail(id),
        queryFn: () => invoiceService.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

// Get invoice summary
export const useInvoiceSummary = (filters?: { dateFrom?: string; dateTo?: string }) => {
    return useQuery({
        queryKey: invoiceKeys.summary(filters),
        queryFn: () => invoiceService.getSummary(filters),
        staleTime: 5 * 60 * 1000,
    })
}

// Get invoice payments
export const useInvoicePayments = (invoiceId: string) => {
    return useQuery({
        queryKey: invoiceKeys.payments(invoiceId),
        queryFn: () => invoicePaymentService.getByInvoiceId(invoiceId),
        enabled: !!invoiceId,
        staleTime: 5 * 60 * 1000,
    })
}

// Search products for invoice items
export const useProductSearch = (searchTerm: string) => {
    return useQuery({
        queryKey: invoiceKeys.products(searchTerm),
        queryFn: () => invoiceService.searchProducts(searchTerm),
        enabled: !!searchTerm && searchTerm.length >= 2,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Create invoice mutation
export const useCreateInvoice = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (invoice: CreateInvoiceDto) => invoiceService.create(invoice),
        onSuccess: (newInvoice) => {
            // Invalidate and refetch invoices list
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })

            // Add the new invoice to cache
            queryClient.setQueryData(invoiceKeys.detail(newInvoice.invoiceId), newInvoice)

            // Invalidate summary
            queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })

            toast.success('Invoice created successfully!', {
                icon: '📄',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create invoice', {
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

// Update invoice mutation
export const useUpdateInvoice = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, invoice }: { id: string; invoice: UpdateInvoiceDto }) =>
            invoiceService.update(id, invoice),
        onSuccess: (updatedInvoice, { id }) => {
            // Update the invoice in cache
            queryClient.setQueryData(invoiceKeys.detail(id), updatedInvoice)

            // Invalidate lists to ensure consistency
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })

            // Invalidate summary
            queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })

            toast.success('Invoice updated successfully!', {
                icon: '✏️',
                style: {
                    borderRadius: '16px',
                    background: '#E3F2FD',
                    color: '#1976D2',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update invoice', {
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

// Delete invoice mutation
export const useDeleteInvoice = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => invoiceService.delete(id),
        onSuccess: (_, id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: invoiceKeys.detail(id) })

            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })

            // Invalidate summary
            queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })

            toast.success('Invoice deleted successfully!', {
                icon: '🗑️',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete invoice', {
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

// Update invoice status mutation
export const useUpdateInvoiceStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, statusUpdate }: { id: string; statusUpdate: UpdateInvoiceStatusDto }) =>
            invoiceService.updateStatus(id, statusUpdate),
        onSuccess: (updatedInvoice, { id }) => {
            queryClient.setQueryData(invoiceKeys.detail(id), updatedInvoice)
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })

            toast.success('Invoice status updated!', {
                icon: '🔄',
                style: {
                    borderRadius: '16px',
                    background: '#E3F2FD',
                    color: '#1976D2',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update status', {
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

// Send invoice to client mutation
export const useSendInvoiceToClient = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => invoiceService.sendToClient(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })

            toast.success('Invoice sent to client!', {
                icon: '📤',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to send invoice', {
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

// Email invoice to client mutation
export const useEmailInvoiceToClient = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, emailData }: { id: string; emailData?: any }) =>
            invoiceService.emailToClient(id, emailData),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })

            toast.success('Invoice emailed to client!', {
                icon: '📧',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to email invoice', {
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

// Download invoice PDF mutation
export const useDownloadInvoicePdf = () => {
    return useMutation({
        mutationFn: (id: string) => invoiceService.downloadPdf(id),
        onSuccess: (blob, id) => {
            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `invoice-${id}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            toast.success('Invoice PDF downloaded!', {
                icon: '⬇️',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error('Failed to download PDF', {
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

// Process payment mutation
export const useProcessPayment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payment: CreateInvoicePaymentDto) => invoicePaymentService.create(payment),
        onSuccess: (newPayment) => {
            // Invalidate invoice details and payments
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(newPayment.invoiceId) })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.payments(newPayment.invoiceId) })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })

            toast.success('Payment processed successfully!', {
                icon: '💳',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to process payment', {
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

// Refund payment mutation
export const useRefundPayment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ paymentId, refundData }: { paymentId: string; refundData?: any }) =>
            invoicePaymentService.refund(paymentId, refundData),
        onSuccess: (refundedPayment) => {
            // Invalidate invoice details and payments
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(refundedPayment.invoiceId) })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.payments(refundedPayment.invoiceId) })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })

            toast.success('Payment refunded successfully!', {
                icon: '↩️',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to refund payment', {
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

// Check overdue invoices mutation
export const useCheckOverdueInvoices = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => invoiceService.checkOverdueInvoices(),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
            queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })

            if (result.updatedCount > 0) {
                toast.success(`${result.updatedCount} invoices marked as overdue`, {
                    icon: '⏰',
                    style: {
                        borderRadius: '16px',
                        background: '#FFF3E0',
                        color: '#E65100',
                    }
                })
            }
        },
        onError: (error: any) => {
            toast.error('Failed to check overdue invoices', {
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