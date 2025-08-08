// src/components/forms/VehicleForm.tsx
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Card, CardContent, CardHeader, Button, Input, Loading } from '@/components/ui'
import { CreateVehicleRequest, Vehicle } from '@/services/api/vehicles'
import { useCreateVehicle, useUpdateVehicle } from '@/hooks/useVehicles'
import { useClients } from '@/hooks/useClients'
import { X, ChevronDown } from 'lucide-react'

interface VehicleFormProps {
    vehicle?: Vehicle | null
    preSelectedClientId?: string
    onClose: () => void
    onSuccess?: () => void
}

// Common car colors for dropdown suggestions
const COMMON_COLORS = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
    'Orange', 'Purple', 'Brown', 'Gold', 'Beige', 'Maroon', 'Navy'
]

export const VehicleForm: React.FC<VehicleFormProps> = ({
                                                            vehicle,
                                                            preSelectedClientId,
                                                            onClose,
                                                            onSuccess
                                                        }) => {
    const isEditing = !!vehicle
    const createVehicle = useCreateVehicle()
    const updateVehicle = useUpdateVehicle()
    const { data: clients, isLoading: clientsLoading } = useClients()

    // Color field state
    const [colorInput, setColorInput] = useState('')
    const [showColorDropdown, setShowColorDropdown] = useState(false)
    const [filteredColors, setFilteredColors] = useState(COMMON_COLORS)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        control,
        watch
    } = useForm<CreateVehicleRequest>({
        defaultValues: {
            model: '',
            regNumber: '',
            make: '',
            color: '',
            chassisNumber: '',
            clientId: preSelectedClientId || ''
        }
    })

    // Set form values when editing
    useEffect(() => {
        if (vehicle) {
            setValue('model', vehicle.model)
            setValue('regNumber', vehicle.regNumber)
            setValue('make', vehicle.make)
            setValue('color', vehicle.color)
            setValue('chassisNumber', vehicle.chassisNumber)
            setValue('clientId', vehicle.clientId)
            setColorInput(vehicle.color)
        } else if (preSelectedClientId) {
            setValue('clientId', preSelectedClientId)
        }
    }, [vehicle, preSelectedClientId, setValue])

    // Handle color input changes
    useEffect(() => {
        const filtered = COMMON_COLORS.filter(color =>
            color.toLowerCase().includes(colorInput.toLowerCase())
        )
        setFilteredColors(filtered)
    }, [colorInput])

    const onSubmit = async (data: CreateVehicleRequest) => {
        try {
            if (isEditing && vehicle) {
                await updateVehicle.mutateAsync({ id: vehicle.id, data })
            } else {
                await createVehicle.mutateAsync(data)
            }
            reset()
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    const isLoading = createVehicle.isPending || updateVehicle.isPending

    const handleColorSelect = (color: string) => {
        setColorInput(color)
        setValue('color', color)
        setShowColorDropdown(false)
    }

    const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setColorInput(value)
        setValue('color', value)
        setShowColorDropdown(true)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Client Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Owner *
                            </label>
                            {clientsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loading size="sm" />
                                    <span className="ml-2 text-sm text-gray-500">Loading clients...</span>
                                </div>
                            ) : (
                                <Controller
                                    name="clientId"
                                    control={control}
                                    rules={{ required: 'Vehicle owner is required' }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                            disabled={isLoading}
                                        >
                                            <option value="">Select vehicle owner</option>
                                            {clients?.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.clientName} {client.clientSurname}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            )}
                            {errors.clientId && (
                                <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
                            )}
                        </div>

                        {/* Make and Model */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Make *"
                                placeholder="e.g., Toyota, Honda, BMW"
                                {...register('make', {
                                    required: 'Vehicle make is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Make must be at least 2 characters',
                                    },
                                })}
                                error={errors.make?.message}
                                disabled={isLoading}
                            />

                            <Input
                                label="Model *"
                                placeholder="e.g., Camry, Civic, X3"
                                {...register('model', {
                                    required: 'Vehicle model is required',
                                    minLength: {
                                        value: 1,
                                        message: 'Model is required',
                                    },
                                })}
                                error={errors.model?.message}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Registration Number and Color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Registration Number *"
                                placeholder="e.g., ABC-123, 123-ABC"
                                {...register('regNumber', {
                                    required: 'Registration number is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Registration number must be at least 3 characters',
                                    },
                                })}
                                error={errors.regNumber?.message}
                                disabled={isLoading}
                            />

                            {/* Color Field with Dropdown */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={colorInput}
                                        onChange={handleColorInputChange}
                                        onFocus={() => setShowColorDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowColorDropdown(false), 200)}
                                        placeholder="Type or select color"
                                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                        disabled={isLoading}
                                        {...register('color', {
                                            required: 'Vehicle color is required',
                                        })}
                                    />
                                    <ChevronDown
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                                        onClick={() => setShowColorDropdown(!showColorDropdown)}
                                    />

                                    {/* Color Dropdown */}
                                    {showColorDropdown && filteredColors.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                            {filteredColors.map((color) => (
                                                <div
                                                    key={color}
                                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                                    onClick={() => handleColorSelect(color)}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-4 h-4 rounded border border-gray-300"
                                                            style={{ backgroundColor: color.toLowerCase() }}
                                                        />
                                                        <span>{color}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.color && (
                                    <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Chassis Number */}
                        <div>
                            <Input
                                label="Chassis Number (VIN) *"
                                placeholder="Enter 17-character chassis number"
                                {...register('chassisNumber', {
                                    required: 'Chassis number is required',
                                    minLength: {
                                        value: 10,
                                        message: 'Chassis number must be at least 10 characters',
                                    },
                                    maxLength: {
                                        value: 17,
                                        message: 'Chassis number cannot exceed 17 characters',
                                    },
                                })}
                                error={errors.chassisNumber?.message}
                                disabled={isLoading}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Usually found on the dashboard, driver's side door, or engine bay
                            </p>
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
                                {isLoading ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Add Vehicle'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}