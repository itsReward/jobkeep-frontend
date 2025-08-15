// src/pages/quotations/QuotationList.tsx
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    FileText,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Mail,
    Download,
    CheckCircle,
    XCircle,
    RefreshCw,
    Calendar,
    User,
    DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { QuotationViewModal } from '@/components/modals/QuotationViewModal'
import { QuotationFormModal } from '@/components/modals/QuotationFormModal'
import {
    useQuotations,
    useUpdateQuotationStatus,
    useSendQuotationEmail,
    useDownloadQuotationPdf
} from '@/hooks/useQuotations'
import {
    Quotation,
    QuotationStatus,
    QuotationListFilters,
    QUOTATION_STATUS_LABELS,
    QUOTATION_STATUS_COLORS
} from '@/types/quotation'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { toast } from 'react-hot-toast'

export const QuotationList: React.FC = () => {
    const navigate = useNavigate()

    // State management
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<QuotationStatus | ''>('')
    const [showFilters, setShowFilters] = useState(false)

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

    // Build filters
    const filters: QuotationListFilters = useMemo(() => ({
        search: searchTerm,
        status: statusFilter || undefined,
    }), [searchTerm, statusFilter])

    // Hooks
    const { data: quotations = [], isLoading, error, refetch } = useQuotations(filters)
    const updateStatus = useUpdateQuotationStatus()
    const sendEmail = useSendQuotationEmail()
    const downloadPdf = useDownloadQuotationPdf()

    // Handlers
    const handleView = (quotation: Quotation) => {
        setSelectedQuotation(quotation)
        setViewModalOpen(true)
    }

    const handleEdit = (quotation: Quotation) => {
        setSelectedQuotation(quotation)
        setFormMode('edit')
        setFormModalOpen(true)
    }

    const handleCreate = () => {
        setSelectedQuotation(null)
        setFormMode('create')
        setFormModalOpen(true)
    }

    const handleConvertToJobCard = (quotation: Quotation) => {
        // Navigate to job card creation with pre-filled data
        navigate('/jobcards/create', {
            state: {
                fromQuotation: true,
                quotationData: {
                    quotationId: quotation.quotationId,
                    clientName: `${quotation.clientName} ${quotation.clientSurname}`,
                    vehicleInfo: quotation.vehicleInfo,
                    items: quotation.items,
                    notes: quotation.notes
                }
            }
        })
    }

    const handleStatusChange = (quotation: Quotation, status: QuotationStatus) => {
        updateStatus.mutate({ id: quotation.quotationId, status })
    }

    const handleSendEmail = (quotation: Quotation) => {
        sendEmail.mutate({ id: quotation.quotationId })
    }

    const handleDownloadPdf = (quotation: Quotation) => {
        downloadPdf.mutate(quotation.quotationId)
    }

    const handleCloseModals = () => {
        setViewModalOpen(false)
        setFormModalOpen(false)
        setSelectedQuotation(null)
    }

    const handleFormSuccess = () => {
        handleCloseModals()
        refetch()
        toast.success('Quotation saved successfully!')
    }

    // Get status badge variant
    const getStatusIcon = (status: QuotationStatus) => {
        switch (status) {
            case QuotationStatus.APPROVED:
                return <CheckCircle className="h-4 w-4" />
            case QuotationStatus.REJECTED:
                return <XCircle className="h-4 w-4" />
            case QuotationStatus.CONVERTED:
                return <RefreshCw className="h-4 w-4" />
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    // Check if quotation is expired
    const isExpired = (quotation: Quotation) => {
        if (!quotation.validUntil) return false
        return new Date(quotation.validUntil) < new Date() && quotation.status === QuotationStatus.PENDING
    }

    // Statistics
    const stats = useMemo(() => {
        const total = quotations.length
        const totalAmount = quotations.reduce((sum, q) => sum + q.totalAmount, 0)
        const pending = quotations.filter(q => q.status === QuotationStatus.PENDING).length
        const approved = quotations.filter(q => q.status === QuotationStatus.APPROVED).length
        const converted = quotations.filter(q => q.convertedToJobCard).length

        return { total, totalAmount, pending, approved, converted }
    }, [quotations])

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Quotations</h3>
                            <p className="text-gray-600 mb-4">Failed to load quotations. Please try again.</p>
                            <Button onClick={() => refetch()}>Retry</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="h-8 w-8" />
                            Quotations
                        </h1>
                        <p className="mt-1 text-gray-600">Manage quotations and convert them to job cards</p>
                    </div>
                    <Button onClick={handleCreate} className="mt-4 sm:mt-0 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Quotation
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Quotations</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Value</p>
                                <p className="text-xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Converted</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.converted}</p>
                            </div>
                            <RefreshCw className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search quotations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as QuotationStatus | '')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Statuses</option>
                                {Object.values(QuotationStatus).map(status => (
                                    <option key={status} value={status}>
                                        {QUOTATION_STATUS_LABELS[status]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Quotations List */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loading size="lg" />
                        </div>
                    ) : quotations.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || statusFilter ? 'No quotations match your search criteria.' : 'Get started by creating your first quotation.'}
                            </p>
                            {!searchTerm && !statusFilter && (
                                <Button onClick={handleCreate} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Quotation
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quotation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehicle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {quotations.map((quotation) => {
                                    const expired = isExpired(quotation)
                                    return (
                                        <tr key={quotation.quotationId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {quotation.quotationNumber}
                                                    </p>
                                                    {quotation.validUntil && (
                                                        <p className={`text-xs ${expired ? 'text-red-600' : 'text-gray-500'}`}>
                                                            Valid until: {formatDate(quotation.validUntil)}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {quotation.clientName} {quotation.clientSurname}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-900">
                                                    {quotation.vehicleInfo || 'No vehicle'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-900">
                                                    {formatDate(quotation.quotationDate)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <Badge
                                                        variant={QUOTATION_STATUS_COLORS[quotation.status] as any}
                                                        className="flex items-center gap-1 w-fit"
                                                    >
                                                        {getStatusIcon(quotation.status)}
                                                        {QUOTATION_STATUS_LABELS[quotation.status]}
                                                    </Badge>
                                                    {quotation.convertedToJobCard && (
                                                        <Badge variant="blue" size="sm" className="w-fit">
                                                            Converted
                                                        </Badge>
                                                    )}
                                                    {expired && (
                                                        <Badge variant="error" size="sm" className="w-fit">
                                                            Expired
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(quotation.totalAmount)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {quotation.items.length} item{quotation.items.length !== 1 ? 's' : ''}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleView(quotation)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {[QuotationStatus.DRAFT, QuotationStatus.PENDING].includes(quotation.status) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(quotation)}
                                                            className="text-gray-600 hover:text-gray-700"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadPdf(quotation)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>

                                                    {quotation.status === QuotationStatus.DRAFT && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSendEmail(quotation)}
                                                            className="text-purple-600 hover:text-purple-700"
                                                            disabled={sendEmail.isPending}
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {quotation.status === QuotationStatus.APPROVED && !quotation.convertedToJobCard && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleConvertToJobCard(quotation)}
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Components */}
            <QuotationViewModal
                isOpen={viewModalOpen}
                onClose={handleCloseModals}
                onEdit={() => {
                    setViewModalOpen(false)
                    setFormMode('edit')
                    setFormModalOpen(true)
                }}
                onConvertToJobCard={handleConvertToJobCard}
                quotationId={selectedQuotation?.quotationId || null}
            />

            <QuotationFormModal
                isOpen={formModalOpen}
                onClose={handleCloseModals}
                quotation={selectedQuotation}
                mode={formMode}
            />
        </div>
    )
}

export default QuotationList