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
  Package
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/constants'
import { useAuth } from '@/hooks/useAuth'

const menuItems = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ['admin', 'serviceAdvisor', 'technician', 'supervisor', 'stores']
  },
  {
    title: 'Clients',
    href: ROUTES.CLIENTS,
    icon: Users,
    roles: ['admin', 'serviceAdvisor', 'supervisor']
  },
  {
    title: 'Vehicles',
    href: ROUTES.VEHICLES,
    icon: Car,
    roles: ['admin', 'serviceAdvisor', 'technician', 'supervisor']
  },
  {
    title: 'Employees',
    href: ROUTES.EMPLOYEES,
    icon: UserCheck,
    roles: ['admin', 'supervisor']
  },
  {
    title: 'Job Cards',
    href: ROUTES.JOBCARDS,
    icon: ClipboardList,
    roles: ['admin', 'serviceAdvisor', 'technician', 'supervisor']
  },
  {
    title: 'Appointments',
    href: ROUTES.APPOINTMENTS,
    icon: Calendar,
    roles: ['admin', 'serviceAdvisor', 'supervisor']
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['admin', 'stores', 'serviceAdvisor']
  },
  {
    title: 'Invoices',
    href: ROUTES.INVOICES,
    icon: FileText,
    roles: ['admin', 'serviceAdvisor', 'supervisor']
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS,
    icon: BarChart3,
    roles: ['admin', 'supervisor']
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
    roles: ['admin']
  },
]

export const Sidebar: React.FC = () => {
  const { user } = useAuth()

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item =>
      item.roles.includes(user?.role || '')
  )

  return (
      <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">JobKeep</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleMenuItems.map((item) => (
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

        {/* User Info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
            <span className="text-sm font-medium text-primary-700">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}