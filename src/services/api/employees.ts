import { ApiService } from './base'
import { Employee } from '@/types'

export interface CreateEmployeeRequest {
    employeeName: string
    employeeSurname: string
    email: string
    phoneNumber: string
    employeeRole: string
    rating?: number
    employeeDepartment?: string
    homeAddress?: string
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

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

    async update(id: string, employee: UpdateEmployeeRequest): Promise<Employee> {
        return this.put<Employee>(`/update/${id}`, employee)
    }

    async delete(id: string): Promise<{ message: string }> {
        return super.delete<{ message: string }>(`/delete/${id}`)
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