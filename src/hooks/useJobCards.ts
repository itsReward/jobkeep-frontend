import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobCardService, CreateJobCardRequest, UpdateJobCardRequest, JobCardFilters } from '@/services/api/jobCards'
import toast from 'react-hot-toast'

// Query keys
export const jobCardKeys = {
    all: ['jobCards'] as const,
    lists: () => [...jobCardKeys.all, 'list'] as const,
    list: (filters?: JobCardFilters) => [...jobCardKeys.lists(), filters] as const,
    details: () => [...jobCardKeys.all, 'detail'] as const,
    detail: (id: string) => [...jobCardKeys.details(), id] as const,
    byClient: (clientId: string) => [...jobCardKeys.all, 'client', clientId] as const,
    byVehicle: (vehicleId: string) => [...jobCardKeys.all, 'vehicle', vehicleId] as const,
    byEmployee: (employeeId: string) => [...jobCardKeys.all, 'employee', employeeId] as const,
}

// Get all job cards with optional filters
export const useJobCards = (filters?: JobCardFilters) => {
    return useQuery({
        queryKey: jobCardKeys.list(filters),
        queryFn: () => jobCardService.getAll(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })
}

// Get single job card by ID
export const useJobCard = (id: string) => {
    return useQuery({
        queryKey: jobCardKeys.detail(id),
        queryFn: () => jobCardService.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

// Get job cards by client
export const useJobCardsByClient = (clientId: string) => {
    return useQuery({
        queryKey: jobCardKeys.byClient(clientId),
        queryFn: () => jobCardService.getByClient(clientId),
        enabled: !!clientId,
        staleTime: 5 * 60 * 1000,
    })
}

// Get job cards by vehicle
export const useJobCardsByVehicle = (vehicleId: string) => {
    return useQuery({
        queryKey: jobCardKeys.byVehicle(vehicleId),
        queryFn: () => jobCardService.getByVehicle(vehicleId),
        enabled: !!vehicleId,
        staleTime: 5 * 60 * 1000,
    })
}

// Get job cards by employee
export const useJobCardsByEmployee = (employeeId: string) => {
    return useQuery({
        queryKey: jobCardKeys.byEmployee(employeeId),
        queryFn: () => jobCardService.getByEmployee(employeeId),
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000,
    })
}

// Create job card mutation
export const useCreateJobCard = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (jobCard: CreateJobCardRequest) => jobCardService.create(jobCard),
        onSuccess: (newJobCard) => {
            // Invalidate and refetch job cards list
            queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() })

            // Add the new job card to cache
            queryClient.setQueryData(jobCardKeys.detail(newJobCard.id), newJobCard)

            toast.success('Job card created successfully!', {
                icon: '✅',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create job card', {
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

// Update job card mutation
export const useUpdateJobCard = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, jobCard }: { id: string; jobCard: UpdateJobCardRequest }) =>
            jobCardService.update(id, jobCard),
        onSuccess: (updatedJobCard, { id }) => {
            // Update the job card in cache
            queryClient.setQueryData(jobCardKeys.detail(id), updatedJobCard)

            // Invalidate lists to ensure consistency
            queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() })

            toast.success('Job card updated successfully!', {
                icon: '✏️',
                style: {
                    borderRadius: '16px',
                    background: '#E3F2FD',
                    color: '#1976D2',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update job card', {
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

// Delete job card mutation
export const useDeleteJobCard = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => jobCardService.delete(id),
        onSuccess: (_, id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: jobCardKeys.detail(id) })

            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() })

            toast.success('Job card deleted successfully!', {
                icon: '🗑️',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete job card', {
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

// Update job card status mutation
export const useUpdateJobCardStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            jobCardService.updateStatus(id, status),
        onSuccess: (updatedJobCard, { id }) => {
            queryClient.setQueryData(jobCardKeys.detail(id), updatedJobCard)
            queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() })

            toast.success('Job card status updated!', {
                icon: '🔄',
                style: {
                    borderRadius: '16px',
                    background: '#E3F2FD',
                    color: '#1976D2',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update status', {
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

// Freeze job card mutation
export const useFreezeJobCard = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            jobCardService.freeze(id, reason),
        onSuccess: (updatedJobCard, { id }) => {
            queryClient.setQueryData(jobCardKeys.detail(id), updatedJobCard)
            queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() })

            toast.success('Job card frozen', {
                icon: '❄️',
                style: {
                    borderRadius: '16px',
                    background: '#E3F2FD',
                    color: '#1976D2',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to freeze job card', {
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

// Unfreeze job card mutation
export const useUnfreezeJobCard = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => jobCardService.unfreeze(id),
        onSuccess: (updatedJobCard, id) => {
            queryClient.setQueryData(jobCardKeys.detail(id), updatedJobCard)
            queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() })

            toast.success('Job card unfrozen', {
                icon: '🔥',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to unfreeze job card', {
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

// Close job card mutation
export const useCloseJobCard = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
            jobCardService.close(id, notes),
        onSuccess: (updatedJobCard, { id }) => {
            queryClient.setQueryData(jobCardKeys.detail(id), updatedJobCard)
            queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() })

            toast.success('Job card closed', {
                icon: '✅',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to close job card', {
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

// Set priority mutation
export const useSetJobCardPriority = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, priority }: { id: string; priority: boolean }) =>
            jobCardService.setPriority(id, priority),
        onSuccess: (updatedJobCard, { id, priority }) => {
            queryClient.setQueryData(jobCardKeys.detail(id), updatedJobCard)
            queryClient.invalidateQueries({ queryKey: jobCardKeys.lists() })

            toast.success(`Job card ${priority ? 'marked as priority' : 'priority removed'}`, {
                icon: priority ? '⚡' : '📋',
                style: {
                    borderRadius: '16px',
                    background: priority ? '#FFF3E0' : '#E3F2FD',
                    color: priority ? '#E65100' : '#1976D2',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update priority', {
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