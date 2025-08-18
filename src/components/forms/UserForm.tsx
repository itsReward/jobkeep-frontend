// src/components/forms/UserForm.tsx
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Card, CardContent, CardHeader, Button, Input, Loading } from '@/components/ui'
import { CreateUserRequest, UpdateUserRequest, User } from '@/services/api/users'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { useEmployees } from '@/hooks/useEmployees'
import { X, ChevronDown, Eye, EyeOff } from 'lucide-react'

interface UserFormProps {
    user?: User | null
    onClose: () => void
    onSuccess?: () => void
}

const USER_ROLES = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Service Advisor', label: 'Service Advisor' },
    { value: 'Technician', label: 'Technician' },
    { value: 'Stores', label: 'Stores' }
]

export const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
    const isEditing = !!user
    const [showPassword, setShowPassword] = useState(false)
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
    const [showRoleDropdown, setShowRoleDropdown] = useState(false)
    const { user: currentUser } = useAuth()

    // Check if editing own admin account (restrict role change)
    const isEditingOwnAdminAccount = isEditing && user?.id === currentUser?.id && user?.userRole === 'ADMIN'

    // Form setup
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<CreateUserRequest & { confirmPassword: string }>({
        defaultValues: {
            username: user?.username || '',
            email: user?.email || '',
            userRole: user?.userRole || 'Technician',
            employeeId: user?.employeeId || '',
            password: '',
            confirmPassword: ''
        }
    })

    // Mutations
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()
    const { data: employees } = useEmployees()

    const isLoading = createUser.isPending || updateUser.isPending

    // Reset form when user changes
    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                email: user.email,
                userRole: user.userRole,
                employeeId: user.employeeId,
                password: '',
                confirmPassword: ''
            })
        }
    }, [user, reset])

    // Watch values for controlled inputs
    const selectedEmployeeId = watch('employeeId')
    const selectedRole = watch('userRole')
    const password = watch('password')

    // Get selected employee details
    const selectedEmployee = employees?.find(emp => emp.id === selectedEmployeeId)

    const onSubmit = async (data: CreateUserRequest & { confirmPassword: string }) => {
        try {
            const userData: CreateUserRequest | UpdateUserRequest = {
                username: data.username,
                email: data.email,
                userRole: data.userRole,
                employeeId: data.employeeId,
                ...(data.password && { password: data.password })
            }

            if (isEditing && user) {
                await updateUser.mutateAsync({ id: user.id, data: userData as UpdateUserRequest })
            } else {
                await createUser.mutateAsync(userData as CreateUserRequest)
            }

            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    // Password validation
    const validatePassword = (value: string) => {
        if (!value && !isEditing) return 'Password is required'
        if (value && value.length < 8) return 'Password must be at least 8 characters'
        if (value && !/(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
            return 'Password must contain both uppercase and lowercase letters'
        }
        return true
    }

    const validateConfirmPassword = (value: string) => {
        if (password && value !== password) {
            return 'Passwords do not match'
        }
        return true
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditing ? 'Edit User' : 'Create New User'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditing ? 'Update user information' : 'Add a new user to the system'}
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                Account Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Username *"
                                    placeholder="Enter username"
                                    {...register('username', {
                                        required: 'Username is required',
                                        minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                        pattern: {
                                            value: /^[a-zA-Z0-9_]+$/,
                                            message: 'Username can only contain letters, numbers, and underscores'
                                        }
                                    })}
                                    error={errors.username?.message}
                                    disabled={isLoading}
                                />

                                <Input
                                    label="Email *"
                                    type="email"
                                    placeholder="Enter email address"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Please enter a valid email address'
                                        }
                                    })}
                                    error={errors.email?.message}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Input
                                        label={isEditing ? "New Password (leave blank to keep current)" : "Password *"}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password"
                                        {...register('password', { validate: validatePassword })}
                                        error={errors.password?.message}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                <Input
                                    label={isEditing ? "Confirm New Password" : "Confirm Password *"}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm password"
                                    {...register('confirmPassword', { validate: validateConfirmPassword })}
                                    error={errors.confirmPassword?.message}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Employee Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                Employee Assignment
                            </h3>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Employee *
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        disabled={isLoading}
                                    >
                                        <div className="flex items-center justify-between">
                      <span className={selectedEmployee ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedEmployee
                            ? `${selectedEmployee.employeeName} ${selectedEmployee.employeeSurname} - ${selectedEmployee.employeeRole}`
                            : 'Select an employee'
                        }
                      </span>
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </button>

                                    {showEmployeeDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {employees?.map((employee) => (
                                                <button
                                                    key={employee.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue('employeeId', employee.id)
                                                        setShowEmployeeDropdown(false)
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {employee.employeeName} {employee.employeeSurname}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {employee.employeeRole} - {employee.employeeDepartment}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.employeeId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                System Role
                            </h3>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User Role *
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => !isEditingOwnAdminAccount && setShowRoleDropdown(!showRoleDropdown)}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                            isEditingOwnAdminAccount
                                                ? 'cursor-not-allowed bg-gray-50 text-gray-500'
                                                : 'hover:border-gray-400 cursor-pointer'
                                        }`}
                                        disabled={isLoading || isEditingOwnAdminAccount}
                                    >
                                        <div className="flex items-center justify-between">
                      <span className="text-gray-900">
                        {USER_ROLES.find(role => role.value === selectedRole)?.label}
                      </span>
                                            {!isEditingOwnAdminAccount && <ChevronDown className="h-4 w-4 text-gray-400" />}
                                        </div>
                                    </button>

                                    {showRoleDropdown && !isEditingOwnAdminAccount && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                                            {USER_ROLES.map((role) => (
                                                <button
                                                    key={role.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue('userRole', role.value as any)
                                                        setShowRoleDropdown(false)
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-gray-900"
                                                >
                                                    {role.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {isEditingOwnAdminAccount && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        You cannot change your own admin role
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loading className="w-4 h-4 mr-2" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    isEditing ? 'Update User' : 'Create User'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}