// src/pages/inventory/modals/CategoryFormModal.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { Input } from '@/components/ui/Input.tsx'
import { Loading } from '@/components/ui'
import { productCategoryService } from '@/services/api/inventory.ts'
import { ProductCategory, CreateProductCategoryDto } from '@/types'

const schema = yup.object({
    categoryName: yup.string().required('Category name is required').min(2, 'Category name must be at least 2 characters'),
    description: yup.string(),
    isActive: yup.boolean(),
})

interface CategoryFormModalProps {
    isOpen: boolean
    onClose: () => void
    category?: ProductCategory | null
    mode: 'create' | 'edit'
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        category,
                                                                        mode,
                                                                    }) => {
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateProductCategoryDto>({
        resolver: yupResolver(schema),
        defaultValues: {
            categoryName: category?.categoryName || '',
            description: category?.description || '',
            isActive: category?.isActive ?? true,
        },
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: productCategoryService.create.bind(productCategoryService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] })
            toast.success('Category created successfully!')
            onClose()
            reset()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create category')
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateProductCategoryDto }) =>
            productCategoryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] })
            toast.success('Category updated successfully!')
            onClose()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update category')
        },
    })

    const onSubmit = (data: CreateProductCategoryDto) => {
        if (mode === 'create') {
            createMutation.mutate(data)
        } else if (category) {
            updateMutation.mutate({ id: category.categoryId, data })
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create New Category' : `Edit ${category?.categoryName}`}
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Category Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                    </label>
                    <Input
                        {...register('categoryName')}
                        placeholder="e.g., Engine Parts, Fluids, Filters"
                        error={errors.categoryName?.message}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Describe what products belong in this category..."
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                    <input
                        {...register('isActive')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                        Category is active
                    </label>
                </div>

                {/* Help Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Categories help organize your products and make them easier to find.
                        You can assign multiple categories to each product.
                    </p>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loading size="sm" className="mr-2" />}
                        {mode === 'create' ? 'Create Category' : 'Update Category'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}