import { ApiService } from './base'
import { JobCard } from '@/types'

export interface CreateJobCardRequest {
    jobCardName: string
    vehicleId: string
    clientId: string
    serviceAdvisorId: string
    supervisorId: string
    estimatedTimeOfCompletion: string
    priority: boolean
    jobCardDeadline: string
}

export interface UpdateJobCardRequest extends Partial<CreateJobCardRequest> {
    dateAndTimeFrozen?: string
    dateAndTimeClosed?: string
    stateChecklistId?: string
    serviceChecklistId?: string
    controlChecklistId?: string
}

export interface JobCardFilters {
    status?: string
    priority?: boolean
    clientId?: string
    vehicleId?: string
    serviceAdvisorId?: string
    supervisorId?: string
    dateFrom?: string
    dateTo?: string
}

export class JobCardService extends ApiService {
    constructor() {
        super('/jobCards')
    }

    async getAll(filters?: JobCardFilters): Promise<JobCard[]> {
        const params = new URLSearchParams()
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString())
                }
            })
        }
        const queryString = params.toString()
        return this.get<JobCard[]>(`/all${queryString ? `?${queryString}` : ''}`)
    }

    async getById(id: string): Promise<JobCard> {
        return this.get<JobCard>(`/get/${id}`)
    }

    async create(jobCard: CreateJobCardRequest): Promise<JobCard> {
        return this.post<JobCard>('/new', jobCard)
    }

    async update(id: string, jobCard: UpdateJobCardRequest): Promise<JobCard> {
        return this.put<JobCard>(`/update/${id}`, jobCard)
    }

    async delete(id: string): Promise<string> {
        return super.delete<string>(`/delete/${id}`)
    }

    async getByClient(clientId: string): Promise<JobCard[]> {
        return this.get<JobCard[]>(`/client/${clientId}`)
    }

    async getByVehicle(vehicleId: string): Promise<JobCard[]> {
        return this.get<JobCard[]>(`/vehicle/${vehicleId}`)
    }

    async getByEmployee(employeeId: string): Promise<JobCard[]> {
        return this.get<JobCard[]>(`/employee/${employeeId}`)
    }

    async updateStatus(id: string, status: string): Promise<JobCard> {
        return this.put<JobCard>(`/status/${id}`, { status })
    }

    async freeze(id: string, reason?: string): Promise<JobCard> {
        return this.put<JobCard>(`/freeze/${id}`, { reason })
    }

    async unfreeze(id: string): Promise<JobCard> {
        return this.put<JobCard>(`/unfreeze/${id}`)
    }

    async close(id: string, notes?: string): Promise<JobCard> {
        return this.put<JobCard>(`/close/${id}`, { notes })
    }

    async setPriority(id: string, priority: boolean): Promise<JobCard> {
        return this.put<JobCard>(`/priority/${id}`, { priority })
    }
}

export const jobCardService = new JobCardService()