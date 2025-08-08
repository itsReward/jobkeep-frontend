// src/components/appointments/AppointmentView.tsx
import React from 'react'
import { Card, CardContent, CardHeader, Button, Badge, Loading } from '@/components/ui'
import { Appointment, AppointmentStatus, AppointmentPriority } from '@/services/api/appointments'
import { useAppointment } from '@/hooks/useAppointments'
import {
    X,
    Edit,
    Calendar,
    Clock,
    User,
    Car,
    FileText,
    AlertCircle,
    MapPin,
    Phone,
    Mail,
    Tag,
    MessageSquare
} from 'lucide-react'
import { formatDate } from '@/utils/date'

interface AppointmentViewProps {
    appointmentId: string
    onClose: () => void
    onEdit: (appointment: Appointment) => void
}

export const AppointmentView: React.FC<AppointmentViewProps> = ({
                                                                    appointmentId,
                                                                    onClose,
                                                                    onEdit
                                                                }) => {
    const { data: appointment, isLoading, error } = useAppointment(appointmentId)

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

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const getEndTime = (startTime: string, durationMinutes: number) => {
        const [hours, minutes] = startTime.split(':').map(Number)
        const startDate = new Date()
        startDate.setHours(hours, minutes, 0, 0)

        const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
        const endHours = endDate.getHours()
        const endMinutes = endDate.getMinutes()

        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
        return formatTime(endTime)
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-4xl">
                    <CardContent className="flex items-center justify-center p-8">
                        <Loading size="lg" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !appointment) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-4xl">
                    <CardContent className="text-center p-8">
                        <p className="text-red-600">Failed to load appointment details</p>
                        <Button onClick={onClose} className="mt-4">Close</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Appointment Details
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {appointment.clientName} {appointment.clientSurname} - {formatDate(appointment.appointmentDate)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(appointment)}
                                className="flex items-center space-x-1"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Reschedule</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="overflow-y-auto">
                    <div className="space-y-6">
                        {/* Status and Priority */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Status</p>
                                    <Badge className={getStatusBadgeColor(appointment.status)}>
                                        {appointment.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Priority</p>
                                    <Badge className={getPriorityBadgeColor(appointment.priority)}>
                                        {appointment.priority}
                                    </Badge>
                                </div>
                                {appointment.reminderSent && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Reminder</p>
                                        <Badge className="bg-green-100 text-green-800">
                                            Sent
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Appointment Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Date</p>
                                            <p className="text-sm text-gray-600">{formatDate(appointment.appointmentDate)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Time</p>
                                            <p className="text-sm text-gray-600">
                                                {formatTime(appointment.appointmentTime)} - {getEndTime(appointment.appointmentTime, appointment.durationMinutes)}
                                            </p>
                                            <p className="text-xs text-gray-500">Duration: {appointment.durationMinutes} minutes</p>
                                        </div>
                                    </div>

                                    {appointment.serviceType && (
                                        <div className="flex items-center space-x-3">
                                            <Tag className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Service Type</p>
                                                <p className="text-sm text-gray-600">{appointment.serviceType}</p>
                                            </div>
                                        </div>
                                    )}

                                    {appointment.assignedTechnicianName && (
                                        <div className="flex items-center space-x-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Assigned Technician</p>
                                                <p className="text-sm text-gray-600">{appointment.assignedTechnicianName}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Client Information */}
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Client Name</p>
                                            <p className="text-sm text-gray-600">{appointment.clientName} {appointment.clientSurname}</p>
                                        </div>
                                    </div>

                                    {appointment.clientPhone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Phone</p>
                                                <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3">
                                        <Car className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Vehicle</p>
                                            <p className="text-sm text-gray-600">{appointment.vehicleInfo}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Description */}
                        {appointment.description && (
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <h3 className="text-lg font-medium text-gray-900">Description</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-start space-x-3">
                                        <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <p className="text-sm text-gray-600 leading-relaxed">{appointment.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        {appointment.notes && (
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-start space-x-3">
                                        <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <p className="text-sm text-gray-600 leading-relaxed">{appointment.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Created Information */}
                        <Card className="border border-gray-200 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div>
                                        <p className="font-medium">Appointment ID</p>
                                        <p className="font-mono text-xs">{appointment.appointmentId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">Created</p>
                                        <p>{formatDate(appointment.createdAt.split('T')[0])} at {formatTime(appointment.createdAt.split('T')[1])}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}