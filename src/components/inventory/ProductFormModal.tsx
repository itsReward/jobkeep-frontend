// src/pages/inventory/modals/ProductFormModal.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { Input } from '@/components/ui/Input.tsx'
import { Loading } from '@/components/ui'
import { productService, supplierService } from '@/services/api/inventory.ts'
import { Product, CreateProductDto } from '@/types'

const schema = yup.object({
    productCode: yup.string().required('Product code is required'),
    productName: yup.string().required('Product name is required'),
    description: yup.string(),
    unitPrice: yup.number().min(0, 'Price must be positive').required('Unit price is required'),
    costPrice: yup.number().min(0, 'Cost price must be positive'),
    stockLevel: yup.number().min(0, 'Stock level must be positive').integer(),
    minStockLevel: yup.number().min(0, 'Minimum stock level must be positive').integer(),
    supplierId: yup.string(),
    isActive: yup.boolean(),
})

interface ProductFormModalProps {
    isOpen: boolean
    onClose: () => void
    product?: Product | null
    mode: 'create' | 'edit'
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      product,
                                                                      mode,
                                                                  }) => {
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<CreateProductDto>({
        resolver: yupResolver(schema),
        defaultValues: {
            productCode: product?.productCode || '',
            productName: product?.productName || '',
            description: product?.description || '',
            unitPrice: product?.unitPrice || 0,
            costPrice: product?.costPrice || 0,
            stockLevel: product?.stockLevel || 0,
            minStockLevel: product?.minStockLevel || 0,
            supplierId: product?.supplierId || '',
            isActive: product?.isActive ?? true,
        },
    })

    // Fetch suppliers for dropdown
    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getAll.bind(supplierService),
        enabled: isOpen,
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: productService.create.bind(productService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Product created successfully!')
            onClose()
            reset()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create product')
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateProductDto }) =>
            productService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Product updated successfully!')
            onClose()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update product')
        },
    })

    const onSubmit = (data: CreateProductDto) => {
        if (mode === 'create') {
            createMutation.mutate(data)
        } else if (product) {
            updateMutation.mutate({ id: product.productId, data })
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    // Calculate profit margin
    const unitPrice = watch('unitPrice')
    const costPrice = watch('costPrice')
    const profitMargin = costPrice && unitPrice > 0
        ? ((unitPrice - costPrice) / unitPrice * 100).toFixed(2)
        : null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create New Product' : `Edit ${product?.productName}`}
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Code *
                        </label>
                        <Input
                            {...register('productCode')}
                            placeholder="e.g., OIL-5W30-4L"
                            error={errors.productCode?.message}
                        />
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <Input
                            {...register('productName')}
                            placeholder="e.g., Engine Oil 5W-30 4L"
                            error={errors.productName?.message}
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Product description..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unit Price (USD) *
                        </label>
                        <Input
                            {...register('unitPrice', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            error={errors.unitPrice?.message}
                        />
                    </div>

                    {/* Cost Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cost Price (USD)
                        </label>
                        <Input
                            {...register('costPrice', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            error={errors.costPrice?.message}
                        />
                        {profitMargin && (
                            <p className="text-sm text-gray-600 mt-1">
                                Profit Margin: {profitMargin}%
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stock Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Stock Level
                        </label>
                        <Input
                            {...register('stockLevel', { valueAsNumber: true })}
                            type="number"
                            placeholder="0"
                            error={errors.stockLevel?.message}
                        />
                    </div>

                    {/* Minimum Stock Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Stock Level
                        </label>
                        <Input
                            {...register('minStockLevel', { valueAsNumber: true })}
                            type="number"
                            placeholder="0"
                            error={errors.minStockLevel?.message}
                        />
                    </div>
                </div>

                {/* Supplier */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Supplier
                    </label>
                    <select
                        {...register('supplierId')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Select a supplier (optional)</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.supplierId} value={supplier.supplierId}>
                                {supplier.supplierName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                    <input
                        {...register('isActive')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                        Product is active
                    </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loading size="sm" className="mr-2" />}
                        {mode === 'create' ? 'Create Product' : 'Update Product'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}