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
  Wrench
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/constants'

const menuItems = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'Clients',
    href: ROUTES.CLIENTS,
    icon: Users,
  },
  {
    title: 'Vehicles',
    href: ROUTES.VEHICLES,
    icon: Car,
  },
  {
    title: 'Employees',
    href: ROUTES.EMPLOYEES,
    icon: UserCheck,
  },
  {
    title: 'Job Cards',
    href: ROUTES.JOBCARDS,
    icon: ClipboardList,
  },
  {
    title: 'Appointments',
    href: ROUTES.APPOINTMENTS,
    icon: Calendar,
  },
  {
    title: 'Invoices',
    href: ROUTES.INVOICES,
    icon: FileText,
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS,
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]

export const Sidebar: React.FC = () => {
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
        {menuItems.map((item) => (
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
    </div>
  )
}
