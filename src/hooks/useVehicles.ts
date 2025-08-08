// src/hooks/useVehicles.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vehicleService, CreateVehicleRequest, UpdateVehicleRequest, Vehicle } from '@/services/api/vehicles'
import toast from 'react-hot-toast'

// Query Keys
export const vehicleKeys = {
    all: ['vehicles'] as const,
    lists: () => [...vehicleKeys.all, 'list'] as const,
    list: (filters: string) => [...vehicleKeys.lists(), { filters }] as const,
    details: () => [...vehicleKeys.all, 'detail'] as const,
    detail: (id: string) => [...vehicleKeys.details(), id] as const,
    byClient: (clientId: string) => [...vehicleKeys.all, 'byClient', clientId] as const,
}

// Get all vehicles
export function useVehicles(searchTerm?: string) {
    return useQuery({
        queryKey: vehicleKeys.list(searchTerm || ''),
        queryFn: () => vehicleService.getAll(),
        select: (data) => {
            if (!searchTerm) return data

            const term = searchTerm.toLowerCase()
            return data.filter(vehicle =>
                vehicle.model.toLowerCase().includes(term) ||
                vehicle.make.toLowerCase().includes(term) ||
                vehicle.regNumber.toLowerCase().includes(term) ||
                vehicle.color.toLowerCase().includes(term) ||
                vehicle.chassisNumber.toLowerCase().includes(term) ||
                vehicle.clientName?.toLowerCase().includes(term) ||
                vehicle.clientSurname?.toLowerCase().includes(term)
            )
        }
    })
}

// Get vehicle by ID
export function useVehicle(id: string) {
    return useQuery({
        queryKey: vehicleKeys.detail(id),
        queryFn: () => vehicleService.getById(id),
        enabled: !!id,
    })
}

// Get vehicles by client
export function useVehiclesByClient(clientId: string) {
    return useQuery({
        queryKey: vehicleKeys.byClient(clientId),
        queryFn: () => vehicleService.getVehiclesByClient(clientId),
        enabled: !!clientId,
    })
}

// Create vehicle mutation
export function useCreateVehicle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateVehicleRequest) => vehicleService.create(data),
        onSuccess: (newVehicle) => {
            queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
            // Also invalidate client queries to update vehicle counts
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            toast.success(`Vehicle ${newVehicle.make} ${newVehicle.model} created successfully!`)
        },
        onError: (error: any) => {
            toast.error(`Failed to create vehicle: ${error.message || 'Unknown error'}`)
        },
    })
}

// Update vehicle mutation
export function useUpdateVehicle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateVehicleRequest }) =>
            vehicleService.update(id, data),
        onSuccess: (updatedVehicle, variables) => {
            // Update the specific vehicle in cache
            queryClient.setQueryData(
                vehicleKeys.detail(variables.id),
                updatedVehicle
            )
            // Invalidate lists to refresh them
            queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
            // Also invalidate client queries if client changed
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            toast.success(`Vehicle ${updatedVehicle.make} ${updatedVehicle.model} updated successfully!`)
        },
        onError: (error: any) => {
            toast.error(`Failed to update vehicle: ${error.message || 'Unknown error'}`)
        },
    })
}

// Delete vehicle mutation
export function useDeleteVehicle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => vehicleService.delete(id),
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: vehicleKeys.detail(deletedId) })
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
            // Also invalidate client queries to update vehicle counts
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            toast.success('Vehicle deleted successfully!')
        },
        onError: (error: any) => {
            toast.error(`Failed to delete vehicle: ${error.message || 'Unknown error'}`)
        },
    })
}