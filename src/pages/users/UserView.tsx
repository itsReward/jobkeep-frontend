// src/pages/users/UserView.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, Button, Input, Loading, Badge } from '@/components/ui'
import { useCurrentUser, useUpdateProfile } from '@/hooks/useUsers'
import { UpdateProfileRequest } from '@/services/api/users'
import { useAuth } from '@/components/providers/AuthProvider'
import { User, Mail, Phone, MapPin, Shield, Briefcase, Building, Star, Eye, EyeOff, Save, X } from 'lucide-react'

export const UserView: React.FC = () => {
    const {user: authUser, userRole} = useAuth()
    const {data: currentUser, isLoading: userLoading} = useCurrentUser()
    const updateProfile = useUpdateProfile()
    const [isEditing, setIsEditing] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const user = currentUser || authUser

    const {
        register,
        handleSubmit,
        formState: {errors, isDirty},
        reset,
        watch
    } = useForm<UpdateProfileRequest & { confirmPassword: string }>({
        defaultValues: {
            username: user?.username || '',
            email: user?.email || '',
            phoneNumber: user?.phoneNumber || '',
            homeAddress: user?.homeAddress || '',
            password: '',
            confirmPassword: ''
        }
    })

    const password = watch('password')

    // Reset form when user data changes
    React.useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                homeAddress: user.homeAddress,
                password: '',
                confirmPassword: ''
            })
        }
    }, [user, reset])

    const onSubmit = async (data: UpdateProfileRequest & { confirmPassword: string }) => {
        try {
            const updateData: UpdateProfileRequest = {
                username: data.username,
                email: data.email,
                phoneNumber: data.phoneNumber,
                homeAddress: data.homeAddress
            }

            // Only include password if it's provided
            if (data.password) {
                updateData.password = data.password
            }

            await updateProfile.mutateAsync(updateData)
            setIsEditing(false)
        } catch (error) {
            console.error('Profile update error:', error)
        }
    }

    const handleCancel = () => {
        reset()
        setIsEditing(false)
    }

    // Password validation
    const validatePassword = (value: string) => {
        if (!value) return true // Password is optional for updates
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
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

    if (userLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loading className="w-8 h-8"/>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
                    <p className="text-gray-500">Unable to load user profile information.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your account information and preferences</p>
                </div>

                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview Card */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div
                                    className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-10 h-10 text-primary-600"/>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                    {user.employeeName} {user.employeeSurname}
                                </h2>
                                <p className="text-gray-500 mb-4">@{user.username}</p>

                                <div className="space-y-3">
                                    <Badge variant="outline" className="flex items-center gap-2">
                                        <Shield className="w-3 h-3"/>
                                        {user.userRole}
                                    </Badge>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Briefcase className="w-4 h-4"/>
                                        {user.employeeRole}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building className="w-4 h-4"/>
                                        {user.employeeDepartment}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Star className="w-4 h-4"/>
                                        Rating: {user.rating}/5
                                    </div>

                                    <div className="pt-2">
                                        <Badge variant={user.active ? "success" : "secondary"}>
                                            {user.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Details Card */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                                <p className="text-sm text-gray-500">Update your personal information</p>
                            </div>

                            {isEditing && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancel}
                                        disabled={updateProfile.isPending}
                                    >
                                        <X className="w-4 h-4 mr-1"/>
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={updateProfile.isPending || !isDirty}
                                    >
                                        {updateProfile.isPending ? (
                                            <Loading className="w-4 h-4 mr-1"/>
                                        ) : (
                                            <Save className="w-4 h-4 mr-1"/>
                                        )}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                                        Account Information
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User className="w-4 h-4 inline mr-1"/>
                                                Username
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    {...register('username', {
                                                        required: 'Username is required',
                                                        minLength: {
                                                            value: 3,
                                                            message: 'Username must be at least 3 characters'
                                                        }
                                                    })}
                                                    error={errors.username?.message}
                                                    disabled={updateProfile.isPending}
                                                />
                                            ) : (
                                                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{user.username}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Mail className="w-4 h-4 inline mr-1"/>
                                                Email Address
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    type="email"
                                                    {...register('email', {
                                                        required: 'Email is required',
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: 'Please enter a valid email address'
                                                        }
                                                    })}
                                                    error={errors.email?.message}
                                                    disabled={updateProfile.isPending}
                                                />
                                            ) : (
                                                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{user.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                                        Contact Information
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Phone className="w-4 h-4 inline mr-1"/>
                                                Phone Number
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    {...register('phoneNumber', {
                                                        pattern: {
                                                            value: /^[\+]?[(]?[\d\s\-\(\)]{7,}$/,
                                                            message: 'Please enter a valid phone number'
                                                        }
                                                    })}
                                                    error={errors.phoneNumber?.message}
                                                    disabled={updateProfile.isPending}
                                                    placeholder="Enter phone number"
                                                />
                                            ) : (
                                                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                                                    {user.phoneNumber || 'Not provided'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <MapPin className="w-4 h-4 inline mr-1"/>
                                                Home Address
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    {...register('homeAddress')}
                                                    disabled={updateProfile.isPending}
                                                    placeholder="Enter home address"
                                                />
                                            ) : (
                                                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                                                    {user.homeAddress || 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Password Change (only when editing) */}
                                {isEditing && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                                            Change Password (Optional)
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Input
                                                    label="New Password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Leave blank to keep current password"
                                                    {...register('password', {validate: validatePassword})}
                                                    error={errors.password?.message}
                                                    disabled={updateProfile.isPending}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4"/> :
                                                        <Eye className="h-4 w-4"/>}
                                                </button>
                                            </div>

                                            <Input
                                                label="Confirm New Password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Confirm new password"
                                                {...register('confirmPassword', {validate: validateConfirmPassword})}
                                                error={errors.confirmPassword?.message}
                                                disabled={updateProfile.isPending}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Employee Information (Read-only) */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                                        Employee Information
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Briefcase className="w-4 h-4 inline mr-1"/>
                                                Employee Role
                                            </label>
                                            <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{user.employeeRole}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Building className="w-4 h-4 inline mr-1"/>
                                                Department
                                            </label>
                                            <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{user.employeeDepartment}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Star className="w-4 h-4 inline mr-1"/>
                                                Rating
                                            </label>
                                            <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{user.rating}/5</p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}