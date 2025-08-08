// src/components/forms/AppointmentForm.tsx
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Card, CardContent, CardHeader, Button, Input, Loading } from '@/components/ui'
import { CreateAppointmentRequest, Appointment, AppointmentPriority } from '@/services/api/appointments'
import { useCreateAppointment, useRescheduleAppointment } from '@/hooks/useAppointments'
import { useClients } from '@/hooks/useClients'
import { useVehicles } from '@/hooks/useVehicles'
import { X } from 'lucide-react'

interface AppointmentFormProps {
    appointment?: Appointment | null
    preSelectedClientId?: string
    preSelectedVehicleId?: string
    preSelectedDateTime?: string
    onClose: () => void
    onSuccess?: () => void
}

const PRIORITY_OPTIONS = [
    { value: AppointmentPriority.LOW, label: 'Low', color: 'text-gray-600' },
    { value: AppointmentPriority.NORMAL, label: 'Normal', color: 'text-blue-600' },
    { value: AppointmentPriority.HIGH, label: 'High', color: 'text-orange-600' },
    { value: AppointmentPriority.URGENT, label: 'Urgent', color: 'text-red-600' }
]

const DURATION_OPTIONS = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' }
]

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
                                                                    appointment,
                                                                    preSelectedClientId,
                                                                    preSelectedVehicleId,
                                                                    preSelectedDateTime,
                                                                    onClose,
                                                                    onSuccess
                                                                }) => {
    const isEditing = !!appointment
    const createAppointment = useCreateAppointment()
    const rescheduleAppointment = useRescheduleAppointment()
    const { data: clients, isLoading: clientsLoading } = useClients()
    const { data: allVehicles, isLoading: vehiclesLoading } = useVehicles()

    const [selectedClientId, setSelectedClientId] = useState<string>(preSelectedClientId || '')
    const [filteredVehicles, setFilteredVehicles] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [selectedTime, setSelectedTime] = useState<string>('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        control,
        watch
    } = useForm<CreateAppointmentRequest>({
        defaultValues: {
            clientId: preSelectedClientId || '',
            vehicleId: preSelectedVehicleId || '',
            appointmentDateTime: preSelectedDateTime || '',
            durationMinutes: 60,
            serviceType: '',
            description: '',
            priority: AppointmentPriority.NORMAL,
            assignedTechnicianId: '',
            notes: ''
        }
    })

    const watchedClientId = watch('clientId')

    // Initialize date and time from preSelectedDateTime or appointment
    useEffect(() => {
        let dateTime = ''

        if (appointment) {
            dateTime = `${appointment.appointmentDate}T${appointment.appointmentTime}`
        } else if (preSelectedDateTime) {
            dateTime = preSelectedDateTime
        }

        if (dateTime) {
            const [date, time] = dateTime.split('T')
            setSelectedDate(date)
            setSelectedTime(time?.substring(0, 5) || '')
            setValue('appointmentDateTime', dateTime)
        }
    }, [appointment, preSelectedDateTime, setValue])

    // Update combined datetime whenever date or time changes
    useEffect(() => {
        if (selectedDate && selectedTime) {
            const combinedDateTime = `${selectedDate}T${selectedTime}:00`
            setValue('appointmentDateTime', combinedDateTime)
        }
    }, [selectedDate, selectedTime, setValue])

    // Filter vehicles based on selected client
    useEffect(() => {
        if (watchedClientId && allVehicles) {
            const clientVehicles = allVehicles.filter(vehicle => vehicle.clientId === watchedClientId)
            setFilteredVehicles(clientVehicles)

            // Clear vehicle selection if client changed
            if (selectedClientId !== watchedClientId) {
                setValue('vehicleId', '')
            }
            setSelectedClientId(watchedClientId)
        } else {
            setFilteredVehicles([])
        }
    }, [watchedClientId, allVehicles, selectedClientId, setValue])

    // Set form values when editing
    useEffect(() => {
        if (appointment) {
            setValue('durationMinutes', appointment.durationMinutes)
            setValue('serviceType', appointment.serviceType || '')
            setValue('description', appointment.description || '')
            setValue('priority', appointment.priority)
            setValue('notes', appointment.notes || '')
        }
    }, [appointment, setValue])

    const onSubmit = async (data: CreateAppointmentRequest) => {
        try {
            if (isEditing && appointment) {
                await rescheduleAppointment.mutateAsync({
                    id: appointment.appointmentId,
                    data: {
                        appointmentDateTime: data.appointmentDateTime,
                        notes: data.notes
                    }
                })
            } else {
                await createAppointment.mutateAsync(data)
            }
            reset()
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    const isLoading = createAppointment.isPending || rescheduleAppointment.isPending

    // Generate time options between 08:00 and 16:00
    const generateTimeOptions = () => {
        const options = []
        for (let hour = 8; hour <= 16; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                options.push(timeString)
            }
        }
        return options
    }

    const timeOptions = generateTimeOptions()

    const getMinDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    const handleDateChange = (date: string) => {
        setSelectedDate(date)
    }

    const handleTimeChange = (time: string) => {
        setSelectedTime(time)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditing ? 'Reschedule Appointment' : 'Schedule New Appointment'}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Client Selection */}
                        {!isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client *
                                </label>
                                {clientsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loading size="sm" />
                                        <span className="ml-2 text-sm text-gray-500">Loading clients...</span>
                                    </div>
                                ) : (
                                    <Controller
                                        name="clientId"
                                        control={control}
                                        rules={{ required: 'Client is required' }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                disabled={isLoading}
                                            >
                                                <option value="">Select client</option>
                                                {clients?.map((client) => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.clientName} {client.clientSurname}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                )}
                                {errors.clientId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
                                )}
                            </div>
                        )}

                        {/* Vehicle Selection */}
                        {!isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vehicle *
                                </label>
                                <Controller
                                    name="vehicleId"
                                    control={control}
                                    rules={{ required: 'Vehicle is required' }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            disabled={isLoading || !selectedClientId}
                                        >
                                            <option value="">
                                                {selectedClientId ? 'Select vehicle' : 'Select client first'}
                                            </option>
                                            {filteredVehicles?.map((vehicle) => (
                                                <option key={vehicle.id} value={vehicle.id}>
                                                    {vehicle.make} {vehicle.model} ({vehicle.regNumber})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.vehicleId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.vehicleId.message}</p>
                                )}
                            </div>
                        )}

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    min={getMinDate()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    disabled={isLoading}
                                    required
                                />
                                {!selectedDate && (
                                    <p className="mt-1 text-sm text-red-600">Date is required</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time *
                                </label>
                                <select
                                    value={selectedTime}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    disabled={isLoading}
                                    required
                                >
                                    <option value="">Select time</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                                {!selectedTime && (
                                    <p className="mt-1 text-sm text-red-600">Time is required</p>
                                )}
                            </div>
                        </div>

                        {/* Hidden field for combined datetime */}
                        <input
                            type="hidden"
                            {...register('appointmentDateTime', {
                                required: 'Date and time are required'
                            })}
                        />

                        {/* Duration and Priority */}
                        {!isEditing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration *
                                    </label>
                                    <Controller
                                        name="durationMinutes"
                                        control={control}
                                        rules={{ required: 'Duration is required' }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                disabled={isLoading}
                                            >
                                                {DURATION_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <Controller
                                        name="priority"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                disabled={isLoading}
                                            >
                                                {PRIORITY_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Service Type */}
                        {!isEditing && (
                            <Input
                                label="Service Type"
                                placeholder="e.g., Oil Change, Brake Service, General Maintenance"
                                {...register('serviceType')}
                                disabled={isLoading}
                            />
                        )}

                        {/* Description */}
                        {!isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    {...register('description')}
                                    placeholder="Describe the service or any specific requirements"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {isEditing ? 'Reschedule Notes' : 'Additional Notes'}
                            </label>
                            <textarea
                                {...register('notes')}
                                placeholder={isEditing ? 'Reason for rescheduling...' : 'Any additional notes or special instructions'}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Debug info (remove in production) */}
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            Selected Date: {selectedDate || 'None'} | Selected Time: {selectedTime || 'None'} | Combined: {selectedDate && selectedTime ? `${selectedDate}T${selectedTime}:00` : 'None'}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !selectedDate || !selectedTime}
                                className="min-w-[120px]"
                            >
                                {isLoading ? 'Saving...' : isEditing ? 'Reschedule' : 'Schedule Appointment'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}