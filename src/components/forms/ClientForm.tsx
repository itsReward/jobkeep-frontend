// src/components/forms/ClientForm.tsx
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, Button, Input } from '@/components/ui'
import { CreateClientRequest } from '@/services/api/clients'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'
import { Client } from '@/types'
import { X } from 'lucide-react'

interface ClientFormProps {
    client?: Client | null
    onClose: () => void
    onSuccess?: () => void
}

const GENDER_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
]

export const ClientForm: React.FC<ClientFormProps> = ({
                                                          client,
                                                          onClose,
                                                          onSuccess
                                                      }) => {
    const isEditing = !!client
    const createClient = useCreateClient()
    const updateClient = useUpdateClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm<CreateClientRequest>({
        defaultValues: {
            clientName: '',
            clientSurname: '',
            gender: '',
            jobTitle: '',
            company: '',
            phone: '',
            email: '',
            address: ''
        }
    })

    // Set form values when editing
    useEffect(() => {
        if (client) {
            setValue('clientName', client.clientName)
            setValue('clientSurname', client.clientSurname)
            setValue('gender', client.gender)
            setValue('jobTitle', client.jobTitle || '')
            setValue('company', client.company || '')
            setValue('phone', client.phone)
            setValue('email', client.email || '')
            setValue('address', client.address)
        }
    }, [client, setValue])

    const onSubmit = async (data: CreateClientRequest) => {
        try {
            if (isEditing && client) {
                await updateClient.mutateAsync({ id: client.id, data })
            } else {
                await createClient.mutateAsync(data)
            }
            reset()
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    const isLoading = createClient.isPending || updateClient.isPending

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditing ? 'Edit Client' : 'Create New Client'}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name *"
                                placeholder="Enter first name"
                                {...register('clientName', {
                                    required: 'First name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'First name must be at least 2 characters',
                                    },
                                })}
                                error={errors.clientName?.message}
                                disabled={isLoading}
                            />

                            <Input
                                label="Last Name *"
                                placeholder="Enter last name"
                                {...register('clientSurname', {
                                    required: 'Last name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Last name must be at least 2 characters',
                                    },
                                })}
                                error={errors.clientSurname?.message}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender *
                            </label>
                            <select
                                {...register('gender', {
                                    required: 'Gender is required',
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                disabled={isLoading}
                            >
                                <option value="">Select gender</option>
                                {GENDER_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                            )}
                        </div>

                        {/* Job Title and Company */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Job Title"
                                placeholder="Enter job title (optional)"
                                {...register('jobTitle')}
                                disabled={isLoading}
                            />

                            <Input
                                label="Company"
                                placeholder="Enter company name (optional)"
                                {...register('company')}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Phone Number *"
                                placeholder="Enter phone number"
                                {...register('phone', {
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^[\+]?[(]?[\d\s\-\(\)]{7,}$/,
                                        message: 'Please enter a valid phone number',
                                    },
                                })}
                                error={errors.phone?.message}
                                disabled={isLoading}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="Enter email address (optional)"
                                {...register('email', {
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Please enter a valid email address',
                                    },
                                })}
                                error={errors.email?.message}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <textarea
                                {...register('address', {
                                    required: 'Address is required',
                                    minLength: {
                                        value: 10,
                                        message: 'Address must be at least 10 characters',
                                    },
                                })}
                                placeholder="Enter full address"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                disabled={isLoading}
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                                className="min-w-[120px]"
                            >
                                {isLoading ? 'Saving...' : isEditing ? 'Update Client' : 'Create Client'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ClientForm