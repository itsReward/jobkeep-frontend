// src/components/layout/Header.tsx
import React from 'react'
import { Bell, Search, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/components/providers/AuthProvider'

export const Header: React.FC = () => {
  const { logout, user, userRole } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <Input
              placeholder="Search clients, vehicles, job cards..."
              icon={Search}
              className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.employeeName} {user.employeeSurname}
                  </p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
            )}

            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
  )
}