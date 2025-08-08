// src/hooks/useClients.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientService, CreateClientRequest } from '@/services/api/clients'
import toast from 'react-hot-toast'

// Query Keys
export const clientKeys = {
    all: ['clients'] as const,
    lists: () => [...clientKeys.all, 'list'] as const,
    list: (filters: string) => [...clientKeys.lists(), { filters }] as const,
    details: () => [...clientKeys.all, 'detail'] as const,
    detail: (id: string) => [...clientKeys.details(), id] as const,
}

// Get all clients
export function useClients(searchTerm?: string) {
    return useQuery({
        queryKey: clientKeys.list(searchTerm || ''),
        queryFn: () => clientService.getAll(),
        select: (data) => {
            if (!searchTerm) return data

            const term = searchTerm.toLowerCase()
            return data.filter(client =>
                client.clientName.toLowerCase().includes(term) ||
                client.clientSurname.toLowerCase().includes(term) ||
                client.email.toLowerCase().includes(term) ||
                client.phone.includes(term) ||
                client.gender.toLowerCase().includes(term) ||
                client.company?.toLowerCase().includes(term) ||
                client.jobTitle?.toLowerCase().includes(term)
            )
        }
    })
}

// Get client by ID
export function useClient(id: string) {
    return useQuery({
        queryKey: clientKeys.detail(id),
        queryFn: () => clientService.getById(id),
        enabled: !!id,
    })
}

// Create client mutation
export function useCreateClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateClientRequest) => clientService.create(data),
        onSuccess: (newClient) => {
            queryClient.invalidateQueries({ queryKey: clientKeys.all })
            toast.success(`Client ${newClient.clientName} ${newClient.clientSurname} created successfully!`)
        },
        onError: (error: any) => {
            toast.error(`Failed to create client: ${error.message || 'Unknown error'}`)
        },
    })
}

// Update client mutation
export function useUpdateClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientRequest> }) =>
            clientService.update(id, data),
        onSuccess: (updatedClient, variables) => {
            // Update the specific client in cache
            queryClient.setQueryData(
                clientKeys.detail(variables.id),
                updatedClient
            )
            // Invalidate the list to refresh it
            queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
            toast.success(`Client ${updatedClient.clientName} ${updatedClient.clientSurname} updated successfully!`)
        },
        onError: (error: any) => {
            toast.error(`Failed to update client: ${error.message || 'Unknown error'}`)
        },
    })
}

// Delete client mutation
export function useDeleteClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => clientService.delete(id),
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: clientKeys.detail(deletedId) })
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
            toast.success('Client deleted successfully!')
        },
        onError: (error: any) => {
            toast.error(`Failed to delete client: ${error.message || 'Unknown error'}`)
        },
    })
}