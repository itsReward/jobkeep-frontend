// src/pages/inventory/modals/SupplierFormModal.tsx
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
import { supplierService } from '@/services/api/inventory'
import { Supplier, CreateSupplierDto } from '@/types'

const schema = yup.object({
    supplierName: yup.string().required('Supplier name is required').min(2, 'Supplier name must be at least 2 characters'),
    companyName: yup.string(),
    contactPerson: yup.string(),
    email: yup.string().email('Invalid email format'),
    phone: yup.string(),
    address: yup.string(),
    paymentTerms: yup.string(),
    taxNumber: yup.string(),
})

interface SupplierFormModalProps {
    isOpen: boolean
    onClose: () => void
    supplier?: Supplier | null
    mode: 'create' | 'edit'
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        supplier,
                                                                        mode,
                                                                    }) => {
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateSupplierDto>({
        resolver: yupResolver(schema),
        defaultValues: {
            supplierName: supplier?.supplierName || '',
            companyName: supplier?.companyName || '',
            contactPerson: supplier?.contactPerson || '',
            email: supplier?.email || '',
            phone: supplier?.phone || '',
            address: supplier?.address || '',
            paymentTerms: supplier?.paymentTerms || '',
            taxNumber: supplier?.taxNumber || '',
        },
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: supplierService.create.bind(supplierService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
            toast.success('Supplier created successfully!')
            onClose()
            reset()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create supplier')
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateSupplierDto }) =>
            supplierService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
            toast.success('Supplier updated successfully!')
            onClose()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update supplier')
        },
    })

    const onSubmit = (data: CreateSupplierDto) => {
        if (mode === 'create') {
            createMutation.mutate(data)
        } else if (supplier) {
            updateMutation.mutate({ id: supplier.supplierId, data })
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
    onClose={onClose}
    title={mode === 'create' ? 'Create New Supplier' : `Edit ${supplier?.supplierName}`}
    size="lg"
    >
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Supplier Name */}
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        Supplier Name *
    </label>
    <Input
    {...register('supplierName')}
    placeholder="e.g., AutoParts Pro"
    error={errors.supplierName?.message}
    />
    </div>

    {/* Company Name */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
        Company Name
    </label>
    <Input
    {...register('companyName')}
    placeholder="e.g., AutoParts Pro Ltd"
    error={errors.companyName?.message}
    />
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Contact Person */}
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        Contact Person
    </label>
    <Input
    {...register('contactPerson')}
    placeholder="e.g., John Smith"
    error={errors.contactPerson?.message}
    />
    </div>

    {/* Email */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
        Email
        </label>
        <Input
    {...register('email')}
    type="email"
    placeholder="e.g., john@autopartspro.com"
    error={errors.email?.message}
    />
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Phone */}
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number
    </label>
    <Input
    {...register('phone')}
    type="tel"
    placeholder="e.g., +1234567890"
    error={errors.phone?.message}
    />
    </div>

    {/* Tax Number */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
        Tax Number
    </label>
    <Input
    {...register('taxNumber')}
    placeholder="e.g., 123456789"
    error={errors.taxNumber?.message}
    />
    </div>
    </div>

    {/* Address */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
        Address
        </label>
        <textarea
    {...register('address')}
    rows={3}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
    placeholder="Full business address..."
        />
        {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
        </div>

    {/* Payment Terms */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Terms
    </label>
    <select
    {...register('paymentTerms')}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
    >
    <option value="">Select payment terms</option>
    <option value="Net 15">Net 15 days</option>
    <option value="Net 30">Net 30 days</option>
    <option value="Net 45">Net 45 days</option>
    <option value="Net 60">Net 60 days</option>
    <option value="COD">Cash on Delivery</option>
    <option value="Prepaid">Prepaid</option>
        <option value="2/10 Net 30">2/10 Net 30</option>
    <option value="1/15 Net 45">1/15 Net 45</option>
    <option value="Other">Other</option>
        </select>
    {errors.paymentTerms && (
        <p className="mt-1 text-sm text-red-600">{errors.paymentTerms.message}</p>
    )}
    </div>

    {/* Help Text */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
    <p className="text-sm text-blue-800">
        <strong>Tip:</strong> Complete supplier information helps with procurement,
    reporting, and maintaining good vendor relationships. All fields except supplier name are optional.
    </p>
    </div>

    {/* Form Actions */}
    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
    <Button type="button" variant="outline" onClick={onClose}>
        Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
    {isLoading && <Loading size="sm" className="mr-2" />}
    {mode === 'create' ? 'Create Supplier' : 'Update Supplier'}
    </Button>
    </div>
    </form>
    </Modal>
)
}