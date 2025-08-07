// src/services/api/timesheets.ts
import { ApiService } from './base'
import { Timesheet } from '@/types'

export interface CreateTimesheetRequest {
    jobCardId: string
    employeeId: string
    clockInDateAndTime: string
    clockOutDateAndTime: string
    sheetTitle: string
    report: string
}

export interface UpdateTimesheetRequest extends Partial<CreateTimesheetRequest> {}

export class TimesheetService extends ApiService {
    constructor() {
        super('/timesheets')
    }

    async getAll(): Promise<Timesheet[]> {
        return this.get<Timesheet[]>('/all')
    }

    async getById(id: string): Promise<Timesheet> {
        return this.get<Timesheet>(`/get/${id}`)
    }

    async getByJobCard(jobCardId: string): Promise<Timesheet[]> {
        const timesheets = await this.get<Timesheet[]>(`/jobCard/${jobCardId}`)

        // Calculate hours worked for each timesheet
        return timesheets.map(timesheet => ({
            ...timesheet,
            hoursWorked: this.calculateHoursWorked(
                timesheet.clockInDateAndTime,
                timesheet.clockOutDateAndTime
            )
        }))
    }

    async create(timesheet: CreateTimesheetRequest): Promise<Timesheet> {
        return this.post<Timesheet>('/add', timesheet)
    }

    async update(id: string, timesheet: UpdateTimesheetRequest): Promise<Timesheet> {
        return this.put<Timesheet>(`/update/${id}`, timesheet)
    }

    async delete(id: string): Promise<string> {
        return super.delete<string>(`/delete/${id}`)
    }

    // Helper method to calculate hours worked
    private calculateHoursWorked(clockIn: string, clockOut: string): number {
        const clockInTime = new Date(clockIn)
        const clockOutTime = new Date(clockOut)

        if (isNaN(clockInTime.getTime()) || isNaN(clockOutTime.getTime())) {
            return 0
        }

        const diffMs = clockOutTime.getTime() - clockInTime.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)

        return Math.round(diffHours * 100) / 100 // Round to 2 decimal places
    }
}

export const timesheetService = new TimesheetService()