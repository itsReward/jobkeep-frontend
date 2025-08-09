// src/pages/inventory/modals/StockAdjustmentModal.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { BarChart3, Plus, Minus, RefreshCw, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { productService } from '@/services/api/inventory'
import { Product, StockAdjustment } from '@/types'
import { formatCurrency } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'

const schema = yup.object({
    adjustmentType: yup.string().oneOf(['IN', 'OUT', 'ADJUSTMENT']).required('Adjustment type is required'),
    quantity: yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
    reason: yup.string().required('Reason is required'),
    notes: yup.string(),
})

interface StockAdjustmentFormData {
    adjustmentType: 'IN' | 'OUT' | 'ADJUSTMENT'
    quantity: number
    reason: string
    notes?: string
}

interface StockAdjustmentModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
}

const adjustmentReasons = {
    IN: [
        'Purchase/Delivery',
        'Return from Customer',
        'Transfer from Another Location',
        'Found Inventory',
        'Vendor Return',
        'Other',
    ],
    OUT: [
        'Sale/Job Card Usage',
        'Damaged/Defective',
        'Lost/Stolen',
        'Transfer to Another Location',
        'Expired/Obsolete',
        'Other',
    ],
    ADJUSTMENT: [
        'Physical Count Correction',
        'System Error Correction',
        'Initial Stock Setup',
        'Write-off',
        'Other',
    ],
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
                                                                              isOpen,
                                                                              onClose,
                                                                              product,
                                                                          }) => {
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const [selectedType, setSelectedType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<StockAdjustmentFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            adjustmentType: 'IN',
            quantity: 1,
            reason: '',
            notes: '',
        },
    })

    const watchedQuantity = watch('quantity')
    const watchedType = watch('adjustmentType')

    // Stock adjustment mutation
    const adjustmentMutation = useMutation({
        mutationFn: (data: StockAdjustment) => productService.adjustStock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Stock adjustment completed successfully!')
            onClose()
            reset()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to adjust stock')
        },
    })

    const onSubmit = (data: StockAdjustmentFormData) => {
        if (!product || !user) return

        const adjustment: StockAdjustment = {
            productId: product.productId,
            adjustmentType: data.adjustmentType,
            quantity: data.quantity,
            reason: data.reason,
            notes: data.notes,
            adjustedBy: user.username,
            adjustmentDate: new Date().toISOString(),
        }

        adjustmentMutation.mutate(adjustment)
    }

    const handleTypeChange = (type: 'IN' | 'OUT' | 'ADJUSTMENT') => {
        setSelectedType(type)
        setValue('adjustmentType', type)
        setValue('reason', '') // Reset reason when type changes
    }

    const calculateNewStock = () => {
        if (!product || !watchedQuantity) return product?.stockLevel || 0

        switch (watchedType) {
            case 'IN':
                return product.stockLevel + watchedQuantity
            case 'OUT':
                return Math.max(0, product.stockLevel - watchedQuantity)
            case 'ADJUSTMENT':
                return watchedQuantity
            default:
                return product.stockLevel
        }
    }

    const getStockWarning = () => {
        const newStock = calculateNewStock()
        if (!product) return null

        if (newStock === 0) {
            return { type: 'error', message: 'This will result in zero stock' }
        } else if (newStock < product.minStockLevel) {
            return { type: 'warning', message: 'This will result in stock below minimum level' }
        } else if (watchedType === 'OUT' && watchedQuantity > product.stockLevel) {
            return { type: 'error', message: 'Cannot remove more stock than available' }
        }
        return null
    }

    const isLoading = adjustmentMutation.isPending

    if (!product) return null

    const stockWarning = getStockWarning()
    const newStockLevel = calculateNewStock()

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Adjust Stock - ${product.productName}`}
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Info */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">{product.productName}</h3>
                                <p className="text-sm text-gray-500">Code: {product.productCode}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Current Stock</p>
                                <p className="text-xl font-bold">{product.stockLevel}</p>
                                <p className="text-xs text-gray-500">Min: {product.minStockLevel}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Adjustment Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Adjustment Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('IN')}
                            className={`p-4 border rounded-lg text-center transition-colors ${
                                selectedType === 'IN'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <Plus className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium">Stock In</div>
                            <div className="text-xs text-gray-500">Add inventory</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTypeChange('OUT')}
                            className={`p-4 border rounded-lg text-center transition-colors ${
                                selectedType === 'OUT'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <Minus className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium">Stock Out</div>
                            <div className="text-xs text-gray-500">Remove inventory</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTypeChange('ADJUSTMENT')}
                            className={`p-4 border rounded-lg text-center transition-colors ${
                                selectedType === 'ADJUSTMENT'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <RefreshCw className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium">Set Level</div>
                            <div className="text-xs text-gray-500">Set exact amount</div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {watchedType === 'ADJUSTMENT' ? 'New Stock Level' : 'Quantity'}
                        </label>
                        <Input
                            {...register('quantity', { valueAsNumber: true })}
                            type="number"
                            min={watchedType === 'ADJUSTMENT' ? 0 : 1}
                            max={watchedType === 'OUT' ? product.stockLevel : undefined}
                            placeholder={watchedType === 'ADJUSTMENT' ? 'Enter new stock level' : 'Enter quantity'}
                            error={errors.quantity?.message}
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason *
                        </label>
                        <select
                            {...register('reason')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Select a reason</option>
                            {adjustmentReasons[watchedType].map((reason) => (
                                <option key={reason} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>
                        {errors.reason && (
                            <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        {...register('notes')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Optional notes about this adjustment..."
                    />
                </div>

                {/* Stock Preview */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Stock Level Preview
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">Current</p>
                                <p className="text-xl font-bold text-gray-900">{product.stockLevel}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    {watchedType === 'IN' ? 'Adding' : watchedType === 'OUT' ? 'Removing' : 'Setting to'}
                                </p>
                                <p className={`text-xl font-bold ${
                                    watchedType === 'IN' ? 'text-green-600' :
                                        watchedType === 'OUT' ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    {watchedType === 'ADJUSTMENT' ? watchedQuantity || 0 : `${watchedType === 'OUT' ? '-' : '+'}${watchedQuantity || 0}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">New Level</p>
                                <p className={`text-xl font-bold ${
                                    newStockLevel === 0 ? 'text-red-600' :
                                        newStockLevel < product.minStockLevel ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                    {newStockLevel}
                                </p>
                            </div>
                        </div>

                        {/* Value Impact */}
                        {product.costPrice && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 text-center">
                                    Inventory Value Impact: {' '}
                                    <span className={`font-medium ${
                                        watchedType === 'IN' ? 'text-green-600' :
                                            watchedType === 'OUT' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                    {watchedType === 'ADJUSTMENT'
                        ? formatCurrency((newStockLevel - product.stockLevel) * product.costPrice)
                        : `${watchedType === 'OUT' ? '-' : '+'}${formatCurrency((watchedQuantity || 0) * product.costPrice)}`
                    }
                  </span>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Warning Messages */}
                {stockWarning && (
                    <div className={`rounded-lg p-4 ${
                        stockWarning.type === 'error'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-orange-50 border border-orange-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-5 w-5 ${
                                stockWarning.type === 'error' ? 'text-red-600' : 'text-orange-600'
                            }`} />
                            <p className={`font-medium ${
                                stockWarning.type === 'error' ? 'text-red-800' : 'text-orange-800'
                            }`}>
                                {stockWarning.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || (stockWarning?.type === 'error')}
                    >
                        {isLoading && <Loading size="sm" className="mr-2" />}
                        Apply Adjustment
                    </Button>
                </div>
            </form>
        </Modal>
    )
}