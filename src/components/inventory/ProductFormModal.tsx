// src/components/inventory/ProductFormModal.tsx - FIXED VERSION
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui'
import { productService, productCategoryService, supplierService } from '@/services/api/inventory'
import { Product, CreateProductRequest } from '@/types'

const schema = yup.object({
    productCode: yup.string().required('Product code is required'),
    productName: yup.string().required('Product name is required'),
    description: yup.string(),
    categoryId: yup.string().required('Category is required'),
    brand: yup.string().required('Brand is required'),
    unitOfMeasure: yup.string().required('Unit of measure is required'),
    currentStock: yup.number().min(0, 'Stock must be positive').integer().required('Current stock is required'),
    minimumStock: yup.number().min(0, 'Minimum stock must be positive').integer().required('Minimum stock is required'),
    maximumStock: yup.number().min(0, 'Maximum stock must be positive').integer().required('Maximum stock is required'),
    costPrice: yup.number().min(0, 'Cost price must be positive').required('Cost price is required'),
    sellingPrice: yup.number().min(0, 'Selling price must be positive').required('Selling price is required'),
    markupPercentage: yup.number().min(0, 'Markup percentage must be positive'),
    supplierId: yup.string().required('Supplier is required'),
})

interface ProductFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    product?: Product | null
    mode: 'create' | 'edit'
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onSuccess,
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
        setValue,
    } = useForm<CreateProductRequest>({
        resolver: yupResolver(schema),
    })

    // Fetch categories and suppliers
    const { data: categories = [] } = useQuery({
        queryKey: ['product-categories'],
        queryFn: productCategoryService.getAll,
        enabled: isOpen,
    })

    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getAll,
        enabled: isOpen,
    })

    // Watch cost and selling price to calculate markup
    const costPrice = watch('costPrice')
    const sellingPrice = watch('sellingPrice')

    // Auto-calculate markup percentage
    useEffect(() => {
        if (costPrice > 0 && sellingPrice > costPrice) {
            const markup = ((sellingPrice - costPrice) / costPrice) * 100
            setValue('markupPercentage', parseFloat(markup.toFixed(2)))
        }
    }, [costPrice, sellingPrice, setValue])

    // Reset form when modal opens/closes or product changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && product) {
                reset({
                    productCode: product.productCode,
                    productName: product.productName,
                    description: product.description,
                    categoryId: product.categoryId,
                    brand: product.brand,
                    unitOfMeasure: product.unitOfMeasure,
                    currentStock: product.currentStock,
                    minimumStock: product.minimumStock,
                    maximumStock: product.maximumStock,
                    costPrice: product.costPrice,
                    sellingPrice: product.sellingPrice,
                    markupPercentage: product.markupPercentage,
                    supplierId: product.supplierId,
                })
            } else {
                reset({
                    productCode: '',
                    productName: '',
                    description: '',
                    categoryId: '',
                    brand: '',
                    unitOfMeasure: 'pieces',
                    currentStock: 0,
                    minimumStock: 1,
                    maximumStock: 100,
                    costPrice: 0,
                    sellingPrice: 0,
                    markupPercentage: 0,
                    supplierId: '',
                })
            }
        }
    }, [isOpen, mode, product, reset])

    // Create mutation
    const createMutation = useMutation({
        mutationFn: productService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            onSuccess()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create product')
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductRequest> }) =>
            productService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            onSuccess()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update product')
        },
    })

    const onSubmit = (data: CreateProductRequest) => {
        if (mode === 'edit' && product) {
            updateMutation.mutate({ id: product.productId, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create New Product' : 'Edit Product'}
            size="xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Code *
                            </label>
                            <Input
                                {...register('productCode')}
                                placeholder="Enter product code"
                                error={errors.productCode?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </label>
                            <Input
                                {...register('productName')}
                                placeholder="Enter product name"
                                error={errors.productName?.message}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            placeholder="Enter product description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand *
                            </label>
                            <Input
                                {...register('brand')}
                                placeholder="Enter brand name"
                                error={errors.brand?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unit of Measure *
                            </label>
                            <select
                                {...register('unitOfMeasure')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select unit</option>
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="lbs">Pounds</option>
                                <option value="liters">Liters</option>
                                <option value="ml">Milliliters</option>
                                <option value="meters">Meters</option>
                                <option value="cm">Centimeters</option>
                                <option value="boxes">Boxes</option>
                                <option value="packs">Packs</option>
                                <option value="sets">Sets</option>
                            </select>
                            {errors.unitOfMeasure && (
                                <p className="mt-1 text-sm text-red-600">{errors.unitOfMeasure.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                {...register('categoryId')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Supplier *
                            </label>
                            <select
                                {...register('supplierId')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select supplier</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.supplierId} value={supplier.supplierId}>
                                        {supplier.supplierName}
                                    </option>
                                ))}
                            </select>
                            {errors.supplierId && (
                                <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stock Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        Stock Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Stock *
                            </label>
                            <Input
                                {...register('currentStock', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                error={errors.currentStock?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Stock *
                            </label>
                            <Input
                                {...register('minimumStock', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                step="1"
                                placeholder="1"
                                error={errors.minimumStock?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Stock *
                            </label>
                            <Input
                                {...register('maximumStock', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                step="1"
                                placeholder="100"
                                error={errors.maximumStock?.message}
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        Pricing Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cost Price *
                            </label>
                            <Input
                                {...register('costPrice', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                error={errors.costPrice?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selling Price *
                            </label>
                            <Input
                                {...register('sellingPrice', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                error={errors.sellingPrice?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Markup Percentage
                            </label>
                            <Input
                                {...register('markupPercentage', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                readOnly
                                className="bg-gray-50"
                                error={errors.markupPercentage?.message}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Automatically calculated based on cost and selling price
                            </p>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    {costPrice > 0 && sellingPrice > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Pricing Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-600">Profit per Unit:</span>
                                    <span className="font-medium text-blue-900 ml-2">
                                        ${(sellingPrice - costPrice).toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-blue-600">Markup:</span>
                                    <span className="font-medium text-blue-900 ml-2">
                                        {((sellingPrice - costPrice) / costPrice * 100).toFixed(2)}%
                                    </span>
                                </div>
                                <div>
                                    <span className="text-blue-600">Margin:</span>
                                    <span className="font-medium text-blue-900 ml-2">
                                        {((sellingPrice - costPrice) / sellingPrice * 100).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loading size="sm" className="mr-2" />}
                        {mode === 'create' ? 'Create Product' : 'Update Product'}
                    </Button>
                </div>

                {/* Help Text */}
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Product code should be unique and easy to identify</li>
                        <li>Set minimum stock to trigger reorder alerts</li>
                        <li>Maximum stock helps prevent overstocking</li>
                        <li>Markup percentage is automatically calculated</li>
                    </ul>
                </div>
            </form>
        </Modal>
    )
}