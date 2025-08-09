// src/components/providers/AuthProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react'
import { useAuthLogic } from '@/hooks/useAuth'
import { User, LoginRequest } from '@/services/api/users'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    userRole: string | null
    login: (credentials: LoginRequest) => Promise<void>
    logout: () => void
    refetchUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const authData = useAuthLogic()

    const contextValue: AuthContextType = {
        user: authData.user,
        isAuthenticated: authData.isAuthenticated,
        isLoading: authData.isLoading,
        userRole: authData.userRole,
        login: authData.login,
        logout: authData.logout,
        refetchUser: authData.refetchUser
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

// Updated useAuth hook that uses the context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}