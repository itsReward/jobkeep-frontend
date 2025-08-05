import React from 'react'
import { Bell, Search, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/api/auth'
import { useNavigate } from 'react-router-dom'

export const Header: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
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
