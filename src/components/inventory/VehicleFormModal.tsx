// src/pages/inventory/modals/VehicleFormModal.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui'
import { productVehicleService } from '@/services/api/inventory'
import { ProductVehicle, CreateProductVehicle } from '@/types'

const schema = yup.object({
    vehicleMake: yup.string().required('Vehicle make is required').min(2, 'Make must be at least 2 characters'),
    vehicleModel: yup.string().required('Vehicle model is required').min(1, 'Model must be at least 1 character'),
    yearRange: yup.string(),
    engineType: yup.string(),
    isActive: yup.boolean(),
})

interface VehicleFormModalProps {
    isOpen: boolean
    onClose: () => void
    vehicle?: ProductVehicle | null
    mode: 'create' | 'edit'
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      vehicle,
                                                                      mode,
                                                                  }) => {
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateProductVehicle>({
        resolver: yupResolver(schema),
        defaultValues: {
            vehicleMake: vehicle?.vehicleMake || '',
            vehicleModel: vehicle?.vehicleModel || '',
            yearRange: vehicle?.yearRange || '',
            engineType: vehicle?.engineType || '',
            isActive: vehicle?.isActive ?? true,
        },
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: productVehicleService.create.bind(productVehicleService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-vehicles'] })
            toast.success('Vehicle type created successfully!')
            onClose()
            reset()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create vehicle type')
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ProductVehicle }) =>
            productVehicleService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-vehicles'] })
            toast.success('Vehicle type updated successfully!')
            onClose()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update vehicle type')
        },
    })

    const onSubmit = (data: CreateProductVehicle) => {
        if (mode === 'create') {
            createMutation.mutate(data)
        } else if (vehicle) {
            const updateData: ProductVehicle = {
                ...vehicle,
                ...data,
            }
            updateMutation.mutate({ id: vehicle.vehicleId, data: updateData })
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create New Vehicle Type' : `Edit ${vehicle?.vehicleMake} ${vehicle?.vehicleModel}`}
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vehicle Make */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle Make *
                        </label>
                        <Input
                            {...register('vehicleMake')}
                            placeholder="e.g., Toyota, BMW, Ford"
                            error={errors.vehicleMake?.message}
                        />
                    </div>

                    {/* Vehicle Model */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle Model *
                        </label>
                        <Input
                            {...register('vehicleModel')}
                            placeholder="e.g., Corolla, X3, F-150"
                            error={errors.vehicleModel?.message}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Year Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year Range
                        </label>
                        <Input
                            {...register('yearRange')}
                            placeholder="e.g., 2010-2020, 2015+"
                            error={errors.yearRange?.message}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Optional: Specify which years this applies to
                        </p>
                    </div>

                    {/* Engine Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Engine Type
                        </label>
                        <Input
                            {...register('engineType')}
                            placeholder="e.g., 2.0L I4, V6, Diesel"
                            error={errors.engineType?.message}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Optional: Specify engine specifications
                        </p>
                    </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                    <input
                        {...register('isActive')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                        Vehicle type is active
                    </label>
                </div>

                {/* Help Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Vehicle types help categorize products by compatibility.
                        Products can be assigned to multiple vehicle types for broader compatibility.
                    </p>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loading size="sm" className="mr-2" />}
                        {mode === 'create' ? 'Create Vehicle Type' : 'Update Vehicle Type'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}