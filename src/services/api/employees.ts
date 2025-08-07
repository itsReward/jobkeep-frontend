// src/services/api/employees.ts
import { ApiService } from './base'
import { Employee } from '@/types'

export interface CreateEmployeeRequest {
    employeeName: string
    employeeSurname: string
    email: string
    phone: string
    position: string
}

export class EmployeeService extends ApiService {
    constructor() {
        super('/employees')
    }

    async getAll(): Promise<Employee[]> {
        return this.get<Employee[]>('/all')
    }

    async getById(id: string): Promise<Employee> {
        return this.get<Employee>(`/get/${id}`)
    }

    async create(employee: CreateEmployeeRequest): Promise<Employee> {
        return this.post<Employee>('/new', employee)
    }

    async update(id: string, employee: Partial<CreateEmployeeRequest>): Promise<Employee> {
        return this.put<Employee>(`/update/${id}`, employee)
    }

    async delete(id: string): Promise<string> {
        return super.delete<string>(`/delete/${id}`)
    }

    // Helper method to get multiple employees by IDs
    async getMultipleByIds(ids: string[]): Promise<Employee[]> {
        const employees = await Promise.all(
            ids.map(id => this.getById(id).catch(() => null))
        )

        // Filter out null values (failed requests)
        return employees.filter(emp => emp !== null) as Employee[]
    }
}

export const employeeService = new EmployeeService()