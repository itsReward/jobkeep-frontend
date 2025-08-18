// src/pages/users/UserManagement.tsx
import React, { useState, useMemo } from 'react'
import { useUsers, useDeleteUser } from '@/hooks/useUsers'
import { User } from '@/services/api/users'
import { useAuth } from '@/components/providers/AuthProvider'
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    User as UserIcon,
    Shield,
    X,
    AlertTriangle,
    ChevronDown,
    Mail,
    Phone,
    Building
} from 'lucide-react'
import { Card, CardContent, CardHeader, Button, Badge, Input, Loading } from '@/components/ui'
import { UserForm } from '@/components/forms/UserForm'

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showUserForm, setShowUserForm] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Filter states
    const [roleFilter, setRoleFilter] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // Fetch users
    const { data: users, isLoading, error, refetch } = useUsers(searchTerm)

    // Delete mutation
    const deleteUser = useDeleteUser()

    // Get unique roles and departments for filters
    const uniqueRoles = useMemo(() => {
        if (!users) return []
        return [...new Set(users.map(u => u.userRole))].sort()
    }, [users])

    const uniqueDepartments = useMemo(() => {
        if (!users) return []
        return [...new Set(users.map(u => u.employeeDepartment))].sort()
    }, [users])

    // Filtered users based on additional filters
    const filteredUsers = useMemo(() => {
        if (!users) return []

        return users.filter(user => {
            // Role filter
            if (roleFilter && user.userRole !== roleFilter) {
                return false
            }

            // Department filter
            if (departmentFilter && user.employeeDepartment !== departmentFilter) {
                return false
            }

            // Status filter
            if (statusFilter === 'active' && !user.active) {
                return false
            }
            if (statusFilter === 'inactive' && user.active) {
                return false
            }

            return true
        })
    }, [users, roleFilter, departmentFilter, statusFilter])

    const handleEdit = (user: User) => {
        // Prevent admin from editing their own role
        if (user.id === currentUser?.id && user.userRole === 'ADMIN') {
            // Still allow editing, but the form will handle role restriction
        }
        setEditingUser(user)
        setShowUserForm(true)
    }

    const handleDelete = (user: User) => {
        // Prevent admin from deleting themselves
        if (user.id === currentUser?.id) {
            return
        }
        setSelectedUser(user)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (selectedUser) {
            try {
                await deleteUser.mutateAsync(selectedUser.id)
                setShowDeleteModal(false)
                setSelectedUser(null)
            } catch (error) {
                console.error('Delete failed:', error)
            }
        }
    }

    const clearFilters = () => {
        setRoleFilter('')
        setDepartmentFilter('')
        setStatusFilter('')
    }

    const hasActiveFilters = roleFilter || departmentFilter || statusFilter

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loading className="w-8 h-8" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading users</h3>
                    <p className="text-gray-500 mb-4">There was a problem loading the user list.</p>
                    <Button onClick={() => refetch()}>Try Again</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage system users and their permissions</p>
                </div>
                <Button onClick={() => setShowUserForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search users by name, username, email, role..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && (
                                <Badge variant="primary" className="ml-1">
                                    {[roleFilter, departmentFilter, statusFilter].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Role Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Roles</option>
                                        {uniqueRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Department Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                    <select
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Departments</option>
                                        {uniqueDepartments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Users</option>
                                        <option value="active">Active Only</option>
                                        <option value="inactive">Inactive Only</option>
                                    </select>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <div className="mt-4">
                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                        <X className="w-4 h-4 mr-1" />
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredUsers.length} of {users?.length || 0} users
        </span>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {user.employeeName} {user.employeeSurname}
                                        </h3>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                </div>

                                <Badge variant={user.active ? "success" : "secondary"}>
                                    {user.active ? "Active" : "Inactive"}
                                </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Shield className="w-4 h-4" />
                                    <span>{user.userRole}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Building className="w-4 h-4" />
                                    <span>{user.employeeDepartment}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{user.email}</span>
                                </div>

                                {user.phoneNumber && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{user.phoneNumber}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(user)}
                                    className="flex-1"
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>

                                {user.id !== currentUser?.id && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(user)}
                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || hasActiveFilters
                                ? "Try adjusting your search or filters to find users."
                                : "Get started by adding your first user."}
                        </p>
                        {!searchTerm && !hasActiveFilters && (
                            <Button onClick={() => setShowUserForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* User Form Modal */}
            {showUserForm && (
                <UserForm
                    user={editingUser}
                    onClose={() => {
                        setShowUserForm(false)
                        setEditingUser(null)
                    }}
                    onSuccess={() => {
                        refetch()
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Delete User</h2>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete{' '}
                                <span className="font-medium">
                  {selectedUser.employeeName} {selectedUser.employeeSurname}
                </span>
                                ? This will permanently remove their access to the system.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setSelectedUser(null)
                                    }}
                                    disabled={deleteUser.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    disabled={deleteUser.isPending}
                                >
                                    {deleteUser.isPending ? (
                                        <>
                                            <Loading className="w-4 h-4 mr-2" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete User'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default UserManagement