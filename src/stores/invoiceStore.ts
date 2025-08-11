// src/stores/invoiceStore.ts

import { create } from 'zustand'
import { invoiceService, invoicePaymentService } from '@/services/api/invoice'
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
} from '@/types'
import { PaginatedResponse } from '@/types'

interface InvoiceStore {
    // State
    invoices: Invoice[]
    selectedInvoice: Invoice | null
    invoicePayments: InvoicePayment[]
    invoiceSummary: InvoiceSummary | null
    productSearchResults: ProductSearchResult[]
    loading: boolean
    error: string | null
    filters: InvoiceListFilters
    pagination: {
        page: number
        size: number
        total: number
        totalPages: number
    }

    // Actions
    fetchInvoices: (params?: {
        page?: number
        size?: number
        sortBy?: string
        sortDirection?: 'asc' | 'desc'
        filters?: InvoiceListFilters
    }) => Promise<void>
    fetchInvoiceById: (id: string) => Promise<void>
    createInvoice: (invoice: CreateInvoiceDto) => Promise<Invoice>
    updateInvoice: (id: string, invoice: UpdateInvoiceDto) => Promise<Invoice>
    deleteInvoice: (id: string) => Promise<void>
    updateInvoiceStatus: (id: string, statusUpdate: UpdateInvoiceStatusDto) => Promise<void>
    sendInvoiceToClient: (id: string) => Promise<void>
    emailInvoiceToClient: (id: string, emailData?: any) => Promise<void>
    downloadInvoicePdf: (id: string) => Promise<void>
    processPayment: (payment: CreateInvoicePaymentDto) => Promise<void>
    fetchInvoicePayments: (invoiceId: string) => Promise<void>
    refundPayment: (paymentId: string, refundData?: any) => Promise<void>
    searchProducts: (searchTerm: string) => Promise<void>
    fetchInvoiceSummary: (filters?: { dateFrom?: string; dateTo?: string }) => Promise<void>
    setFilters: (filters: Partial<InvoiceListFilters>) => void
    clearFilters: () => void
    setSelectedInvoice: (invoice: Invoice | null) => void
    clearError: () => void

    // Auto-update overdue invoices
    checkOverdueInvoices: () => void
}

const useInvoiceStore = create<InvoiceStore>((set, get) => ({
    // Initial state
    invoices: [],
    selectedInvoice: null,
    invoicePayments: [],
    invoiceSummary: null,
    productSearchResults: [],
    loading: false,
    error: null,
    filters: {},
    pagination: {
        page: 0,
        size: 20,
        total: 0,
        totalPages: 0
    },

    // Fetch all invoices
    fetchInvoices: async (params) => {
        set({ loading: true, error: null })
        try {
            const currentFilters = get().filters
            const response = await invoiceService.getAll({
                ...params,
                filters: params?.filters || currentFilters
            })

            set({
                invoices: response.data,
                pagination: {
                    page: response.page,
                    size: response.limit,
                    total: response.total,
                    totalPages: response.totalPages
                },
                loading: false
            })

            // Check for overdue invoices
            get().checkOverdueInvoices()
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch invoices',
                loading: false
            })
        }
    },

    // Fetch single invoice
    fetchInvoiceById: async (id: string) => {
        set({ loading: true, error: null })
        try {
            const invoice = await invoiceService.getById(id)
            set({
                selectedInvoice: invoice,
                loading: false
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch invoice',
                loading: false
            })
        }
    },

    // Create new invoice
    createInvoice: async (invoiceData: CreateInvoiceDto) => {
        set({ loading: true, error: null })
        try {
            const newInvoice = await invoiceService.create(invoiceData)

            // Add to invoices list
            set((state) => ({
                invoices: [newInvoice, ...state.invoices],
                selectedInvoice: newInvoice,
                loading: false
            }))

            return newInvoice
        } catch (error: any) {
            set({
                error: error.message || 'Failed to create invoice',
                loading: false
            })
            throw error
        }
    },

    // Update invoice
    updateInvoice: async (id: string, invoiceData: UpdateInvoiceDto) => {
        set({ loading: true, error: null })
        try {
            const updatedInvoice = await invoiceService.update(id, invoiceData)

            set((state) => ({
                invoices: state.invoices.map(inv =>
                    inv.invoiceId === id ? updatedInvoice : inv
                ),
                selectedInvoice: state.selectedInvoice?.invoiceId === id ? updatedInvoice : state.selectedInvoice,
                loading: false
            }))

            return updatedInvoice
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update invoice',
                loading: false
            })
            throw error
        }
    },

    // Delete invoice
    deleteInvoice: async (id: string) => {
        set({ loading: true, error: null })
        try {
            await invoiceService.delete(id)

            set((state) => ({
                invoices: state.invoices.filter(inv => inv.invoiceId !== id),
                selectedInvoice: state.selectedInvoice?.invoiceId === id ? null : state.selectedInvoice,
                loading: false
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to delete invoice',
                loading: false
            })
            throw error
        }
    },

    // Update invoice status
    updateInvoiceStatus: async (id: string, statusUpdate: UpdateInvoiceStatusDto) => {
        set({ loading: true, error: null })
        try {
            const updatedInvoice = await invoiceService.updateStatus(id, statusUpdate)

            set((state) => ({
                invoices: state.invoices.map(inv =>
                    inv.invoiceId === id ? updatedInvoice : inv
                ),
                selectedInvoice: state.selectedInvoice?.invoiceId === id ? updatedInvoice : state.selectedInvoice,
                loading: false
            }))
        } catch (error: any) {
            set({
                error: error.message || 'Failed to update invoice status',
                loading: false
            })
            throw error
        }
    },

    // Send invoice to client
    sendInvoiceToClient: async (id: string) => {
        set({ loading: true, error: null })
        try {
            await invoiceService.sendToClient(id)

            // Update status to SENT
            await get().updateInvoiceStatus(id, { status: InvoiceStatus.SENT })

            set({ loading: false })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to send invoice',
                loading: false
            })
            throw error
        }
    },

    // Email invoice to client
    emailInvoiceToClient: async (id: string, emailData?: any) => {
        set({ loading: true, error: null })
        try {
            await invoiceService.emailToClient(id, emailData)
            set({ loading: false })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to email invoice',
                loading: false
            })
            throw error
        }
    },

    // Download invoice PDF
    downloadInvoicePdf: async (id: string) => {
        set({ loading: true, error: null })
        try {
            const pdfBlob = await invoiceService.downloadPdf(id)

            // Create download link
            const url = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `invoice-${id}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            set({ loading: false })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to download invoice PDF',
                loading: false
            })
            throw error
        }
    },

    // Process payment
    processPayment: async (paymentData: CreateInvoicePaymentDto) => {
        set({ loading: true, error: null })
        try {
            const payment = await invoicePaymentService.processPayment(paymentData)

            // Refresh invoice to get updated payment status
            if (get().selectedInvoice?.invoiceId === paymentData.invoiceId) {
                await get().fetchInvoiceById(paymentData.invoiceId)
            }

            // Add to payments list
            set((state) => ({
                invoicePayments: [payment, ...state.invoicePayments],
                loading: false
            }))

            // Refresh invoices list to update amounts
            await get().fetchInvoices()
        } catch (error: any) {
            set({
                error: error.message || 'Failed to process payment',
                loading: false
            })
            throw error
        }
    },

    // Fetch invoice payments
    fetchInvoicePayments: async (invoiceId: string) => {
        set({ loading: true, error: null })
        try {
            const payments = await invoicePaymentService.getByInvoiceId(invoiceId)
            set({
                invoicePayments: payments,
                loading: false
            })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to fetch payments',
                loading: false
            })
        }
    },

    // Refund payment
    refundPayment: async (paymentId: string, refundData?: any) => {
        set({ loading: true, error: null })
        try {
            await invoicePaymentService.refundPayment(paymentId, refundData)

            // Refresh payments
            const selectedInvoice = get().selectedInvoice
            if (selectedInvoice) {
                await get().fetchInvoicePayments(selectedInvoice.invoiceId)
                await get().fetchInvoiceById(selectedInvoice.invoiceId)
            }

            set({ loading: false })
        } catch (error: any) {
            set({
                error: error.message || 'Failed to refund payment',
                loading: false
            })
            throw error
        }
    },

    // Search products
    searchProducts: async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            set({ productSearchResults: [] })
            return
        }

        try {
            const results = await invoiceService.searchProducts(searchTerm)
            set({ productSearchResults: results })
        } catch (error: any) {
            console.error('Failed to search products:', error)
            set({ productSearchResults: [] })
        }
    },

    // Fetch invoice summary
    fetchInvoiceSummary: async (filters) => {
        try {
            const summary = await invoiceService.getSummary(filters)
            set({ invoiceSummary: summary })
        } catch (error: any) {
            console.error('Failed to fetch invoice summary:', error)
            set({ invoiceSummary: null })
        }
    },

    // Set filters
    setFilters: (newFilters: Partial<InvoiceListFilters>) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters }
        }))
    },

    // Clear filters
    clearFilters: () => {
        set({ filters: {} })
    },

    // Set selected invoice
    setSelectedInvoice: (invoice: Invoice | null) => {
        set({ selectedInvoice: invoice })
    },

    // Clear error
    clearError: () => {
        set({ error: null })
    },

    // Check for overdue invoices and update status
    checkOverdueInvoices: () => {
        const { invoices } = get()
        const today = new Date().toISOString().split('T')[0]

        const overdueInvoices = invoices.filter(invoice =>
            invoice.status === InvoiceStatus.SENT &&
            invoice.dueDate < today
        )

        // Update overdue invoices (in a real app, this should be done on the backend)
        if (overdueInvoices.length > 0) {
            set((state) => ({
                invoices: state.invoices.map(invoice =>
                    overdueInvoices.find(overdue => overdue.invoiceId === invoice.invoiceId)
                        ? { ...invoice, status: InvoiceStatus.OVERDUE }
                        : invoice
                )
            }))
        }
    }
}))

export default useInvoiceStore