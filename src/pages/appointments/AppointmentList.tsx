// src/pages/appointments/AppointmentList.tsx
import React, { useState, useMemo } from 'react'
import { useAppointments, useCancelAppointment, useUpdateAppointmentStatus } from '@/hooks/useAppointments'
import { Appointment, AppointmentStatus, AppointmentPriority } from '@/services/api/appointments'
import {
    Plus,
    Search,
    Filter,
    Edit,
    Eye,
    Trash2,
    Calendar as CalendarIcon,
    Clock,
    User,
    Car,
    X,
    AlertTriangle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, Button, Badge, Input, Loading } from '@/components/ui'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { AppointmentView } from '@/components/appointments/AppointmentView'
import { formatDate } from '@/utils/date'

const AppointmentList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showAppointmentForm, setShowAppointmentForm] = useState(false)
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
    const [viewingAppointmentId, setViewingAppointmentId] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [calendarMonth, setCalendarMonth] = useState(new Date())

    // Filter states
    const [statusFilter, setStatusFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')

    // Fetch appointments
    const { data: appointments, isLoading, error, refetch } = useAppointments(searchTerm)

    // Mutations
    const cancelAppointment = useCancelAppointment()
    const updateStatus = useUpdateAppointmentStatus()

    // Calendar logic
    const currentDate = new Date()
    const today = currentDate.toISOString().split('T')[0]

    // Get appointments by date for calendar
    const appointmentsByDate = useMemo(() => {
        if (!appointments) return {}

        return appointments.reduce((acc, appointment) => {
            const date = appointment.appointmentDate
            if (!acc[date]) {
                acc[date] = []
            }
            acc[date].push(appointment)
            return acc
        }, {} as Record<string, Appointment[]>)
    }, [appointments])

    // Filtered appointments based on filters and selected date
    const filteredAppointments = useMemo(() => {
        if (!appointments) return []

        return appointments.filter(appointment => {
            // Status filter
            if (statusFilter && appointment.status !== statusFilter) {
                return false
            }

            // Priority filter
            if (priorityFilter && appointment.priority !== priorityFilter) {
                return false
            }

            // Date filter (if date selected on calendar)
            if (selectedDate && appointment.appointmentDate !== selectedDate) {
                return false
            }

            return true
        })
    }, [appointments, statusFilter, priorityFilter, selectedDate])

    // Calendar generation logic
    const generateCalendarDays = () => {
        const year = calendarMonth.getFullYear()
        const month = calendarMonth.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())

        const days = []
        const currentDate = new Date(startDate)

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }

        return days
    }

    const calendarDays = generateCalendarDays()

    // Event handlers
    const handleCreateAppointment = () => {
        setEditingAppointment(null)
        setShowAppointmentForm(true)
    }

    const handleEditAppointment = (appointment: Appointment) => {
        setEditingAppointment(appointment)
        setShowAppointmentForm(true)
    }

    const handleViewAppointment = (appointmentId: string) => {
        setViewingAppointmentId(appointmentId)
    }

    const handleCancelAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment)
        setShowDeleteModal(true)
    }

    const confirmCancel = async () => {
        if (selectedAppointment) {
            await cancelAppointment.mutateAsync(selectedAppointment.appointmentId)
            setShowDeleteModal(false)
            setSelectedAppointment(null)
        }
    }

    const handleStatusChange = async (appointmentId: string, status: AppointmentStatus) => {
        await updateStatus.mutateAsync({ id: appointmentId, status })
    }

    const resetFilters = () => {
        setSearchTerm('')
        setStatusFilter('')
        setPriorityFilter('')
        setSelectedDate('')
    }

    const getStatusBadgeColor = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.SCHEDULED:
                return 'bg-blue-100 text-blue-800'
            case AppointmentStatus.CONFIRMED:
                return 'bg-green-100 text-green-800'
            case AppointmentStatus.IN_PROGRESS:
                return 'bg-yellow-100 text-yellow-800'
            case AppointmentStatus.COMPLETED:
                return 'bg-emerald-100 text-emerald-800'
            case AppointmentStatus.CANCELLED:
                return 'bg-red-100 text-red-800'
            case AppointmentStatus.NO_SHOW:
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityBadgeColor = (priority: AppointmentPriority) => {
        switch (priority) {
            case AppointmentPriority.LOW:
                return 'bg-gray-100 text-gray-800'
            case AppointmentPriority.NORMAL:
                return 'bg-blue-100 text-blue-800'
            case AppointmentPriority.HIGH:
                return 'bg-orange-100 text-orange-800'
            case AppointmentPriority.URGENT:
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCalendarMonth(prev => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1)
            } else {
                newDate.setMonth(newDate.getMonth() + 1)
            }
            return newDate
        })
    }

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">Failed to load appointments</p>
                        <Button onClick={() => refetch()} variant="outline">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                        <p className="text-gray-600">Manage client appointments and scheduling</p>
                    </div>
                </div>
                <Button onClick={handleCreateAppointment} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Schedule Appointment</span>
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search appointments by client name, vehicle, or service type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                            {(statusFilter || priorityFilter || selectedDate) && (
                                <Badge variant="secondary" className="ml-1">
                                    {[statusFilter, priorityFilter, selectedDate].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All statuses</option>
                                        <option value={AppointmentStatus.SCHEDULED}>Scheduled</option>
                                        <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                                        <option value={AppointmentStatus.IN_PROGRESS}>In Progress</option>
                                        <option value={AppointmentStatus.COMPLETED}>Completed</option>
                                        <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
                                        <option value={AppointmentStatus.NO_SHOW}>No Show</option>
                                    </select>
                                </div>

                                {/* Priority Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All priorities</option>
                                        <option value={AppointmentPriority.LOW}>Low</option>
                                        <option value={AppointmentPriority.NORMAL}>Normal</option>
                                        <option value={AppointmentPriority.HIGH}>High</option>
                                        <option value={AppointmentPriority.URGENT}>Urgent</option>
                                    </select>
                                </div>

                                {/* Selected Date Display */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Selected Date
                                    </label>
                                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">
                                        {selectedDate ? formatDate(selectedDate) : 'No date selected'}
                                    </div>
                                </div>

                                {/* Reset Filters */}
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={resetFilters}
                                        className="w-full"
                                        disabled={!searchTerm && !statusFilter && !priorityFilter && !selectedDate}
                                    >
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Content: Calendar (1) and List (3) Ratio */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar View - 1/4 width */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Calendar</h3>
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigateMonth('prev')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigateMonth('next')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="text-center text-sm font-medium">
                            {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                                <div key={day} className="p-1 text-center text-xs font-medium text-gray-500">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, index) => {
                                const dateStr = day.toISOString().split('T')[0]
                                const dayAppointments = appointmentsByDate[dateStr] || []
                                const isCurrentMonth = day.getMonth() === calendarMonth.getMonth()
                                const isToday = dateStr === today
                                const isSelected = dateStr === selectedDate

                                return (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedDate(isSelected ? '' : dateStr)}
                                        className={`
                      relative p-1 min-h-[32px] border rounded cursor-pointer transition-colors text-center
                      ${isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 text-gray-400'}
                      ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                      ${isSelected ? 'bg-blue-100 border-blue-500' : ''}
                    `}
                                    >
                                        <div className="text-xs font-medium">{day.getDate()}</div>
                                        {dayAppointments.length > 0 && (
                                            <div className="absolute bottom-0 right-0">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full text-[8px] text-white flex items-center justify-center">
                                                    {dayAppointments.length > 9 ? '9+' : dayAppointments.length}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment List - 3/4 width */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                                Appointments {selectedDate && `- ${formatDate(selectedDate)}`}
                            </h3>
                            <div className="text-sm text-gray-500">
                                {isLoading ? (
                                    'Loading...'
                                ) : (
                                    `${filteredAppointments.length} appointments`
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loading size="lg" />
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="text-center py-12">
                                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">
                                    {selectedDate ? 'No appointments for this date' : 'No appointments found'}
                                </p>
                                <Button onClick={handleCreateAppointment} variant="outline">
                                    Schedule First Appointment
                                </Button>
                            </div>
                        ) : (
                            <div className="max-h-[600px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date/Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vehicle
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAppointments.map((appointment) => (
                                        <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formatDate(appointment.appointmentDate)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {formatTime(appointment.appointmentTime)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {appointment.clientName} {appointment.clientSurname}
                                                        </div>
                                                        {appointment.clientPhone && (
                                                            <div className="text-sm text-gray-500">
                                                                {appointment.clientPhone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Car className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{appointment.vehicleInfo}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{appointment.serviceType || 'General Service'}</div>
                                                {appointment.priority !== AppointmentPriority.NORMAL && (
                                                    <Badge className={getPriorityBadgeColor(appointment.priority)} size="sm">
                                                        {appointment.priority}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <select
                                                    value={appointment.status}
                                                    onChange={(e) => handleStatusChange(appointment.appointmentId, e.target.value as AppointmentStatus)}
                                                    className={`
                              text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500
                              ${getStatusBadgeColor(appointment.status)}
                            `}
                                                >
                                                    <option value={AppointmentStatus.SCHEDULED}>Scheduled</option>
                                                    <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                                                    <option value={AppointmentStatus.IN_PROGRESS}>In Progress</option>
                                                    <option value={AppointmentStatus.COMPLETED}>Completed</option>
                                                    <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
                                                    <option value={AppointmentStatus.NO_SHOW}>No Show</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewAppointment(appointment.appointmentId)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditAppointment(appointment)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCancelAppointment(appointment)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            {showAppointmentForm && (
                <AppointmentForm
                    appointment={editingAppointment}
                    preSelectedDateTime={selectedDate ? `${selectedDate}T09:00` : ''}
                    onClose={() => {
                        setShowAppointmentForm(false)
                        setEditingAppointment(null)
                    }}
                    onSuccess={() => {
                        refetch()
                    }}
                />
            )}

            {viewingAppointmentId && (
                <AppointmentView
                    appointmentId={viewingAppointmentId}
                    onClose={() => setViewingAppointmentId(null)}
                    onEdit={(appointment) => {
                        setViewingAppointmentId(null)
                        handleEditAppointment(appointment)
                    }}
                />
            )}

            {/* Cancel Confirmation Modal */}
            {showDeleteModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Cancel Appointment</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to cancel the appointment for{' '}
                                <span className="font-medium">
                  {selectedAppointment.clientName} {selectedAppointment.clientSurname}
                </span>{' '}
                                on {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.appointmentTime)}?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={cancelAppointment.isPending}
                                >
                                    Keep Appointment
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmCancel}
                                    disabled={cancelAppointment.isPending}
                                >
                                    {cancelAppointment.isPending ? 'Cancelling...' : 'Cancel Appointment'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default AppointmentList