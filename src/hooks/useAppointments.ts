// src/hooks/useAppointments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    appointmentService,
    CreateAppointmentRequest,
    RescheduleAppointmentRequest,
    UpdateAppointmentRequest,
    Appointment,
    AppointmentStatus
} from '@/services/api/appointments'
import toast from 'react-hot-toast'

// Query Keys
export const appointmentKeys = {
    all: ['appointments'] as const,
    lists: () => [...appointmentKeys.all, 'list'] as const,
    list: (filters: string) => [...appointmentKeys.lists(), { filters }] as const,
    details: () => [...appointmentKeys.all, 'detail'] as const,
    detail: (id: string) => [...appointmentKeys.details(), id] as const,
    upcoming: () => [...appointmentKeys.all, 'upcoming'] as const,
    byClient: (clientId: string) => [...appointmentKeys.all, 'byClient', clientId] as const,
    byDate: (date: string) => [...appointmentKeys.all, 'byDate', date] as const,
    byDateRange: (startDate: string, endDate: string) => [...appointmentKeys.all, 'byDateRange', startDate, endDate] as const,
}

// Get all appointments
export function useAppointments(searchTerm?: string) {
    return useQuery({
        queryKey: appointmentKeys.list(searchTerm || ''),
        queryFn: () => appointmentService.getAll(),
        select: (data) => {
            if (!searchTerm) return data

            const term = searchTerm.toLowerCase()
            return data.filter(appointment =>
                appointment.clientName.toLowerCase().includes(term) ||
                appointment.clientSurname.toLowerCase().includes(term) ||
                appointment.vehicleInfo.toLowerCase().includes(term) ||
                appointment.serviceType?.toLowerCase().includes(term) ||
                appointment.description?.toLowerCase().includes(term)
            )
        }
    })
}

// Get upcoming appointments
export function useUpcomingAppointments() {
    return useQuery({
        queryKey: appointmentKeys.upcoming(),
        queryFn: () => appointmentService.getUpcoming(),
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Get appointment by ID
export function useAppointment(id: string) {
    return useQuery({
        queryKey: appointmentKeys.detail(id),
        queryFn: () => appointmentService.getById(id),
        enabled: !!id,
    })
}

// Get appointments by client
export function useAppointmentsByClient(clientId: string) {
    return useQuery({
        queryKey: appointmentKeys.byClient(clientId),
        queryFn: () => appointmentService.getByClient(clientId),
        enabled: !!clientId,
    })
}

// Get appointments by date
export function useAppointmentsByDate(date: string) {
    return useQuery({
        queryKey: appointmentKeys.byDate(date),
        queryFn: () => appointmentService.getAppointmentsByDate(date),
        enabled: !!date,
    })
}

// Get appointments by date range
export function useAppointmentsByDateRange(startDate: string, endDate: string) {
    return useQuery({
        queryKey: appointmentKeys.byDateRange(startDate, endDate),
        queryFn: () => appointmentService.getAppointmentsByDateRange(startDate, endDate),
        enabled: !!startDate && !!endDate,
    })
}

// Create appointment mutation
export function useCreateAppointment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateAppointmentRequest) => appointmentService.create(data),
        onSuccess: (newAppointment) => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
            toast.success(`Appointment scheduled for ${newAppointment.clientName} ${newAppointment.clientSurname}!`)
        },
        onError: (error: any) => {
            toast.error(`Failed to create appointment: ${error.message || 'Unknown error'}`)
        },
    })
}

// Reschedule appointment mutation
export function useRescheduleAppointment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: RescheduleAppointmentRequest }) =>
            appointmentService.reschedule(id, data),
        onSuccess: (updatedAppointment, variables) => {
            // Update the specific appointment in cache
            queryClient.setQueryData(
                appointmentKeys.detail(variables.id),
                updatedAppointment
            )
            // Invalidate lists to refresh them
            queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() })
            toast.success(`Appointment rescheduled successfully!`)
        },
        onError: (error: any) => {
            toast.error(`Failed to reschedule appointment: ${error.message || 'Unknown error'}`)
        },
    })
}

// Update appointment status mutation
export function useUpdateAppointmentStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
            appointmentService.updateStatus(id, status),
        onSuccess: (updatedAppointment, variables) => {
            // Update the specific appointment in cache
            queryClient.setQueryData(
                appointmentKeys.detail(variables.id),
                updatedAppointment
            )
            // Invalidate lists to refresh them
            queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() })
            toast.success(`Appointment status updated to ${variables.status.toLowerCase()}!`)
        },
        onError: (error: any) => {
            toast.error(`Failed to update appointment status: ${error.message || 'Unknown error'}`)
        },
    })
}

// Cancel appointment mutation
export function useCancelAppointment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => appointmentService.cancel(id),
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: appointmentKeys.detail(deletedId) })
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() })
            toast.success('Appointment cancelled successfully!')
        },
        onError: (error: any) => {
            toast.error(`Failed to cancel appointment: ${error.message || 'Unknown error'}`)
        },
    })
}