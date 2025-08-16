// src/components/jobcards/PartsRequisitionSection.tsx
import React, { useState } from 'react'
import {
    Package,
    Plus,
    ChevronDown,
    ChevronUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Search,
    X,
    User,
    Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui'
import {
    usePartRequisitionsByJobCard,
    useCreatePartRequisition,
    useMarkPartsAsUsed,
    useProductSearchForRequisition
} from '@/hooks/usePartsRequisition'
import {
    PartRequisition,
    PartRequisitionStatus,
    PART_REQUISITION_STATUS_LABELS,
    PART_REQUISITION_STATUS_COLORS,
    CreatePartRequisitionDto,
    ProductSearchResult
} from '@/types/partRequisition'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

interface PartsRequisitionSectionProps {
    jobCardId: string
    jobCardStatus?: string
    currentUserRole?: string
    currentUserId?: string
}

export const PartsRequisitionSection: React.FC<PartsRequisitionSectionProps> = ({
                                                                                    jobCardId,
                                                                                    jobCardStatus,
                                                                                    currentUserRole,
                                                                                    currentUserId
                                                                                }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showProductSearch, setShowProductSearch] = useState(false)
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null)
    const [formData, setFormData] = useState({
        productId: '',
        requestedQuantity: 1,
        notes: ''
    })
    const [usageFormData, setUsageFormData] = useState<{[key: string]: { quantity: number, notes: string }}>({})

    // Hooks
    const { data: requisitions = [], isLoading, refetch } = usePartRequisitionsByJobCard(jobCardId)
    const { data: productResults = [] } = useProductSearchForRequisition(productSearchTerm)
    const createRequisition = useCreatePartRequisition()
    const markAsUsed = useMarkPartsAsUsed()

    // Check permissions
    const canCreateRequisitions = currentUserRole === 'ADMIN' || currentUserRole === 'Technician'
    const canMarkAsUsed = ['ADMIN', 'Technician', 'Service Advisor'].includes(currentUserRole || '')
    const canViewOnly = ['Service Advisor', 'Manager', 'Stores'].includes(currentUserRole || '')
    const isJobCardClosed = jobCardStatus === 'CLOSED' || jobCardStatus === 'COMPLETED'

    // Get status icon
    const getStatusIcon = (status: PartRequisitionStatus) => {
        switch (status) {
            case PartRequisitionStatus.REQUESTED:
                return <Clock className="h-4 w-4" />
            case PartRequisitionStatus.APPROVED:
                return <CheckCircle className="h-4 w-4" />
            case PartRequisitionStatus.DISBURSED:
                return <Package className="h-4 w-4" />
            case PartRequisitionStatus.USED:
            case PartRequisitionStatus.PARTIALLY_USED:
                return <CheckCircle className="h-4 w-4" />
            case PartRequisitionStatus.NOT_AVAILABLE:
                return <XCircle className="h-4 w-4" />
            case PartRequisitionStatus.REJECTED:
                return <XCircle className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    // Handle product selection
    const handleProductSelect = (product: ProductSearchResult) => {
        setSelectedProduct(product)
        setFormData(prev => ({
            ...prev,
            productId: product.productId
        }))
        setShowProductSearch(false)
        setProductSearchTerm('')
    }

    // Handle create requisition
    const handleCreateRequisition = () => {
        if (!formData.productId || formData.requestedQuantity <= 0) {
            return
        }

        const requestData: CreatePartRequisitionDto = {
            jobCardId,
            productId: formData.productId,
            requestedQuantity: formData.requestedQuantity,
            notes: formData.notes || undefined
        }

        createRequisition.mutate(requestData, {
            onSuccess: () => {
                setShowCreateForm(false)
                setSelectedProduct(null)
                setFormData({ productId: '', requestedQuantity: 1, notes: '' })
                refetch()
            }
        })
    }

    // Handle mark as used
    const handleMarkAsUsed = (requisition: PartRequisition) => {
        const usageData = usageFormData[requisition.requisitionId]
        if (!usageData || usageData.quantity <= 0) {
            return
        }

        markAsUsed.mutate({
            requisitionId: requisition.requisitionId,
            data: {
                usedQuantity: usageData.quantity,
                notes: usageData.notes || undefined
            }
        }, {
            onSuccess: () => {
                setUsageFormData(prev => ({
                    ...prev,
                    [requisition.requisitionId]: { quantity: 0, notes: '' }
                }))
                refetch()
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Parts Requisitions
                            {requisitions.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {requisitions.length}
                                </Badge>
                            )}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Request Part Button - Always Visible */}
                        {canCreateRequisitions && (
                            <Button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                disabled={isJobCardClosed}
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Request Part
                            </Button>
                        )}

                        {/* Expand/Collapse Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    Collapse
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    Expand
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* Create Requisition Form */}
            {showCreateForm && (
                <CardContent className="border-t border-gray-200 bg-gray-50">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Request New Part</h3>

                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product *
                            </label>
                            {selectedProduct ? (
                                <div className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
                                    <div>
                                        <p className="font-medium">{selectedProduct.productName}</p>
                                        <p className="text-sm text-gray-600">{selectedProduct.productCode}</p>
                                        <p className="text-xs text-gray-500">
                                            Stock: {selectedProduct.currentStock} | {formatCurrency(selectedProduct.sellingPrice)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedProduct(null)
                                            setFormData(prev => ({ ...prev, productId: '' }))
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowProductSearch(true)}
                                    className="w-full justify-start"
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Search for product...
                                </Button>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Requested Quantity *
                            </label>
                            <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.requestedQuantity}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    requestedQuantity: parseFloat(e.target.value) || 0
                                }))}
                                placeholder="Enter quantity"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Additional notes or specifications..."
                                maxLength={500}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateForm(false)
                                    setSelectedProduct(null)
                                    setFormData({ productId: '', requestedQuantity: 1, notes: '' })
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateRequisition}
                                disabled={!formData.productId || formData.requestedQuantity <= 0 || createRequisition.isPending}
                                className="flex items-center gap-2"
                            >
                                {createRequisition.isPending ? (
                                    <Loading size="sm" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                Create Requisition
                            </Button>
                        </div>
                    </div>
                </CardContent>
            )}

            {/* Requisitions List */}
            {isExpanded && (
                <CardContent className="pt-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loading size="md" text="Loading requisitions..." />
                        </div>
                    ) : requisitions.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No parts requisitions yet</p>
                            {canCreateRequisitions && !isJobCardClosed && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Click "Request Part" to get started
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requisitions.map((requisition) => {
                                const canMarkUsed = canMarkAsUsed &&
                                    requisition.status === PartRequisitionStatus.DISBURSED &&
                                    !isJobCardClosed

                                return (
                                    <div key={requisition.requisitionId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {requisition.productName}
                                                    </h4>
                                                    <Badge
                                                        variant={PART_REQUISITION_STATUS_COLORS[requisition.status] as any}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {getStatusIcon(requisition.status)}
                                                        {PART_REQUISITION_STATUS_LABELS[requisition.status]}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-2">
                                                    Code: {requisition.productCode}
                                                </p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Requested:</span>
                                                        <p className="font-medium">{requisition.requestedQuantity}</p>
                                                    </div>
                                                    {requisition.approvedQuantity > 0 && (
                                                        <div>
                                                            <span className="text-gray-500">Approved:</span>
                                                            <p className="font-medium">{requisition.approvedQuantity}</p>
                                                        </div>
                                                    )}
                                                    {requisition.disbursedQuantity > 0 && (
                                                        <div>
                                                            <span className="text-gray-500">Disbursed:</span>
                                                            <p className="font-medium">{requisition.disbursedQuantity}</p>
                                                        </div>
                                                    )}
                                                    {requisition.usedQuantity > 0 && (
                                                        <div>
                                                            <span className="text-gray-500">Used:</span>
                                                            <p className="font-medium">{requisition.usedQuantity}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right text-sm text-gray-500">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{requisition.requestedBy.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDateTime(requisition.requestedAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Information */}
                                        {(requisition.notes || requisition.rejectionReason) && (
                                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                                {requisition.notes && (
                                                    <div className="mb-2">
                                                        <span className="text-sm font-medium text-gray-700">Notes: </span>
                                                        <span className="text-sm text-gray-600">{requisition.notes}</span>
                                                    </div>
                                                )}
                                                {requisition.rejectionReason && (
                                                    <div>
                                                        <span className="text-sm font-medium text-red-700">Rejection Reason: </span>
                                                        <span className="text-sm text-red-600">{requisition.rejectionReason}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Cost Information */}
                                        {requisition.unitCost && (
                                            <div className="mb-3 text-sm">
                                                <span className="text-gray-500">Unit Cost: </span>
                                                <span className="font-medium">{formatCurrency(requisition.unitCost)}</span>
                                                {requisition.totalCost && (
                                                    <>
                                                        <span className="text-gray-500 ml-4">Total Cost: </span>
                                                        <span className="font-medium">{formatCurrency(requisition.totalCost)}</span>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Mark as Used Form */}
                                        {canMarkUsed && (
                                            <div className="border-t border-gray-200 pt-3 mt-3">
                                                <h5 className="text-sm font-medium text-gray-700 mb-3">Mark Parts as Used</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Used Quantity
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            min="0.01"
                                                            max={requisition.disbursedQuantity}
                                                            step="0.01"
                                                            value={usageFormData[requisition.requisitionId]?.quantity || ''}
                                                            onChange={(e) => {
                                                                const quantity = parseFloat(e.target.value) || 0
                                                                setUsageFormData(prev => ({
                                                                    ...prev,
                                                                    [requisition.requisitionId]: {
                                                                        ...prev[requisition.requisitionId],
                                                                        quantity
                                                                    }
                                                                }))
                                                            }}
                                                            placeholder="Enter quantity used"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Usage Notes
                                                        </label>
                                                        <Input
                                                            value={usageFormData[requisition.requisitionId]?.notes || ''}
                                                            onChange={(e) => {
                                                                setUsageFormData(prev => ({
                                                                    ...prev,
                                                                    [requisition.requisitionId]: {
                                                                        ...prev[requisition.requisitionId],
                                                                        notes: e.target.value
                                                                    }
                                                                }))
                                                            }}
                                                            placeholder="Optional notes"
                                                            maxLength={500}
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <Button
                                                            onClick={() => handleMarkAsUsed(requisition)}
                                                            disabled={
                                                                !usageFormData[requisition.requisitionId]?.quantity ||
                                                                markAsUsed.isPending
                                                            }
                                                            size="sm"
                                                            className="w-full"
                                                        >
                                                            {markAsUsed.isPending ? (
                                                                <Loading size="sm" />
                                                            ) : (
                                                                'Mark as Used'
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            )}

            {/* Product Search Modal */}
            {showProductSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Search Products</h3>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowProductSearch(false)
                                        setProductSearchTerm('')
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search products..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {productSearchTerm.length < 2 ? (
                                    <p className="text-gray-500 text-center py-4">
                                        Type at least 2 characters to search
                                    </p>
                                ) : productResults.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">
                                        No products found
                                    </p>
                                ) : (
                                    productResults.map(product => (
                                        <div
                                            key={product.productId}
                                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium">{product.productName}</p>
                                                    <p className="text-sm text-gray-600">{product.productCode}</p>
                                                    <p className="text-xs text-gray-500">{product.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(product.sellingPrice)}</p>
                                                    <p className="text-sm text-gray-600">Stock: {product.currentStock}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Card>
    )
}