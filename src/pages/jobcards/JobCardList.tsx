import React, { useState, useMemo } from 'react'
import { useFreezeJobCard, useCloseJobCard, useSetJobCardPriority, useDeleteJobCard, useJobCards, useUpdateJobCardStatus, useUnfreezeJobCard} from '@/hooks/useJobCards'
import { JobCardFilters } from '@/services/api/jobCards'
import { JOB_CARD_STATUSES } from '@/utils/constants'
import { formatDate } from '@/utils/date'
import { JobCard } from '@/types'
import {
    AlertTriangle,
    Calendar,
    Car,
    CheckCircle,
    Clock,
    Edit,
    Filter,
    Play,
    Plus,
    Search,
    Snowflake,
    Target,
    Trash2,
    User,
    X
} from 'lucide-react'
import { Card, CardContent, CardHeader, Button, Badge, Input, Loading } from '@/components/ui'





const JobCardList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<JobCardFilters>({})
    const [showFilters, setShowFilters] = useState(false)
    const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showJobCardForm, setShowJobCardForm] = useState(false)
    const [editingJobCard, setEditingJobCard] = useState<JobCard | null>(null)

    // Fetch job cards
    const { data: jobCards, isLoading, error, refetch } = useJobCards(filters)

    // Mutations
    const deleteJobCard = useDeleteJobCard()
    const updateStatus = useUpdateJobCardStatus()
    const freezeJobCard = useFreezeJobCard()
    const unfreezeJobCard = useUnfreezeJobCard()
    const closeJobCard = useCloseJobCard()
    const setPriority = useSetJobCardPriority()

    // Filter job cards based on search term
    const filteredJobCards = useMemo(() => {
        if (!jobCards) return []

        return jobCards.filter(jobCard =>
            jobCard.jobCardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            jobCard.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            jobCard.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            jobCard.jobCardNumber.toString().includes(searchTerm)
        )
    }, [jobCards, searchTerm])

    // Get status color and icon
    const getStatusInfo = (status: string) => {
        switch (status.toUpperCase()) {
            case 'OPEN':
                return { color: 'secondary', icon: Clock, label: 'Open' }
            case 'IN_PROGRESS':
                return { color: 'warning', icon: Play, label: 'In Progress' }
            case 'FROZEN':
                return { color: 'error', icon: Snowflake, label: 'Frozen' }
            case 'COMPLETED':
                return { color: 'success', icon: CheckCircle, label: 'Completed' }
            case 'CLOSED':
                return { color: 'gray', icon: X, label: 'Closed' }
            default:
                return { color: 'gray', icon: Clock, label: status }
        }
    }

    // Handle status change
    const handleStatusChange = (jobCard: JobCard, newStatus: string) => {
        updateStatus.mutate({ id: jobCard.id, status: newStatus })
    }

    // Handle freeze/unfreeze
    const handleFreeze = (jobCard: JobCard) => {
        if (jobCard.dateAndTimeFrozen) {
            unfreezeJobCard.mutate(jobCard.id)
        } else {
            freezeJobCard.mutate({ id: jobCard.id, reason: 'Frozen by user' })
        }
    }

    // Handle priority toggle
    const handlePriorityToggle = (jobCard: JobCard) => {
        setPriority.mutate({ id: jobCard.id, priority: !jobCard.priority })
    }

    // Handle edit
    const handleEdit = (jobCard: JobCard) => {
        setEditingJobCard(jobCard)
        setShowJobCardForm(true)
    }

    // Handle create new
    const handleCreateNew = () => {
        setEditingJobCard(null)
        setShowJobCardForm(true)
    }

    // Handle form close
    const handleFormClose = () => {
        setShowJobCardForm(false)
        setEditingJobCard(null)
    }

    // Handle delete
    const handleDelete = (jobCard: JobCard) => {
        setSelectedJobCard(jobCard)
        setShowDeleteModal(true)
    }

    const confirmDelete = () => {
        if (selectedJobCard) {
            deleteJobCard.mutate(selectedJobCard.id)
            setShowDeleteModal(false)
            setSelectedJobCard(null)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Job Cards</h1>
                </div>
                <Loading size="lg" text="Loading job cards..." />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Job Cards</h1>
                </div>
                <Card>
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-error-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Job Cards</h3>
                        <p className="text-gray-600 mb-4">
                            {error instanceof Error ? error.message : 'Failed to load job cards'}
                        </p>
                        <Button onClick={() => refetch()}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Cards</h1>
                    <p className="text-gray-600">Manage vehicle service job cards</p>
                </div>
                <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4" />
                    New Job Card
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search job cards..."
                                icon={Search}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="label">Status</label>
                                    <select
                                        className="input"
                                        value={filters.status || ''}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="FROZEN">Frozen</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Priority</label>
                                    <select
                                        className="input"
                                        value={filters.priority?.toString() || ''}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            priority: e.target.value ? e.target.value === 'true' : undefined
                                        })}
                                    >
                                        <option value="">All</option>
                                        <option value="true">Priority Only</option>
                                        <option value="false">Non-Priority</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setFilters({})}
                                        className="w-full"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobCards.map((jobCard) => {
                    const statusInfo = getStatusInfo(jobCard.dateAndTimeFrozen ? 'FROZEN' : 'IN_PROGRESS')
                    const StatusIcon = statusInfo.icon
                    const isOverdue = new Date(jobCard.jobCardDeadline) < new Date()

                    return (
                        <Card key={jobCard.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{jobCard.jobCardName}</h3>
                                            {jobCard.priority && (
                                                <AlertTriangle className="h-4 w-4 text-warning-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">#{jobCard.jobCardNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge variant={statusInfo.color as any}>
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {statusInfo.label}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Client and Vehicle */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="h-4 w-4" />
                                        <span>{jobCard.clientName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Car className="h-4 w-4" />
                                        <span>{jobCard.vehicleName}</span>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>Started: {formatDate(jobCard.dateAndTimeIn)}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-sm ${
                                        isOverdue ? 'text-error-600' : 'text-gray-600'
                                    }`}>
                                        <Target className="h-4 w-4" />
                                        <span>Due: {formatDate(jobCard.jobCardDeadline)}</span>
                                        {isOverdue && <span className="text-xs font-medium">(Overdue)</span>}
                                    </div>
                                </div>

                                {/* Service Advisor */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="h-4 w-4" />
                                    <span>Advisor: {jobCard.serviceAdvisorName}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePriorityToggle(jobCard)}
                                            className={jobCard.priority ? 'text-warning-600' : 'text-gray-400'}
                                        >
                                            <AlertTriangle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleFreeze(jobCard)}
                                            className={jobCard.dateAndTimeFrozen ? 'text-error-600' : 'text-gray-400'}
                                        >
                                            <Snowflake className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(jobCard)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(jobCard)}
                                            className="text-error-600 hover:text-error-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Empty State */}
            {filteredJobCards.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Cards Found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || Object.keys(filters).length > 0
                                ? 'No job cards match your current search or filters.'
                                : 'Get started by creating your first job card.'
                            }
                        </p>
                        {!searchTerm && Object.keys(filters).length === 0 && (
                            <Button onClick={handleCreateNew}>
                                <Plus className="h-4 w-4" />
                                Create Job Card
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Job Card</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600">
                                Are you sure you want to delete job card "{selectedJobCard?.jobCardName}"?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setSelectedJobCard(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={confirmDelete}
                                    loading={deleteJobCard.isPending}
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default JobCardList