// src/hooks/useUsers.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService, CreateUserRequest, UpdateUserRequest, UpdateProfileRequest, User } from '@/services/api/users'
import toast from 'react-hot-toast'

// Query Keys
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: string) => [...userKeys.lists(), { filters }] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
    me: () => [...userKeys.all, 'me'] as const,
}

// Get all users (Admin only)
export function useUsers(searchTerm?: string) {
    return useQuery({
        queryKey: userKeys.list(searchTerm || ''),
        queryFn: () => userService.getAll(),
        select: (data) => {
            if (!searchTerm) return data

            const term = searchTerm.toLowerCase()
            return data.filter(user =>
                user.username.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                user.employeeName.toLowerCase().includes(term) ||
                user.employeeSurname.toLowerCase().includes(term) ||
                user.userRole.toLowerCase().includes(term) ||
                user.employeeRole.toLowerCase().includes(term) ||
                user.employeeDepartment.toLowerCase().includes(term)
            )
        }
    })
}

// Get user by ID
export function useUser(id: string) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => userService.getById(id),
        enabled: !!id,
    })
}

// Get current user
export function useCurrentUser() {
    return useQuery({
        queryKey: userKeys.me(),
        queryFn: () => userService.getCurrentUser(),
    })
}

// Create user mutation
export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateUserRequest) => userService.create(data),
        onSuccess: (newUser) => {
            // Invalidate and refetch users list
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            toast.success(`User "${newUser.username}" created successfully!`)
        },
        onError: (error: any) => {
            console.error('Create user error:', error)
            let message = 'Failed to create user'

            if (error?.response?.data?.error) {
                message = error.response.data.error
            } else if (error?.message) {
                message = error.message
            }

            toast.error(message)
        }
    })
}

// Update user mutation (Admin only)
export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
            userService.update(id, data),
        onSuccess: (updatedUser) => {
            // Invalidate and refetch relevant queries
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            queryClient.invalidateQueries({ queryKey: userKeys.detail(updatedUser.id) })
            toast.success(`User "${updatedUser.username}" updated successfully!`)
        },
        onError: (error: any) => {
            console.error('Update user error:', error)
            let message = 'Failed to update user'

            if (error?.response?.data?.error) {
                message = error.response.data.error
            } else if (error?.message) {
                message = error.message
            }

            toast.error(message)
        }
    })
}

// Update profile mutation (own profile)
export function useUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
        onSuccess: (updatedUser) => {
            // Invalidate current user and lists
            queryClient.invalidateQueries({ queryKey: userKeys.me() })
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            toast.success('Profile updated successfully!')
        },
        onError: (error: any) => {
            console.error('Update profile error:', error)
            let message = 'Failed to update profile'

            if (error?.response?.data?.error) {
                message = error.response.data.error
            } else if (error?.message) {
                message = error.message
            }

            toast.error(message)
        }
    })
}

// Delete user mutation
export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => userService.delete(id),
        onSuccess: () => {
            // Invalidate and refetch users list
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            toast.success('User deleted successfully!')
        },
        onError: (error: any) => {
            console.error('Delete user error:', error)
            let message = 'Failed to delete user'

            if (error?.response?.data?.error) {
                message = error.response.data.error
            } else if (error?.message) {
                message = error.message
            }

            toast.error(message)
        }
    })
}