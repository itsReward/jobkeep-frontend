// src/services/api/jobCardTechnicians.ts
import { ApiService } from './base'

export class JobCardTechniciansService extends ApiService {
    constructor() {
        super('/job-card-technicians')
    }

    async getAllJobCardTechnicians(jobCardId: string): Promise<string[]> {
        return this.get<string[]>(`/getAllJobCardTechnicians/${jobCardId}`)
    }

    async assignTechnician(jobCardId: string, employeeId: string): Promise<void> {
        console.log('Sending technician assignment:', { jobCardId, technicianId: employeeId })
        // Validate that we have both IDs
        if (!jobCardId || !employeeId) {
            console.error('Missing jobCardId or technicianId for assignment:', { jobCardId, technicianId: employeeId })
            throw new Error('Missing jobCardId or technicianId for assignment')
        }
        return this.post<void>('/add-technician', { jobCardId, technicianId: employeeId })
    }

    async removeTechnician(jobCardId: string, technicianId: string): Promise<void> {
        // Assuming there's an endpoint to remove technicians
        return this.delete<void>(`/remove/${jobCardId}/${technicianId}`)
    }
}

export const jobCardTechniciansService = new JobCardTechniciansService()