// src/hooks/usePermissions.ts
import { useMemo } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getPermissions, hasPermission, UserRole, RolePermissions } from '@/types'

interface UsePermissionsReturn extends RolePermissions {
    hasPermission: (permission: keyof RolePermissions) => boolean
    isAdmin: boolean
    isManager: boolean
    isServiceAdvisor: boolean
    isTechnician: boolean
    isStores: boolean
}

export const usePermissions = (): UsePermissionsReturn => {
    const { userRole } = useAuth()

    const permissions = useMemo(() => {
        if (!userRole) {
            // Return default permissions with no access if no role
            return {
                canAccessClients: false,
                canAccessEmployees: false,
                canAccessFinancials: false,
                canAccessReports: false,
                canAccessSettings: false,
                canManageUsers: false,
                canManageInventory: false,
                canViewAllJobCards: false,
                canApproveRequisitions: false,
            }
        }

        return getPermissions(userRole as UserRole)
    }, [userRole])

    const roleCheckers = useMemo(() => ({
        isAdmin: userRole === 'ADMIN',
        isManager: userRole === 'Manager',
        isServiceAdvisor: userRole === 'SERVICE_ADVISOR',
        isTechnician: userRole === 'TECHNICIAN',
        isStores: userRole === 'Stores',
    }), [userRole])

    const checkPermission = (permission: keyof RolePermissions): boolean => {
        if (!userRole) return false
        return hasPermission(userRole as UserRole, permission)
    }

    return {
        ...permissions,
        ...roleCheckers,
        hasPermission: checkPermission,
    }
}