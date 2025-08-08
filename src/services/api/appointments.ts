// src/services/api/appointments.ts
import { ApiService } from './base'

export interface Appointment {
    appointmentId: string
    clientName: string
    clientSurname: string
    clientPhone?: string
    vehicleInfo: string
    appointmentDate: string
    appointmentTime: string
    durationMinutes: number
    serviceType?: string
    description?: string
    status: AppointmentStatus
    priority: AppointmentPriority
    assignedTechnicianName?: string
    reminderSent: boolean
    notes?: string
    createdAt: string
}

export interface CreateAppointmentRequest {
    clientId: string
    vehicleId: string
    appointmentDateTime: string // Combined date and time
    durationMinutes: number
    serviceType?: string
    description?: string
    priority: AppointmentPriority
    assignedTechnicianId?: string
    notes?: string
}

export interface RescheduleAppointmentRequest {
    appointmentDateTime: string // Combined date and time
    notes?: string
}

export interface UpdateAppointmentRequest {
    clientId?: string
    vehicleId?: string
    appointmentDateTime?: string
    durationMinutes?: number
    serviceType?: string
    description?: string
    priority?: AppointmentPriority
    assignedTechnicianId?: string
    notes?: string
}

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW'
}

export enum AppointmentPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export class AppointmentService extends ApiService {
    constructor() {
        super('/appointments')
    }

    async getAll(): Promise<Appointment[]> {
        return this.get<Appointment[]>('/all')
    }

    async getUpcoming(): Promise<Appointment[]> {
        return this.get<Appointment[]>('/upcoming')
    }

    async getById(id: string): Promise<Appointment> {
        return this.get<Appointment>(`/${id}`)
    }

    async create(appointment: CreateAppointmentRequest): Promise<Appointment> {
        // Split combined datetime back to separate date and time for API
        const dateTime = new Date(appointment.appointmentDateTime)
        const appointmentDate = dateTime.toISOString().split('T')[0]
        const appointmentTime = dateTime.toTimeString().split(' ')[0].substring(0, 5)

        const apiRequest = {
            clientId: appointment.clientId,
            vehicleId: appointment.vehicleId,
            appointmentDate,
            appointmentTime,
            durationMinutes: appointment.durationMinutes,
            serviceType: appointment.serviceType,
            description: appointment.description,
            priority: appointment.priority,
            assignedTechnicianId: appointment.assignedTechnicianId,
            notes: appointment.notes
        }

        return this.post<Appointment>('/new', apiRequest)
    }

    async reschedule(id: string, reschedule: RescheduleAppointmentRequest): Promise<Appointment> {
        // Split combined datetime back to separate date and time for API
        const dateTime = new Date(reschedule.appointmentDateTime)
        const appointmentDate = dateTime.toISOString().split('T')[0]
        const appointmentTime = dateTime.toTimeString().split(' ')[0].substring(0, 5)

        const apiRequest = {
            appointmentDate,
            appointmentTime,
            notes: reschedule.notes
        }

        return this.put<Appointment>(`/reschedule/${id}`, apiRequest)
    }

    async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
        return this.put<Appointment>(`/${id}/status?status=${status}`)
    }

    async cancel(id: string): Promise<string> {
        return this.delete<string>(`/cancel/${id}`)
    }

    async getByClient(clientId: string): Promise<Appointment[]> {
        return this.get<Appointment[]>(`/client/${clientId}`)
    }

    // Helper methods for frontend
    async searchAppointments(searchTerm: string): Promise<Appointment[]> {
        const appointments = await this.getAll()
        const term = searchTerm.toLowerCase()

        return appointments.filter(appointment =>
            appointment.clientName.toLowerCase().includes(term) ||
            appointment.clientSurname.toLowerCase().includes(term) ||
            appointment.vehicleInfo.toLowerCase().includes(term) ||
            appointment.serviceType?.toLowerCase().includes(term) ||
            appointment.description?.toLowerCase().includes(term)
        )
    }

    async getAppointmentsByDate(date: string): Promise<Appointment[]> {
        const appointments = await this.getAll()
        return appointments.filter(appointment =>
            appointment.appointmentDate === date
        )
    }

    async getAppointmentsByStatus(status: AppointmentStatus): Promise<Appointment[]> {
        const appointments = await this.getAll()
        return appointments.filter(appointment => appointment.status === status)
    }

    async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
        const appointments = await this.getAll()
        return appointments.filter(appointment => {
            const appointmentDate = appointment.appointmentDate
            return appointmentDate >= startDate && appointmentDate <= endDate
        })
    }

    // Convert API response to combined datetime for frontend
    getCombinedDateTime(appointment: Appointment): string {
        return `${appointment.appointmentDate}T${appointment.appointmentTime}`
    }
}

export const appointmentService = new AppointmentService()