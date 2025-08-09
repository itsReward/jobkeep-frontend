// src/components/layout/Sidebar.tsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Car,
  UserCheck,
  ClipboardList,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Wrench,
  ShoppingCart,
  Package
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/constants'
import { useAuth } from '@/components/providers/AuthProvider'

// Define menu items with role-based access control
const menuItems = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ['ADMIN', 'Manager', 'Service Advisor', 'Technician'] // All roles can access dashboard
  },
  {
    title: 'Clients',
    href: ROUTES.CLIENTS,
    icon: Users,
    roles: ['ADMIN', 'Service Advisor'] // Only Admin and Service Advisor can access clients
  },
  {
    title: 'Vehicles',
    href: ROUTES.VEHICLES,
    icon: Car,
    roles: ['ADMIN', 'Manager', 'Service Advisor', 'Technician'] // All roles except for specific restrictions
  },
  {
    title: 'Employees',
    href: ROUTES.EMPLOYEES,
    icon: UserCheck,
    roles: ['ADMIN', 'Manager'] // Only Admin and Manager can access employee management
  },
  {
    title: 'Job Cards',
    href: ROUTES.JOBCARDS,
    icon: ClipboardList,
    roles: ['ADMIN', 'Manager', 'Service Advisor', 'Technician'] // All roles can access job cards (filtered by role on backend)
  },
  {
    title: 'Appointments',
    href: ROUTES.APPOINTMENTS,
    icon: Calendar,
    roles: ['ADMIN', 'Manager', 'Service Advisor'] // Technicians don't need appointment management
  },
  {
    title: 'Invoices',
    href: ROUTES.INVOICES,
    icon: FileText,
    roles: ['ADMIN', 'Service Advisor'] // Only Admin and Service Advisor can access financial data
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['ADMIN', 'Manager', 'Stores'] // Inventory management for specific roles
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS,
    icon: BarChart3,
    roles: ['ADMIN', 'Manager'] // Only Admin and Manager can access reports
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
    roles: ['ADMIN'] // Only Admin can access system settings
  },
]

export const Sidebar: React.FC = () => {
  const { userRole, user, isLoading } = useAuth()

  // Show loading state while fetching user data
  if (isLoading) {
    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">JobKeep</span>
          </div>
          <div className="flex-1 px-3 py-4">
            <div className="space-y-2">
              {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
    )
  }

  // Filter menu items based on user role
  const accessibleMenuItems = menuItems.filter(item => {
    return userRole && item.roles.includes(userRole)
  })

  return (
      <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">JobKeep</span>
        </div>

        {/* User Info */}
        {user && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <span className="text-sm font-medium text-primary-700">
                {user.employeeName.charAt(0)}{user.employeeSurname.charAt(0)}
              </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.employeeName} {user.employeeSurname}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.userRole}
                  </p>
                </div>
              </div>
            </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {accessibleMenuItems.map((item) => (
              <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                      cn(
                          'sidebar-link',
                          isActive && 'active'
                      )
                  }
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </NavLink>
          ))}
        </nav>

        {/* Role indicator (for development/debugging) */}
        {process.env.NODE_ENV === 'development' && userRole && (
            <div className="px-6 py-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Role: <span className="font-mono font-medium">{userRole}</span>
              </div>
            </div>
        )}
      </div>
  )
}