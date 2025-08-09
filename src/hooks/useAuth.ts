// src/hooks/useAuth.ts
import { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService, LoginRequest, AuthService } from '@/services/api/users'
import { userService, User } from '@/services/api/users'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    userRole: string | null
    login: (credentials: LoginRequest) => Promise<void>
    logout: () => void
    refetchUser: () => void
}

// This will be used from a separate AuthProvider component
export const useAuthLogic = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    // Query to fetch current user data
    const {
        data: user,
        isLoading,
        refetch: refetchUser,
        error
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: userService.getCurrentUser,
        enabled: isAuthenticated,
        retry: (failureCount, error: any) => {
            // Don't retry on 401 errors
            if (error?.response?.status === 401) {
                return false
            }
            return failureCount < 2
        }
    })

    // Handle token expiration or invalid token
    useEffect(() => {
        if (error?.response?.status === 401) {
            handleLogout()
        }
    }, [error])

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (response) => {
            localStorage.setItem('accessToken', response.accessToken)
            setIsAuthenticated(true)
            queryClient.invalidateQueries({ queryKey: ['currentUser'] })
            toast.success('Welcome back! Login successful!')
            navigate('/dashboard')
        },
        onError: () => {
            toast.error('Invalid credentials. Please try again.')
        }
    })

    const handleLogin = async (credentials: LoginRequest): Promise<void> => {
        return loginMutation.mutateAsync(credentials)
    }

    const handleLogout = () => {
        authService.logout()
        setIsAuthenticated(false)
        queryClient.clear() // Clear all cached data
        toast.success('Logged out successfully!')
        navigate('/login')
    }

    return {
        user: user || null,
        isAuthenticated: isAuthenticated && !!user,
        isLoading: isAuthenticated ? isLoading : false,
        userRole: user?.userRole || null,
        login: handleLogin,
        logout: handleLogout,
        refetchUser: () => refetchUser(),
        loginMutation
    }
}

// Simple hook that will get the context (to be used after AuthProvider is set up)
export const useAuth = (): AuthContextType => {
    // For now, we'll throw an error if used without provider
    // This will be replaced when we create the AuthProvider component
    throw new Error('useAuth must be used within an AuthProvider. Please create AuthProvider component first.')
}