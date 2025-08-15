// src/pages/partsRequisition/PartsRequisitionList.tsx
import React, { useState, useMemo } from 'react'
import {
    Package,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    User,
    Calendar,
    FileText,
    Truck,
    Ban,
    MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import {
    useAllPartRequisitions,
    useApproveRequisition,
    useDisburseRequisition,
    useMarkAsNotAvailable,
    useRejectRequisition
} from '@/hooks/usePartsRequisition'
import {
    PartRequisition,
    PartRequisitionStatus,
    PartRequisitionFilters,
    PART_REQUISITION_STATUS_LABELS,
    PART_REQUISITION_STATUS_COLORS
} from '@/types/partRequisition'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import _ from 'lodash'

export const PartsRequisitionList: React.FC = () => {
    // State management
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<PartRequisitionStatus | ''>('')
    const [showFilters, setShowFilters] = useState(false)

    // Form states for actions
    const [actionForms, setActionForms] = useState<{
        [key: string]: {
            approvedQuantity?: number
            disbursedQuantity?: number
            notes?: string
            reason?: string
        }
    }>({})

    // Build filters
    const filters: PartRequisitionFilters = useMemo(() => ({
        status: statusFilter || undefined,
        jobCardNumber: searchTerm,
        employeeName: searchTerm,
        productName: searchTerm,
    }), [searchTerm, statusFilter])

    // Hooks
    const { data: requisitions = [], isLoading, error, refetch } = useAllPartRequisitions(filters)
    const approveRequisition = useApproveRequisition()
    const disburseRequisition = useDisburseRequisition()
    const markAsNotAvailable = useMarkAsNotAvailable()
    const rejectRequisition = useRejectRequisition()

    // Group requisitions by job card
    const groupedRequisitions = useMemo(() => {
        return _.groupBy(requisitions, 'jobCardId')
    }, [requisitions])

    // Statistics
    const stats = useMemo(() => {
        const total = requisitions.length
        const pending = requisitions.filter(r => r.status === PartRequisitionStatus.REQUESTED).length
        const approved = requisitions.filter(r => r.status === PartRequisitionStatus.APPROVED).length
        const disbursed = requisitions.filter(r => r.status === PartRequisitionStatus.DISBURSED).length
        const used = requisitions.filter(r => [PartRequisitionStatus.USED, PartRequisitionStatus.PARTIALLY_USED].includes(r.status)).length

        return { total, pending, approved, disbursed, used }
    }, [requisitions])

    // Get status icon
    const getStatusIcon = (status: PartRequisitionStatus) => {
        switch (status) {
            case PartRequisitionStatus.REQUESTED:
                return <Clock className="h-4 w-4" />
            case PartRequisitionStatus.APPROVED:
                return <CheckCircle className="h-4 w-4" />
            case PartRequisitionStatus.DISBURSED:
                return <Truck className="h-4 w-4" />
            case PartRequisitionStatus.USED:
            case PartRequisitionStatus.PARTIALLY_USED:
                return <CheckCircle className="h-4 w-4" />
            case PartRequisitionStatus.NOT_AVAILABLE:
                return <Ban className="h-4 w-4" />
            case PartRequisitionStatus.REJECTED:
                return <XCircle className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
        }
    }

    // Handle form updates
    const updateActionForm = (requisitionId: string, field: string, value: any) => {
        setActionForms(prev => ({
            ...prev,
            [requisitionId]: {
                ...prev[requisitionId],
                [field]: value
            }
        }))
    }

    // Handle approve
    const handleApprove = (requisition: PartRequisition) => {
        const formData = actionForms[requisition.requisitionId]
        if (!formData?.approvedQuantity || formData.approvedQuantity <= 0) {
            return
        }

        approveRequisition.mutate({
            requisitionId: requisition.requisitionId,
            data: {
                approvedQuantity: formData.approvedQuantity,
                notes: formData.notes
            }
        }, {
            onSuccess: () => {
                setActionForms(prev => ({
                    ...prev,
                    [requisition.requisitionId]: {}
                }))
                refetch()
            }
        })
    }

    // Handle disburse
    const handleDisburse = (requisition: PartRequisition) => {
        const formData = actionForms[requisition.requisitionId]
        if (!formData?.disbursedQuantity || formData.disbursedQuantity <= 0) {
            return
        }

        disburseRequisition.mutate({
            requisitionId: requisition.requisitionId,
            data: {
                disbursedQuantity: formData.disbursedQuantity,
                notes: formData.notes
            }
        }, {
            onSuccess: () => {
                setActionForms(prev => ({
                    ...prev,
                    [requisition.requisitionId]: {}
                }))
                refetch()
            }
        })
    }

    // Handle mark as not available
    const handleMarkAsNotAvailable = (requisition: PartRequisition) => {
        const formData = actionForms[requisition.requisitionId]
        if (!formData?.reason) {
            return
        }

        markAsNotAvailable.mutate({
            requisitionId: requisition.requisitionId,
            data: {
                reason: formData.reason,
                notes: formData.notes
            }
        }, {
            onSuccess: () => {
                setActionForms(prev => ({
                    ...prev,
                    [requisition.requisitionId]: {}
                }))
                refetch()
            }
        })
    }

    // Handle reject
    const handleReject = (requisition: PartRequisition) => {
        const formData = actionForms[requisition.requisitionId]
        if (!formData?.reason) {
            return
        }

        rejectRequisition.mutate({
            requisitionId: requisition.requisitionId,
            reason: formData.reason
        }, {
            onSuccess: () => {
                setActionForms(prev => ({
                    ...prev,
                    [requisition.requisitionId]: {}
                }))
                refetch()
            }
        })
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Requisitions</h3>
                            <p className="text-gray-600 mb-4">Failed to load parts requisitions. Please try again.</p>
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
                            <Package className="h-8 w-8" />
                            Parts Requisitions
                        </h1>
                        <p className="mt-1 text-gray-600">Manage parts requisitions and inventory disbursement</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Requisitions</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Approval</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Disbursed</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.disbursed}</p>
                            </div>
                            <Truck className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Used</p>
                                <p className="text-2xl font-bold text-green-600">{stats.used}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
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
                                    placeholder="Search by job card, employee, or product..."
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
                                onChange={(e) => setStatusFilter(e.target.value as PartRequisitionStatus | '')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Statuses</option>
                                {Object.values(PartRequisitionStatus).map(status => (
                                    <option key={status} value={status}>
                                        {PART_REQUISITION_STATUS_LABELS[status]}
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

            {/* Requisitions by Job Card */}
            {isLoading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loading size="lg" text="Loading requisitions..." />
                    </CardContent>
                </Card>
            ) : Object.keys(groupedRequisitions).length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Requisitions Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter ? 'No requisitions match your search criteria.' : 'No parts requisitions have been created yet.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedRequisitions).map(([jobCardId, jobCardRequisitions]) => {
                        const firstRequisition = jobCardRequisitions[0]

                        return (
                            <Card key={jobCardId}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Job Card #{firstRequisition.jobCardNumber}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {jobCardRequisitions.length} requisition{jobCardRequisitions.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {_.uniq(jobCardRequisitions.map(r => r.status)).map(status => (
                                                <Badge
                                                    key={status}
                                                    variant={PART_REQUISITION_STATUS_COLORS[status] as any}
                                                    size="sm"
                                                >
                                                    {PART_REQUISITION_STATUS_LABELS[status]}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {jobCardRequisitions.map((requisition) => {
                                            const formData = actionForms[requisition.requisitionId] || {}
                                            const canApprove = requisition.status === PartRequisitionStatus.REQUESTED
                                            const canDisburse = requisition.status === PartRequisitionStatus.APPROVED
                                            const isNotAvailable = requisition.status === PartRequisitionStatus.NOT_AVAILABLE

                                            return (
                                                <div key={requisition.requisitionId} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-4">
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

                                                            <p className="text-sm text-gray-600 mb-3">
                                                                Code: {requisition.productCode}
                                                            </p>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
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
                                                                {requisition.unitCost && (
                                                                    <div>
                                                                        <span className="text-gray-500">Unit Cost:</span>
                                                                        <p className="font-medium">{formatCurrency(requisition.unitCost)}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <div className="flex items-center gap-1">
                                                                    <User className="h-3 w-3" />
                                                                    <span>{requisition.requestedBy.name} ({requisition.requestedBy.role})</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>{formatDateTime(requisition.requestedAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Notes and Rejection Reason */}
                                                    {(requisition.notes || requisition.rejectionReason) && (
                                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
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

                                                    {/* Action Forms */}
                                                    {canApprove && (
                                                        <div className="border-t border-gray-200 pt-4">
                                                            <h5 className="text-sm font-medium text-gray-700 mb-3">Approve Requisition</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Approved Quantity *
                                                                    </label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0.01"
                                                                        max={requisition.requestedQuantity}
                                                                        step="0.01"
                                                                        value={formData.approvedQuantity || ''}
                                                                        onChange={(e) => updateActionForm(
                                                                            requisition.requisitionId,
                                                                            'approvedQuantity',
                                                                            parseFloat(e.target.value) || 0
                                                                        )}
                                                                        placeholder={`Max: ${requisition.requestedQuantity}`}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Notes
                                                                    </label>
                                                                    <Input
                                                                        value={formData.notes || ''}
                                                                        onChange={(e) => updateActionForm(
                                                                            requisition.requisitionId,
                                                                            'notes',
                                                                            e.target.value
                                                                        )}
                                                                        placeholder="Optional notes"
                                                                        maxLength={500}
                                                                    />
                                                                </div>
                                                                <div className="flex items-end gap-2">
                                                                    <Button
                                                                        onClick={() => handleApprove(requisition)}
                                                                        disabled={
                                                                            !formData.approvedQuantity ||
                                                                            approveRequisition.isPending ||
                                                                            isNotAvailable
                                                                        }
                                                                        size="sm"
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        {approveRequisition.isPending ? (
                                                                            <Loading size="sm" />
                                                                        ) : (
                                                                            'Approve'
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                                <div className="flex items-end gap-2">
                                                                    <Button
                                                                        onClick={() => handleMarkAsNotAvailable(requisition)}
                                                                        disabled={markAsNotAvailable.isPending}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-orange-600 hover:text-orange-700"
                                                                    >
                                                                        Not Available
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Not Available Reason Form */}
                                                            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                    Reason for Not Available
                                                                </label>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        value={formData.reason || ''}
                                                                        onChange={(e) => updateActionForm(
                                                                            requisition.requisitionId,
                                                                            'reason',
                                                                            e.target.value
                                                                        )}
                                                                        placeholder="Explain why parts are not available..."
                                                                        maxLength={1000}
                                                                        className="flex-1"
                                                                    />
                                                                    <Button
                                                                        onClick={() => handleReject(requisition)}
                                                                        disabled={!formData.reason || rejectRequisition.isPending}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {canDisburse && (
                                                        <div className="border-t border-gray-200 pt-4">
                                                            <h5 className="text-sm font-medium text-gray-700 mb-3">Disburse Parts</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Disbursed Quantity *
                                                                    </label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0.01"
                                                                        max={requisition.approvedQuantity}
                                                                        step="0.01"
                                                                        value={formData.disbursedQuantity || ''}
                                                                        onChange={(e) => updateActionForm(
                                                                            requisition.requisitionId,
                                                                            'disbursedQuantity',
                                                                            parseFloat(e.target.value) || 0
                                                                        )}
                                                                        placeholder={`Max: ${requisition.approvedQuantity}`}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                        Disbursement Notes
                                                                    </label>
                                                                    <Input
                                                                        value={formData.notes || ''}
                                                                        onChange={(e) => updateActionForm(
                                                                            requisition.requisitionId,
                                                                            'notes',
                                                                            e.target.value
                                                                        )}
                                                                        placeholder="Optional notes"
                                                                        maxLength={500}
                                                                    />
                                                                </div>
                                                                <div className="flex items-end">
                                                                    <Button
                                                                        onClick={() => handleDisburse(requisition)}
                                                                        disabled={
                                                                            !formData.disbursedQuantity ||
                                                                            disburseRequisition.isPending
                                                                        }
                                                                        size="sm"
                                                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                                                    >
                                                                        {disburseRequisition.isPending ? (
                                                                            <Loading size="sm" />
                                                                        ) : (
                                                                            'Disburse Parts'
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
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default PartsRequisitionList