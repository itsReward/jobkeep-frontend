// src/hooks/useTimesheets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timesheetService, CreateTimesheetRequest, UpdateTimesheetRequest } from '@/services/api/timesheets'
import { jobCardTechniciansService } from '@/services/api/jobCardTechnicians'
import { employeeService } from '@/services/api/employees'
import { JobCardTechnician } from '@/types'
import toast from 'react-hot-toast'

// Query keys
export const timesheetKeys = {
    all: ['timesheets'] as const,
    lists: () => [...timesheetKeys.all, 'list'] as const,
    details: () => [...timesheetKeys.all, 'detail'] as const,
    detail: (id: string) => [...timesheetKeys.details(), id] as const,
    byJobCard: (jobCardId: string) => [...timesheetKeys.all, 'jobCard', jobCardId] as const,
}

export const technicianKeys = {
    all: ['technicians'] as const,
    byJobCard: (jobCardId: string) => [...technicianKeys.all, 'jobCard', jobCardId] as const,
}

// Get timesheets by job card ID
export const useTimesheetsByJobCard = (jobCardId: string) => {
    return useQuery({
        queryKey: timesheetKeys.byJobCard(jobCardId),
        queryFn: () => timesheetService.getByJobCard(jobCardId),
        enabled: !!jobCardId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Get single timesheet by ID
export const useTimesheet = (id: string) => {
    return useQuery({
        queryKey: timesheetKeys.detail(id),
        queryFn: () => timesheetService.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

// Get job card technicians
export const useJobCardTechnicians = (jobCardId: string) => {
    return useQuery({
        queryKey: technicianKeys.byJobCard(jobCardId),
        queryFn: async (): Promise<JobCardTechnician[]> => {
            // First, get the list of technician IDs
            const technicianIds = await jobCardTechniciansService.getAllJobCardTechnicians(jobCardId)

            if (technicianIds.length === 0) {
                return []
            }

            // Then, fetch employee details for each technician ID
            const employees = await employeeService.getMultipleByIds(technicianIds)

            // Map to JobCardTechnician format
            return employees.map(emp => ({
                employeeId: emp.id,
                employeeName: emp.employeeName,
                employeeSurname: emp.employeeSurname
            }))
        },
        enabled: !!jobCardId,
        staleTime: 5 * 60 * 1000,
    })
}

// Create timesheet mutation
export const useCreateTimesheet = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (timesheet: CreateTimesheetRequest) => timesheetService.create(timesheet),
        onSuccess: (newTimesheet) => {
            // Invalidate timesheets for the job card
            queryClient.invalidateQueries({
                queryKey: timesheetKeys.byJobCard(newTimesheet.jobCardId)
            })

            toast.success('Timesheet created successfully!', {
                icon: '⏰',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create timesheet', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Update timesheet mutation
export const useUpdateTimesheet = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, timesheet }: { id: string; timesheet: UpdateTimesheetRequest }) =>
            timesheetService.update(id, timesheet),
        onSuccess: (updatedTimesheet) => {
            // Update timesheet in cache
            queryClient.setQueryData(timesheetKeys.detail(updatedTimesheet.id), updatedTimesheet)

            // Invalidate timesheets for the job card
            queryClient.invalidateQueries({
                queryKey: timesheetKeys.byJobCard(updatedTimesheet.jobCardId)
            })

            toast.success('Timesheet updated successfully!', {
                icon: '✏️',
                style: {
                    borderRadius: '16px',
                    background: '#E3F2FD',
                    color: '#1976D2',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update timesheet', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Delete timesheet mutation
export const useDeleteTimesheet = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => timesheetService.delete(id),
        onSuccess: (_, id) => {
            // Remove timesheet from cache
            queryClient.removeQueries({ queryKey: timesheetKeys.detail(id) })

            // Invalidate all timesheet lists
            queryClient.invalidateQueries({ queryKey: timesheetKeys.lists() })

            toast.success('Timesheet deleted successfully!', {
                icon: '🗑️',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete timesheet', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Assign technician mutation
export const useAssignTechnician = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ jobCardId, technicianId }: { jobCardId: string; technicianId: string }) =>
            jobCardTechniciansService.assignTechnician(jobCardId, technicianId),
        onSuccess: (_, { jobCardId }) => {
            // Invalidate technicians for the job card
            queryClient.invalidateQueries({
                queryKey: technicianKeys.byJobCard(jobCardId)
            })

            toast.success('Technician assigned successfully!', {
                icon: '👨‍🔧',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to assign technician', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Remove technician mutation
export const useRemoveTechnician = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ jobCardId, technicianId }: { jobCardId: string; technicianId: string }) =>
            jobCardTechniciansService.removeTechnician(jobCardId, technicianId),
        onSuccess: (_, { jobCardId }) => {
            // Invalidate technicians for the job card
            queryClient.invalidateQueries({
                queryKey: technicianKeys.byJobCard(jobCardId)
            })

            toast.success('Technician removed successfully!', {
                icon: '👋',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to remove technician', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}