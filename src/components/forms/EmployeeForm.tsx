// src/components/forms/EmployeeForm.tsx - Updated for Modal Usage
import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { employeeService, CreateEmployeeRequest } from '@/services/api/employees'
import { Employee } from '@/types'
import { Save } from 'lucide-react'

interface EmployeeFormProps {
    employee?: Employee
    onSuccess?: () => void
    onCancel?: () => void
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
                                                              employee,
                                                              onSuccess,
                                                              onCancel,
                                                          }) => {
    const queryClient = useQueryClient()
    const isEditing = !!employee

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateEmployeeRequest>({
        defaultValues: employee ? {
            employeeName: employee.employeeName,
            employeeSurname: employee.employeeSurname,
            email: employee.email,
            phoneNumber: employee.phoneNumber,
            employeeRole: employee.employeeRole,
            rating: employee.rating || 0,
            employeeDepartment: employee.employeeDepartment || '',
            homeAddress: employee.homeAddress || '',
        } : {
            employeeName: '',
            employeeSurname: '',
            email: '',
            phoneNumber: '',
            employeeRole: '',
            rating: 0,
            employeeDepartment: '',
            homeAddress: '',
        }
    })

    const createMutation = useMutation({
        mutationFn: employeeService.create.bind(employeeService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
            toast.success('Employee created successfully!')
            reset()
            onSuccess?.()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create employee')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateEmployeeRequest }) =>
            employeeService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
            queryClient.invalidateQueries({ queryKey: ['employees', employee?.employeeId] })
            toast.success('Employee updated successfully!')
            onSuccess?.()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update employee')
        },
    })

    const isLoading = createMutation.isPending || updateMutation.isPending

    const onSubmit = (data: CreateEmployeeRequest) => {
        if (isEditing && employee) {
            updateMutation.mutate({ id: employee.employeeId, data })
        } else {
            createMutation.mutate(data)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="First Name *"
                            placeholder="Enter first name"
                            {...register('employeeName', {
                                required: 'First name is required',
                                minLength: {
                                    value: 2,
                                    message: 'First name must be at least 2 characters',
                                },
                            })}
                            error={errors.employeeName?.message}
                            disabled={isLoading}
                        />

                        <Input
                            label="Last Name *"
                            placeholder="Enter last name"
                            {...register('employeeSurname', {
                                required: 'Last name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Last name must be at least 2 characters',
                                },
                            })}
                            error={errors.employeeSurname?.message}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email Address *"
                            type="email"
                            placeholder="Enter email address"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Please enter a valid email address',
                                },
                            })}
                            error={errors.email?.message}
                            disabled={isLoading}
                        />

                        <Input
                            label="Phone Number *"
                            placeholder="Enter phone number"
                            {...register('phoneNumber', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[\+]?[(]?[\d\s\-\(\)]{7,}$/,
                                    message: 'Please enter a valid phone number',
                                },
                            })}
                            error={errors.phoneNumber?.message}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Job Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        Job Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Position *"
                            placeholder="Enter position/job title"
                            {...register('employeeRole', {
                                required: 'Position is required',
                            })}
                            error={errors.employeeRole?.message}
                            disabled={isLoading}
                        />

                        <Input
                            label="Department"
                            placeholder="Enter department"
                            {...register('employeeDepartment')}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rating (0-5)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                className="input"
                                {...register('rating', {
                                    valueAsNumber: true,
                                    min: {
                                        value: 0,
                                        message: 'Rating must be between 0 and 5',
                                    },
                                    max: {
                                        value: 5,
                                        message: 'Rating must be between 0 and 5',
                                    },
                                })}
                                disabled={isLoading}
                            />
                            {errors.rating && (
                                <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        Address Information
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Home Address
                        </label>
                        <textarea
                            className="input min-h-[80px] resize-vertical"
                            placeholder="Enter home address"
                            rows={3}
                            {...register('homeAddress')}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isEditing ? 'Update Employee' : 'Create Employee'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}