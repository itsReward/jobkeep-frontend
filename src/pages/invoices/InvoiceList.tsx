// src/pages/invoices/InvoiceList.tsx
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    useInvoices,
    useDeleteInvoice,
    useUpdateInvoiceStatus,
    useSendInvoiceToClient,
    useEmailInvoiceToClient,
    useDownloadInvoicePdf,
    useCheckOverdueInvoices
} from '@/hooks/useInvoices'
import { InvoiceListFilters, Invoice, InvoiceStatus, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/types/invoice'
import { formatDate, formatCurrency } from '@/utils/formatters'
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    Edit,
    Eye,
    Filter,
    Mail,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Send,
    Trash2,
    X
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    Button,
    Badge,
    Input,
    Loading,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownTrigger
} from '@/components/ui'
import InvoiceView  from '@/components/invoices/InvoiceView'
import InvoiceForm  from '@/components/forms/InvoiceForm'

const InvoiceList: React.FC = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<InvoiceListFilters>({})
    const [showFilters, setShowFilters] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInvoiceForm, setShowInvoiceForm] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
    const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null)
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(20)

    // Combine search term with filters
    const queryParams = useMemo(() => ({
        page,
        size: pageSize,
        filters: {
            ...filters,
            search: searchTerm || undefined
        }
    }), [page, pageSize, filters, searchTerm])

    // Fetch invoices
    const { data: invoicesResponse, isLoading, error, refetch } = useInvoices(queryParams)
    const invoices = invoicesResponse?.content || []
    const totalPages = invoicesResponse?.totalPages || 0
    const totalElements = invoicesResponse?.totalElements || 0

    // Mutations
    const deleteInvoice = useDeleteInvoice()
    const updateInvoiceStatus = useUpdateInvoiceStatus()
    const sendInvoiceToClient = useSendInvoiceToClient()
    const emailInvoiceToClient = useEmailInvoiceToClient()
    const downloadInvoicePdf = useDownloadInvoicePdf()
    const checkOverdueInvoices = useCheckOverdueInvoices()

    // Filter invoices based on search term (client-side filtering for better UX)
    const filteredInvoices = useMemo(() => {
        if (!searchTerm) return invoices

        const term = searchTerm.toLowerCase()
        return invoices.filter(invoice =>
            invoice.invoiceNumber.toLowerCase().includes(term) ||
            invoice.clientName.toLowerCase().includes(term) ||
            invoice.vehicleInfo?.toLowerCase().includes(term) ||
            invoice.status.toLowerCase().includes(term) ||
            invoice.totalAmount.toString().includes(term)
        )
    }, [invoices, searchTerm])

    // Handlers
    const handleCreateInvoice = () => {
        setEditingInvoice(null)
        setShowInvoiceForm(true)
    }

    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice)
        setShowInvoiceForm(true)
    }

    const handleDeleteInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice)
        setShowDeleteModal(true)
    }

    const confirmDelete = () => {
        if (selectedInvoice) {
            deleteInvoice.mutate(selectedInvoice.invoiceId)
            setShowDeleteModal(false)
            setSelectedInvoice(null)
        }
    }

    const handleStatusChange = (invoiceId: string, status: InvoiceStatus) => {
        updateInvoiceStatus.mutate({
            id: invoiceId,
            statusUpdate: { status }
        })
    }

    const handleSendToClient = (invoiceId: string) => {
        sendInvoiceToClient.mutate(invoiceId)
    }

    const handleEmailToClient = (invoiceId: string) => {
        emailInvoiceToClient.mutate({ id: invoiceId })
    }

    const handleDownloadPdf = (invoiceId: string) => {
        downloadInvoicePdf.mutate(invoiceId)
    }

    const handleViewInvoice = (invoiceId: string) => {
        setViewingInvoiceId(invoiceId)
    }

    const handleCheckOverdue = () => {
        checkOverdueInvoices.mutate()
    }

    const handleFilterChange = (key: keyof InvoiceListFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
        setPage(0) // Reset to first page when filters change
    }

    const clearFilters = () => {
        setFilters({})
        setSearchTerm('')
        setPage(0)
    }

    const getStatusIcon = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.DRAFT:
                return <Edit className="h-4 w-4" />
            case InvoiceStatus.SENT:
                return <Send className="h-4 w-4" />
            case InvoiceStatus.PAID:
                return <CheckCircle className="h-4 w-4" />
            case InvoiceStatus.OVERDUE:
                return <AlertTriangle className="h-4 w-4" />
            case InvoiceStatus.CANCELLED:
                return <X className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    if (viewingInvoiceId) {
        return (
            <InvoiceView
                invoiceId={viewingInvoiceId}
                onClose={() => setViewingInvoiceId(null)}
                onEdit={(invoice) => {
                    setViewingInvoiceId(null)
                    handleEditInvoice(invoice)
                }}
            />
        )
    }

    if (showInvoiceForm) {
        return (
            <InvoiceForm
                invoice={editingInvoice}
                onClose={() => {
                    setShowInvoiceForm(false)
                    setEditingInvoice(null)
                }}
                onSuccess={() => {
                    setShowInvoiceForm(false)
                    setEditingInvoice(null)
                    refetch()
                }}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-1">
                        Manage billing documents and track payments
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCheckOverdue}
                        disabled={checkOverdueInvoices.isPending}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Check Overdue
                    </Button>
                    <Button onClick={handleCreateInvoice}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Invoice
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search invoices..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        {(Object.keys(filters).length > 0 || searchTerm) && (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Statuses</option>
                                        {Object.values(InvoiceStatus).map((status) => (
                                            <option key={status} value={status}>
                                                {INVOICE_STATUS_LABELS[status]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date From
                                    </label>
                                    <Input
                                        type="date"
                                        value={filters.dateFrom || ''}
                                        onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date To
                                    </label>
                                    <Input
                                        type="date"
                                        value={filters.dateTo || ''}
                                        onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Client
                                    </label>
                                    <Input
                                        placeholder="Client name..."
                                        value={filters.clientId || ''}
                                        onChange={(e) => handleFilterChange('clientId', e.target.value || undefined)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                                <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Paid</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredInvoices.filter(i => i.status === InvoiceStatus.PAID).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredInvoices.filter(i => i.status === InvoiceStatus.SENT).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Overdue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredInvoices.filter(i => i.status === InvoiceStatus.OVERDUE).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">
                            Invoices ({filteredInvoices.length})
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Page {page + 1} of {totalPages}
                            </span>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loading size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-500">Failed to load invoices</p>
                            <Button variant="outline" onClick={() => refetch()} className="mt-2">
                                Try Again
                            </Button>
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="text-center py-8">
                            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                {searchTerm || Object.keys(filters).length > 0
                                    ? 'No invoices match your search criteria'
                                    : 'No invoices found'}
                            </p>
                            <Button onClick={handleCreateInvoice}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Invoice
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredInvoices.map((invoice) => (
                                <div
                                    key={invoice.invoiceId}
                                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {invoice.invoiceNumber}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {invoice.clientName}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={INVOICE_STATUS_COLORS[invoice.status]}
                                                    className="flex items-center gap-1"
                                                >
                                                    {getStatusIcon(invoice.status)}
                                                    {INVOICE_STATUS_LABELS[invoice.status]}
                                                </Badge>
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(invoice.invoiceDate)}
                                                </span>
                                                {invoice.vehicleInfo && (
                                                    <span className="flex items-center gap-1">
                                                        <Car className="h-4 w-4" />
                                                        {invoice.vehicleInfo}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {formatCurrency(invoice.totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewInvoice(invoice.invoiceId)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditInvoice(invoice)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Dropdown>
                                                <DropdownTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownContent align="end">
                                                    <DropdownItem
                                                        onClick={() => handleDownloadPdf(invoice.invoiceId)}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download PDF
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => handleEmailToClient(invoice.invoiceId)}
                                                    >
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Email to Client
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => handleSendToClient(invoice.invoiceId)}
                                                    >
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Send to Client
                                                    </DropdownItem>
                                                    {invoice.status !== InvoiceStatus.PAID && (
                                                        <DropdownItem
                                                            onClick={() => handleStatusChange(invoice.invoiceId, InvoiceStatus.PAID)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Mark as Paid
                                                        </DropdownItem>
                                                    )}
                                                    {invoice.status !== InvoiceStatus.CANCELLED && (
                                                        <DropdownItem
                                                            onClick={() => handleStatusChange(invoice.invoiceId, InvoiceStatus.CANCELLED)}
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            Cancel Invoice
                                                        </DropdownItem>
                                                    )}
                                                    <DropdownItem
                                                        onClick={() => handleDeleteInvoice(invoice)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownContent>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Delete Invoice</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete invoice {selectedInvoice.invoiceNumber}?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    disabled={deleteInvoice.isPending}
                                >
                                    {deleteInvoice.isPending ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default InvoiceList