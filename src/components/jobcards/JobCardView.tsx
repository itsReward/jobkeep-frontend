import React, { useState } from 'react'
import { format, differenceInHours, differenceInDays } from 'date-fns'
import {
    ArrowLeft,
    Calendar,
    User,
    Car,
    Clock,
    AlertTriangle,
    CheckCircle,
    Snowflake,
    Play,
    X,
    Edit,
    FileText,
    Phone,
    Mail,
    MapPin,
    Settings,
    Wrench,
    Timer,
    Flag,
    PauseCircle,
    CheckCircle2,
    XCircle,
    Plus,
    Trash2,
    Eye
} from 'lucide-react'
import { JobCard, Client, Vehicle, Employee, Timesheet } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { TimesheetModal } from '@/components/timesheets/TimesheetModal'
import { CommentsPanel } from '@/components/comments/CommentsPanel'
import { PartsRequisitionSection } from '@/components/jobcards/PartsRequisitionSection'
import {
    useJobCard,
    useUpdateJobCardStatus,
    useFreezeJobCard,
    useUnfreezeJobCard,
    useCloseJobCard,
    useSetJobCardPriority
} from '@/hooks/useJobCards'
import { useEmployees } from '@/hooks/useEmployees'
import {
    useTimesheetsByJobCard,
    useJobCardTechnicians,
    useAssignTechnician,
    useRemoveTechnician
} from '@/hooks/useTimesheets'

interface JobCardViewProps {
    jobCardId: string
    onBack: () => void
    onEdit?: (jobCard: JobCard) => void
    currentUserId?: string
    currentUserRole?: string
}

export const JobCardView: React.FC<JobCardViewProps> = ({
                                                            jobCardId,
                                                            onBack,
                                                            onEdit,
                                                            currentUserId,
                                                            currentUserRole
                                                        }) => {
    const { data: jobCard, isLoading, error } = useJobCard(jobCardId)
    const { data: timesheets, isLoading: timesheetsLoading } = useTimesheetsByJobCard(jobCardId)
    const { data: technicians, isLoading: techniciansLoading } = useJobCardTechnicians(jobCardId)

    const updateStatus = useUpdateJobCardStatus()
    const freezeJobCard = useFreezeJobCard()
    const unfreezeJobCard = useUnfreezeJobCard()
    const closeJobCard = useCloseJobCard()
    const setPriority = useSetJobCardPriority()
    const assignTechnician = useAssignTechnician()
    const removeTechnician = useRemoveTechnician()

    const [showStatusDropdown, setShowStatusDropdown] = useState(false)
    const [showTechnicianDropdown, setShowTechnicianDropdown] = useState(false)
    const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null)
    const [showTimesheetModal, setShowTimesheetModal] = useState(false)

    const { data: employees = [] } = useEmployees()
    const technicianOptions = employees
        .filter(e => e.employeeRole?.toLowerCase() === 'technician')
        .map(e => ({
            id: e.employeeId,
            employeeId: e.employeeId,
            name: `${e.employeeName} ${e.employeeSurname}`
        }))
        .filter(opt => !technicians?.some(t => t.employeeId === opt.employeeId))

    if (isLoading) {
        return (
            <div className="p-6">
                <Loading size="lg" text="Loading job card details..." />
            </div>
        )
    }

    if (error || !jobCard) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-error-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Job Card</h3>
                        <p className="text-gray-600 mb-4">
                            {error instanceof Error ? error.message : 'Failed to load job card details'}
                        </p>
                        <Button onClick={onBack}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Get status information
    const getStatusInfo = (status: string) => {
        const normalizedStatus = status?.toUpperCase() || 'OPEN'
        switch (normalizedStatus) {
            case 'OPEN':
                return { color: 'secondary', icon: Clock, label: 'Open', bgColor: 'bg-secondary-100', textColor: 'text-secondary-800' }
            case 'IN_PROGRESS':
                return { color: 'warning', icon: Play, label: 'In Progress', bgColor: 'bg-warning-100', textColor: 'text-warning-800' }
            case 'FROZEN':
                return { color: 'error', icon: Snowflake, label: 'Frozen', bgColor: 'bg-error-100', textColor: 'text-error-800' }
            case 'COMPLETED':
                return { color: 'success', icon: CheckCircle, label: 'Completed', bgColor: 'bg-success-100', textColor: 'text-success-800' }
            case 'CLOSED':
                return { color: 'gray', icon: X, label: 'Closed', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
            default:
                return { color: 'gray', icon: Clock, label: status, bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
        }
    }

    const currentStatus = getStatusInfo(jobCard.dateAndTimeClosed ? 'CLOSED' : jobCard.dateAndTimeFrozen ? 'FROZEN' : 'OPEN')

    // Safe date parsing helper
    const safeParseDate = (dateString: string | undefined | null): Date | null => {
        if (!dateString) return null
        try {
            const date = new Date(dateString)
            return isNaN(date.getTime()) ? null : date
        } catch {
            return null
        }
    }

    // Safe date formatting helper
    const formatSafeDate = (date: Date | null, formatStr: string = 'PPP p'): string => {
        if (!date) return 'Invalid Date'
        try {
            return format(date, formatStr)
        } catch {
            return 'Invalid Date'
        }
    }

    // Calculate time metrics safely
    const dateIn = safeParseDate(jobCard.dateAndTimeIn)
    const estimatedCompletion = safeParseDate(jobCard.estimatedTimeOfCompletion)
    const deadline = safeParseDate(jobCard.jobCardDeadline)
    const now = new Date()

    const hoursElapsed = dateIn ? differenceInHours(now, dateIn) : 0
    const daysUntilDeadline = deadline ? differenceInDays(deadline, now) : 0
    const isOverdue = deadline ? deadline < now && !jobCard.dateAndTimeClosed : false

    // Handle status changes
    const handleStatusChange = (newStatus: string) => {
        updateStatus.mutate({ id: jobCard.id, status: newStatus })
        setShowStatusDropdown(false)
    }

    const handleFreeze = () => {
        if (jobCard.dateAndTimeFrozen) {
            unfreezeJobCard.mutate(jobCard.id)
        } else {
            freezeJobCard.mutate({ id: jobCard.id, reason: 'Frozen by user' })
        }
    }

    const handleClose = () => {
        closeJobCard.mutate({ id: jobCard.id, notes: 'Closed from job card view' })
    }

    const handlePriorityToggle = () => {
        setPriority.mutate({ id: jobCard.id, priority: !jobCard.priority })
    }

    // Handle timesheet view
    const handleViewTimesheet = (timesheet: Timesheet) => {
        setSelectedTimesheet(timesheet)
        setShowTimesheetModal(true)
    }

    // Handle technician management
    const handleAddTechnician = (technicianId: string) => {
        console.log('handleAddTechnician called with:', technicianId)
        if (!technicianId) {
            console.error('handleAddTechnician received undefined or empty technicianId')
            return
        }
        assignTechnician.mutate({ jobCardId: jobCard.id, technicianId })
        setShowTechnicianDropdown(false)
    }

    const handleRemoveTechnician = (technicianId: string) => {
        removeTechnician.mutate({ jobCardId: jobCard.id, technicianId })
    }

    // Truncate text helper
    const truncateText = (text: string, maxLength: number = 500): string => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    // Sort timesheets by clock in time (chronological order)
    const sortedTimesheets = timesheets ?
        [...timesheets].sort((a, b) => {
            const dateA = new Date(a.clockInDateAndTime).getTime()
            const dateB = new Date(b.clockInDateAndTime).getTime()
            return dateA - dateB
        }) : []

    const availableStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED']

    // Get current job card status string for parts requisition
    const jobCardStatusString = jobCard.dateAndTimeClosed ? 'CLOSED' : jobCard.dateAndTimeFrozen ? 'FROZEN' : 'OPEN'

    return (
        <div className="flex h-full">
            {/* Main Content Area */}
            <div className="flex-1 p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={onBack} className="p-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {jobCard.jobCardName}
                            </h1>
                            <p className="text-gray-600">Job Card #{jobCard.jobCardNumber}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {onEdit && (
                            <Button variant="outline" onClick={() => onEdit(jobCard)}>
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                        )}

                        {/* Priority Toggle */}
                        <Button
                            variant={jobCard.priority ? "primary" : "outline"}
                            onClick={handlePriorityToggle}
                            disabled={setPriority.isPending}
                        >
                            <Flag className="h-4 w-4" />
                            {jobCard.priority ? 'Priority' : 'Set Priority'}
                        </Button>

                        {/* Status Actions */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                disabled={jobCard.dateAndTimeClosed}
                            >
                                <currentStatus.icon className="h-4 w-4" />
                                Change Status
                            </Button>

                            {showStatusDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    {availableStatuses.map((status) => {
                                        const statusInfo = getStatusInfo(status)
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(status)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <statusInfo.icon className="h-4 w-4" />
                                                {statusInfo.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Freeze/Unfreeze */}
                        {!jobCard.dateAndTimeClosed && (
                            <Button
                                variant={jobCard.dateAndTimeFrozen ? "warning" : "outline"}
                                onClick={handleFreeze}
                                disabled={freezeJobCard.isPending || unfreezeJobCard.isPending}
                            >
                                {jobCard.dateAndTimeFrozen ? (
                                    <>
                                        <Play className="h-4 w-4" />
                                        Unfreeze
                                    </>
                                ) : (
                                    <>
                                        <PauseCircle className="h-4 w-4" />
                                        Freeze
                                    </>
                                )}
                            </Button>
                        )}

                        {/* Close */}
                        {!jobCard.dateAndTimeClosed && (
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={closeJobCard.isPending}
                                className="text-error-600 border-error-300 hover:bg-error-50"
                            >
                                <XCircle className="h-4 w-4" />
                                Close Job Card
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status and Priority Bar */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Badge className={`${currentStatus.bgColor} ${currentStatus.textColor}`}>
                                        <currentStatus.icon className="h-4 w-4" />
                                        {currentStatus.label}
                                    </Badge>
                                    {jobCard.priority && (
                                        <Badge className="bg-warning-100 text-warning-800">
                                            <Flag className="h-4 w-4" />
                                            Priority
                                        </Badge>
                                    )}
                                    {isOverdue && (
                                        <Badge className="bg-error-100 text-error-800">
                                            <AlertTriangle className="h-4 w-4" />
                                            Overdue
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-gray-600">Time Elapsed</p>
                                <p className="text-lg font-semibold">{hoursElapsed}h</p>
                                <p className="text-sm text-gray-600">
                                    {daysUntilDeadline >= 0 ? `${daysUntilDeadline} days until deadline` : `${Math.abs(daysUntilDeadline)} days overdue`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Job Details */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Job Details
                            </h2>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Date & Time In</label>
                                    <p className="text-gray-900">{formatSafeDate(dateIn)}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Estimated Completion</label>
                                    <p className="text-gray-900">{formatSafeDate(estimatedCompletion)}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Deadline</label>
                                    <p className={`${isOverdue ? 'text-error-600 font-semibold' : 'text-gray-900'}`}>
                                        {formatSafeDate(deadline)}
                                    </p>
                                </div>

                                {jobCard.dateAndTimeFrozen && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Frozen Date</label>
                                        <p className="text-error-600">{formatSafeDate(safeParseDate(jobCard.dateAndTimeFrozen))}</p>
                                    </div>
                                )}

                                {jobCard.dateAndTimeClosed && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Closed Date</label>
                                        <p className="text-gray-600">{formatSafeDate(safeParseDate(jobCard.dateAndTimeClosed))}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicle Information */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Vehicle Information
                            </h2>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Vehicle</label>
                                    <p className="text-lg font-semibold text-gray-900">{jobCard.vehicleName}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Owner</label>
                                    <p className="text-gray-900">{jobCard.clientName}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Staff Assignment */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Staff Assignment
                            </h2>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Service Advisor and Supervisor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Service Advisor</label>
                                    <p className="text-gray-900 font-medium">{jobCard.serviceAdvisorName}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Supervisor</label>
                                    <p className="text-gray-900 font-medium">{jobCard.supervisorName}</p>
                                </div>
                            </div>

                            {/* Technicians Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-600">Technicians</label>
                                    <div className="flex gap-2 relative">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowTechnicianDropdown(!showTechnicianDropdown)}
                                            disabled={assignTechnician.isPending}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Technician
                                        </Button>

                                        {showTechnicianDropdown && (
                                            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                                {technicianOptions.length > 0 ? (
                                                    technicianOptions.map((opt) => (
                                                        <button
                                                            key={opt.employeeId}
                                                            onClick={() => handleAddTechnician(opt.employeeId)}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-0 border-gray-100"
                                                        >
                                                            {opt.name}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500 italic">
                                                        No more technicians available
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {techniciansLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loading size="sm" text="Loading technicians..." />
                                    </div>
                                ) : technicians && technicians.length > 0 ? (
                                    <div className="space-y-2">
                                        {technicians.map((technician) => (
                                            <div
                                                key={technician.employeeId}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                      <span className="font-medium">
                        {technician.employeeName} {technician.employeeSurname}
                      </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveTechnician(technician.employeeId)}
                                                    className="text-error-600 hover:text-error-700"
                                                    disabled={removeTechnician.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                        <p>No technicians assigned</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Checklists */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Checklists
                            </h2>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">State Checklist</span>
                                    <Badge variant={jobCard.stateChecklistId ? "success" : "secondary"}>
                                        {jobCard.stateChecklistId ? "Completed" : "Pending"}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Service Checklist</span>
                                    <Badge variant={jobCard.serviceChecklistId ? "success" : "secondary"}>
                                        {jobCard.serviceChecklistId ? "Completed" : "Pending"}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Control Checklist</span>
                                    <Badge variant={jobCard.controlChecklistId ? "success" : "secondary"}>
                                        {jobCard.controlChecklistId ? "Completed" : "Pending"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Parts Requisitions Section - Added above Timesheets */}
                <PartsRequisitionSection
                    jobCardId={jobCard.id}
                    jobCardStatus={jobCardStatusString}
                    currentUserRole={currentUserRole}
                    currentUserId={currentUserId}
                />

                {/* Timesheets */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Timer className="h-5 w-5" />
                            Timesheets
                        </h2>
                    </CardHeader>
                    <CardContent className="p-6">
                        {timesheetsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loading size="md" text="Loading timesheets..." />
                            </div>
                        ) : sortedTimesheets && sortedTimesheets.length > 0 ? (
                            <div className="space-y-4">
                                {sortedTimesheets.map((timesheet) => {
                                    const clockInDate = safeParseDate(timesheet.clockInDateAndTime)
                                    const clockOutDate = safeParseDate(timesheet.clockOutDateAndTime)

                                    return (
                                        <div key={timesheet.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900">{timesheet.sheetTitle}</h3>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {timesheet.hoursWorked || 0}h
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Clock className="h-4 w-4" />
                                                            <span>
                              {formatSafeDate(clockInDate, 'MMM d, h:mm a')} - {formatSafeDate(clockOutDate, 'h:mm a')}
                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <User className="h-4 w-4" />
                                                            <span>{timesheet.technicianName}</span>
                                                        </div>
                                                    </div>

                                                    {timesheet.report && (
                                                        <div className="mb-3">
                                                            <p className="text-sm text-gray-600 mb-1">Work Report:</p>
                                                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                                                {truncateText(timesheet.report, 200)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewTimesheet(timesheet)}
                                                    className="ml-3"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}

                                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-primary-900">Total Hours Logged</span>
                                        <span className="text-xl font-bold text-primary-900">
                    {sortedTimesheets.reduce((total, ts) => total + (ts.hoursWorked || 0), 0)}h
                  </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No timesheets recorded yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Timesheet Detail Modal */}
                {selectedTimesheet && (
                    <TimesheetModal
                        timesheet={selectedTimesheet}
                        isOpen={showTimesheetModal}
                        onClose={() => {
                            setShowTimesheetModal(false)
                            setSelectedTimesheet(null)
                        }}
                    />
                )}
            </div>

            {/* Comments Panel */}
            <CommentsPanel
                jobCardId={jobCardId}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
            />
        </div>
    )
}