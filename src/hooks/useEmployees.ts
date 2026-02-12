// src/hooks/useEmployees.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeService, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/services/api/employees'
import { Employee } from '@/types'
import toast from 'react-hot-toast'

// Query Keys
export const employeeKeys = {
    all: ['employees'] as const,
    lists: () => [...employeeKeys.all, 'list'] as const,
    list: (filters: string) => [...employeeKeys.lists(), { filters }] as const,
    details: () => [...employeeKeys.all, 'detail'] as const,
    detail: (id: string) => [...employeeKeys.details(), id] as const,
}

// Get all employees
export function useEmployees(searchTerm?: string) {
    return useQuery({
        queryKey: employeeKeys.list(searchTerm || ''),
        queryFn: () => employeeService.getAll(),
        select: (data) => {
            if (!searchTerm) return data

            const term = searchTerm.toLowerCase()
            return data.filter(employee =>
                employee.employeeName.toLowerCase().includes(term) ||
                employee.employeeSurname.toLowerCase().includes(term) ||
                employee.email.toLowerCase().includes(term) ||
                employee.phoneNumber.includes(term) ||
                employee.employeeRole.toLowerCase().includes(term) ||
                (employee.employeeDepartment && employee.employeeDepartment.toLowerCase().includes(term))
            )
        }
    })
}

// Get employee by ID
export function useEmployee(id: string) {
    return useQuery({
        queryKey: employeeKeys.detail(id),
        queryFn: () => employeeService.getById(id),
        enabled: !!id,
    })
}

// Create employee mutation
export function useCreateEmployee() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateEmployeeRequest) => employeeService.create(data),
        onSuccess: (newEmployee) => {
            // Invalidate and refetch employees list
            queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
            toast.success(`Employee "${newEmployee.employeeName} ${newEmployee.employeeSurname}" created successfully!`)
        },
        onError: (error: any) => {
            console.error('Create employee error:', error)
            let message = 'Failed to create employee'

            if (error?.response?.data?.message) {
                message = error.response.data.message
            } else if (error?.message) {
                message = error.message
            }

            toast.error(message)
        }
    })
}

// Update employee mutation
export function useUpdateEmployee() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
            employeeService.update(id, data),
        onSuccess: (updatedEmployee) => {
            // Invalidate and refetch relevant queries
            queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
            queryClient.invalidateQueries({ queryKey: employeeKeys.detail(updatedEmployee.employeeId) })
            toast.success(`Employee "${updatedEmployee.employeeName} ${updatedEmployee.employeeSurname}" updated successfully!`)
        },
        onError: (error: any) => {
            console.error('Update employee error:', error)
            let message = 'Failed to update employee'

            if (error?.response?.data?.message) {
                message = error.response.data.message
            } else if (error?.message) {
                message = error.message
            }

            toast.error(message)
        }
    })
}

// Delete employee mutation
export function useDeleteEmployee() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => employeeService.delete(id),
        onSuccess: () => {
            // Invalidate and refetch employees list
            queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
            toast.success('Employee deleted successfully!')
        },
        onError: (error: any) => {
            console.error('Delete employee error:', error)
            let message = 'Failed to delete employee'

            if (error?.response?.data?.message) {
                message = error.response.data.message
            } else if (error?.message) {
                message = error.message
            }

            toast.error(message)
        }
    })
}