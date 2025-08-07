// src/services/api/jobCardTechnicians.ts
import { ApiService } from './base'

export class JobCardTechniciansService extends ApiService {
    constructor() {
        super('/job-card-technicians')
    }

    async getAllJobCardTechnicians(jobCardId: string): Promise<string[]> {
        return this.get<string[]>(`/getAllJobCardTechnicians/${jobCardId}`)
    }

    async assignTechnician(jobCardId: string, technicianId: string): Promise<void> {
        // Assuming there's an endpoint to assign technicians
        return this.post<void>('/assign', { jobCardId, technicianId })
    }

    async removeTechnician(jobCardId: string, technicianId: string): Promise<void> {
        // Assuming there's an endpoint to remove technicians
        return this.delete<void>(`/remove/${jobCardId}/${technicianId}`)
    }
}

export const jobCardTechniciansService = new JobCardTechniciansService()