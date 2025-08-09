// src/hooks/useAuth.ts - ENHANCED DEBUG VERSION
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService, LoginRequest } from '@/services/api/users'
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

export const useAuthLogic = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const hasToken = authService.isAuthenticated()
        console.log('🔧 Initial auth state:', { hasToken })
        return hasToken
    })

    const queryClient = useQueryClient()
    const navigate = useNavigate()

    // Query to fetch current user data
    const {
        data: user,
        isLoading: userIsLoading,
        refetch: refetchUser,
        error: userError,
        status: queryStatus
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            console.log('🔧 Fetching user data...')
            try {
                const userData = await userService.getCurrentUser()
                console.log('✅ User data fetched successfully:', userData)
                return userData
            } catch (error) {
                console.error('❌ Failed to fetch user data:', error)
                throw error
            }
        },
        enabled: isAuthenticated,
        retry: (failureCount, error: any) => {
            console.log('🔧 Query retry attempt:', { failureCount, error: error?.response?.status })
            if (error?.response?.status === 401) {
                console.log('❌ 401 error - not retrying')
                return false
            }
            return failureCount < 1
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    })

    // Add comprehensive debugging
    useEffect(() => {
        console.log('🔧 Auth State Update:', {
            isAuthenticated,
            hasToken: !!localStorage.getItem('accessToken'),
            token: localStorage.getItem('accessToken')?.substring(0, 20) + '...',
            user: user ? { id: user.id, username: user.username, role: user.userRole } : 'No user',
            userError: userError ? {
                status: userError?.response?.status,
                message: userError?.message,
                data: userError?.response?.data
            } : 'No error',
            userIsLoading,
            queryStatus
        })
    }, [isAuthenticated, user, userError, userIsLoading, queryStatus])

    // Handle authentication errors
    useEffect(() => {
        if (userError?.response?.status === 401 && isAuthenticated) {
            console.log('❌ 401 error detected - logging out user')
            handleLogout()
        } else if (userError && isAuthenticated) {
            console.log('❌ Non-401 error:', userError)
            // Don't logout for non-401 errors, just show error
            toast.error('Failed to load user data. Please refresh the page.')
        }
    }, [userError, isAuthenticated])

    const isLoading = isAuthenticated && userIsLoading && !user

    // Login mutation with enhanced debugging
    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: async (response) => {
            try {
                console.log('✅ Login successful, storing token')
                localStorage.setItem('accessToken', response.accessToken)
                setIsAuthenticated(true)

                console.log('🔧 Invalidating user query...')
                await queryClient.invalidateQueries({ queryKey: ['currentUser'] })

                console.log('🔧 Waiting for user data...')
                // Give some time for the user query to complete
                setTimeout(() => {
                    console.log('🔧 Navigating to dashboard')
                    toast.success('Welcome back! Login successful!')
                    navigate('/dashboard')
                }, 500) // Small delay to let user query start

            } catch (error) {
                console.error('❌ Error after login:', error)
                toast.error('Login successful but failed to load user data')
            }
        },
        onError: (error: any) => {
            console.error('❌ Login error:', error)
            let message = 'Invalid credentials. Please try again.'

            if (error?.message) {
                message = error.message
            } else if (error?.response?.data?.message) {
                message = error.response.data.message
            }

            toast.error(message)
        }
    })

    const handleLogin = async (credentials: LoginRequest): Promise<void> => {
        console.log('🔧 Starting login process...')
        return loginMutation.mutateAsync(credentials)
    }

    const handleLogout = () => {
        console.log('🔧 Logging out user')
        authService.logout()
        setIsAuthenticated(false)
        queryClient.clear()
        toast.success('Logged out successfully!')
        navigate('/login')
    }

    // Enhanced authentication state calculation
    const finalIsAuthenticated = isAuthenticated && (!!user || userIsLoading)

    /*console.log('🔧 Final auth calculation:', {
        isAuthenticated,
        hasUser: !!user,
        userIsLoading,
        finalIsAuthenticated
    })*/

    return {
        user: user || null,
        isAuthenticated: finalIsAuthenticated,
        isLoading,
        userRole: user?.userRole || null,
        login: handleLogin,
        logout: handleLogout,
        refetchUser: () => refetchUser(),
        loginMutation
    }
}