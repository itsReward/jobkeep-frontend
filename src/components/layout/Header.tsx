// src/components/layout/Header.tsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, User, LogOut, ChevronDown, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/components/providers/AuthProvider'

export const Header: React.FC = () => {
    const { logout, user, userRole } = useAuth()
    const navigate = useNavigate()
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const isAdmin = userRole === 'ADMIN'

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = () => {
        setShowProfileDropdown(false)
        logout()
    }

    const handleProfileClick = () => {
        if (isAdmin) {
            setShowProfileDropdown(!showProfileDropdown)
        } else {
            navigate('/profile')
        }
    }

    const handleViewProfile = () => {
        setShowProfileDropdown(false)
        navigate('/profile')
    }

    const handleUserManagement = () => {
        setShowProfileDropdown(false)
        navigate('/admin/users')
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

                    {/* Profile Button with Dropdown for Admin */}
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleProfileClick}
                            className="flex items-center gap-1"
                        >
                            <User className="h-5 w-5" />
                            {isAdmin && <ChevronDown className="h-3 w-3" />}
                        </Button>

                        {/* Admin Dropdown */}
                        {isAdmin && showProfileDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="py-1">
                                    <button
                                        onClick={handleViewProfile}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        View Profile
                                    </button>
                                    <button
                                        onClick={handleUserManagement}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Users className="h-4 w-4" />
                                        User Management
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}