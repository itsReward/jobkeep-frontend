// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { authService } from '@/services/api/auth'
import { User } from '@/types'

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                if (token) {
                    // In a real app, you'd decode the JWT or fetch user info
                    // For now, we'll simulate getting user info from token
                    const userInfo = authService.getCurrentUser()
                    setUser(userInfo)
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                localStorage.removeItem('accessToken')
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = async (username: string, password: string) => {
        try {
            const response = await authService.login(username, password)
            setUser(response.user)
            return response
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        authService.logout()
        setUser(null)
    }

    const hasRole = (roles: string | string[]): boolean => {
        if (!user) return false
        const userRole = user.role.toLowerCase()

        if (typeof roles === 'string') {
            return userRole === roles.toLowerCase()
        }

        return roles.some(role => userRole === role.toLowerCase())
    }

    const hasInventoryAccess = (): boolean => {
        return hasRole(['admin', 'stores', 'serviceAdvisor'])
    }

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        hasInventoryAccess,
    }
}