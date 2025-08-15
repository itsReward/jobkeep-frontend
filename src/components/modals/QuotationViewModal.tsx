// src/components/modals/QuotationViewModal.tsx
import React from 'react'
import {
    Edit,
    Download,
    Mail,
    FileText,
    Calendar,
    User,
    Car,
    Package,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import {
    useQuotation,
    useUpdateQuotationStatus,
    useSendQuotationEmail,
    useDownloadQuotationPdf
} from '@/hooks/useQuotations'
import {
    Quotation,
    QuotationStatus,
    QUOTATION_STATUS_LABELS,
    QUOTATION_STATUS_COLORS,
    QUOTATION_ITEM_TYPE_LABELS
} from '@/types/quotation'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface QuotationViewModalProps {
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    onConvertToJobCard?: (quotation: Quotation) => void
    quotationId: string | null
}

export const QuotationViewModal: React.FC<QuotationViewModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          onEdit,
                                                                          onConvertToJobCard,
                                                                          quotationId,
                                                                      }) => {
    const { data: quotation, isLoading } = useQuotation(quotationId || '')
    const updateStatus = useUpdateQuotationStatus()
    const sendEmail = useSendQuotationEmail()
    const downloadPdf = useDownloadQuotationPdf()

    const handleStatusChange = (status: QuotationStatus) => {
        if (!quotation) return

        updateStatus.mutate({ id: quotation.quotationId, status })
    }

    const handleSendEmail = () => {
        if (!quotation) return

        sendEmail.mutate({ id: quotation.quotationId })
    }

    const handleDownloadPdf = () => {
        if (!quotation) return

        downloadPdf.mutate(quotation.quotationId)
    }

    const handleConvertToJobCard = () => {
        if (!quotation || !onConvertToJobCard) return

        onConvertToJobCard(quotation)
    }

    const getStatusIcon = (status: QuotationStatus) => {
        switch (status) {
            case QuotationStatus.APPROVED:
                return <CheckCircle className="h-4 w-4" />
            case QuotationStatus.REJECTED:
                return <XCircle className="h-4 w-4" />
            case QuotationStatus.EXPIRED:
                return <Clock className="h-4 w-4" />
            case QuotationStatus.CONVERTED:
                return <RefreshCw className="h-4 w-4" />
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    const canEdit = quotation && [QuotationStatus.DRAFT, QuotationStatus.PENDING].includes(quotation.status)
    const canSend = quotation && quotation.status === QuotationStatus.DRAFT
    const canApprove = quotation && quotation.status === QuotationStatus.PENDING
    const canConvert = quotation && quotation.status === QuotationStatus.APPROVED && !quotation.convertedToJobCard

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={quotation ? `Quotation ${quotation.quotationNumber}` : 'Quotation Details'}
            size="xl"
        >
            {isLoading ? (
                <div className="py-8">
                    <Loading size="lg" />
                </div>
            ) : quotation ? (
                <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={QUOTATION_STATUS_COLORS[quotation.status] as any}
                                className="flex items-center gap-1"
                            >
                                {getStatusIcon(quotation.status)}
                                {QUOTATION_STATUS_LABELS[quotation.status]}
                            </Badge>
                            {quotation.convertedToJobCard && (
                                <Badge variant="blue" className="flex items-center gap-1">
                                    <RefreshCw className="h-3 w-3" />
                                    Converted to Job Card
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {canEdit && (
                                <Button variant="outline" size="sm" onClick={onEdit}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )}

                            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                            </Button>

                            {canSend && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSendEmail}
                                    disabled={sendEmail.isPending}
                                >
                                    <Mail className="h-4 w-4 mr-1" />
                                    Send
                                </Button>
                            )}

                            {canApprove && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(QuotationStatus.APPROVED)}
                                        className="text-green-600 hover:text-green-700"
                                        disabled={updateStatus.isPending}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusChange(QuotationStatus.REJECTED)}
                                        className="text-red-600 hover:text-red-700"
                                        disabled={updateStatus.isPending}
                                    >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                </>
                            )}

                            {canConvert && (
                                <Button
                                    size="sm"
                                    onClick={handleConvertToJobCard}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Convert to Job Card
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Quotation Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium text-gray-900">Quotation Information</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    Client
                                                </label>
                                                <p className="text-base font-medium text-gray-900">
                                                    {quotation.clientName} {quotation.clientSurname}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                    <Car className="h-4 w-4" />
                                                    Vehicle
                                                </label>
                                                <p className="text-base text-gray-900">
                                                    {quotation.vehicleInfo || 'No vehicle specified'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Quotation Date
                                                </label>
                                                <p className="text-base text-gray-900">
                                                    {formatDate(quotation.quotationDate)}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    Valid Until
                                                </label>
                                                <p className="text-base text-gray-900">
                                                    {quotation.validUntil ? formatDate(quotation.validUntil) : 'No expiry date'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Financial Summary */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Financial Summary
                                    </h3>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax ({quotation.taxRate}%):</span>
                                        <span className="font-medium">{formatCurrency(quotation.taxAmount)}</span>
                                    </div>
                                    {quotation.discountAmount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Discount ({quotation.discountPercentage}%):</span>
                                            <span className="font-medium text-red-600">-{formatCurrency(quotation.discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold">Total:</span>
                                            <span className="text-lg font-bold text-primary-600">
                                                {formatCurrency(quotation.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Quotation Items */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Items ({quotation.items.length})
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {quotation.items.map((item) => (
                                        <tr key={item.itemId}>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.description}
                                                    </p>
                                                    {item.productCode && (
                                                        <p className="text-xs text-gray-500">
                                                            Code: {item.productCode}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary" size="sm">
                                                    {QUOTATION_ITEM_TYPE_LABELS[item.itemType]}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(item.totalPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes and Terms */}
                    {(quotation.notes || quotation.termsAndConditions) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quotation.notes && (
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {quotation.termsAndConditions && (
                                <Card>
                                    <CardHeader>
                                        <h3 className="text-lg font-medium text-gray-900">Terms and Conditions</h3>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 whitespace-pre-wrap">{quotation.termsAndConditions}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Metadata */}
                    <Card>
                        <CardContent className="py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                                <div>
                                    <label className="font-medium">Created At</label>
                                    <p>{new Date(quotation.createdAt).toLocaleString('en-ZW', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                </div>

                                <div>
                                    <label className="font-medium">Quotation ID</label>
                                    <p className="font-mono text-sm">{quotation.quotationId}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Close Button */}
                    <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation Not Found</h3>
                    <p className="text-gray-600 mb-4">The requested quotation could not be found.</p>
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            )}
        </Modal>
    )
}