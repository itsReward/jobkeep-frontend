// src/components/inventory/StockAdjustmentModal.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { BarChart3, Plus, Minus, RefreshCw, AlertTriangle, Package } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { productService } from '@/services/api/inventory'
import { Product, StockAdjustment } from '@/types'
import { getStockStatusInfo } from '@/utils/productHelpers'

const schema = yup.object({
    adjustmentQuantity: yup.number()
        .required('Adjustment quantity is required')
        .test('positive', 'Quantity must be greater than 0', (value) => Math.abs(value || 0) > 0),
    reason: yup.string().required('Reason is required'),
    notes: yup.string(),
})

interface StockAdjustmentFormData {
    adjustmentQuantity: number
    reason: string
    notes?: string
}

interface StockAdjustmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    product: Product | null
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
                                                                              isOpen,
                                                                              onClose,
                                                                              onSuccess,
                                                                              product,
                                                                          }) => {
    const queryClient = useQueryClient()
    const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('ADJUSTMENT')
    const [previewStock, setPreviewStock] = useState(0)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<StockAdjustmentFormData>({
        resolver: yupResolver(schema),
    })

    const adjustmentQuantity = watch('adjustmentQuantity')

    // Update preview stock when quantity changes
    useEffect(() => {
        if (product && adjustmentQuantity !== undefined) {
            let newStock: number
            switch (adjustmentType) {
                case 'IN':
                    newStock = product.currentStock + Math.abs(adjustmentQuantity)
                    break
                case 'OUT':
                    newStock = Math.max(0, product.currentStock - Math.abs(adjustmentQuantity))
                    break
                case 'ADJUSTMENT':
                    newStock = Math.max(0, adjustmentQuantity)
                    break
                default:
                    newStock = product.currentStock
            }
            setPreviewStock(newStock)
        }
    }, [product, adjustmentQuantity, adjustmentType])

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen && product) {
            reset({
                adjustmentQuantity: 0,
                reason: '',
                notes: '',
            })
            setAdjustmentType('ADJUSTMENT')
            setPreviewStock(product.currentStock)
        }
    }, [isOpen, product, reset])

    // Handle adjustment type change
    const handleTypeChange = (type: 'IN' | 'OUT' | 'ADJUSTMENT') => {
        setAdjustmentType(type)
        setValue('adjustmentQuantity', 0)

        // Set default reasons
        switch (type) {
            case 'IN':
                setValue('reason', 'Stock received from supplier')
                break
            case 'OUT':
                setValue('reason', 'Stock used or damaged')
                break
            case 'ADJUSTMENT':
                setValue('reason', 'Stock count adjustment')
                break
        }
    }

    // Stock adjustment mutation
    const adjustmentMutation = useMutation({
        mutationFn: (adjustment: StockAdjustment) => productService.adjustStock(adjustment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            onSuccess()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to adjust stock')
        },
    })

    const onSubmit = (data: StockAdjustmentFormData) => {
        if (!product) return

        let finalQuantity: number
        switch (adjustmentType) {
            case 'IN':
                finalQuantity = Math.abs(data.adjustmentQuantity)
                break
            case 'OUT':
                finalQuantity = -Math.abs(data.adjustmentQuantity)
                break
            case 'ADJUSTMENT':
                finalQuantity = data.adjustmentQuantity - product.currentStock
                break
            default:
                finalQuantity = 0
        }

        const adjustment: StockAdjustment = {
            productId: product.productId,
            adjustmentQuantity: finalQuantity,
            reason: data.reason,
            notes: data.notes,
        }

        adjustmentMutation.mutate(adjustment)
    }

    if (!product) return null

    const currentStockInfo = getStockStatusInfo(product)
    const previewStockInfo = previewStock !== undefined ? getStockStatusInfo({
        ...product,
        currentStock: previewStock
    }) : null

    const isLoading = adjustmentMutation.isPending

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Stock Adjustment"
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Information */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h3 className="font-medium text-gray-900">{product.productName}</h3>
                                    <p className="text-sm text-gray-500">Code: {product.productCode}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Current Stock</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold">{product.currentStock} {product.unitOfMeasure}</p>
                                    <Badge variant={currentStockInfo.color}>
                                        {currentStockInfo.label}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500">Min: {product.minimumStock} | Max: {product.maximumStock}</p>
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
                                adjustmentType === 'IN'
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
                                adjustmentType === 'OUT'
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
                                adjustmentType === 'ADJUSTMENT'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <RefreshCw className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium">Set Count</div>
                            <div className="text-xs text-gray-500">Set exact count</div>
                        </button>
                    </div>
                </div>

                {/* Quantity Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {adjustmentType === 'ADJUSTMENT' ? 'New Stock Count' : 'Quantity'} *
                    </label>
                    <Input
                        {...register('adjustmentQuantity', { valueAsNumber: true })}
                        type="number"
                        min={adjustmentType === 'ADJUSTMENT' ? 0 : 1}
                        step="1"
                        placeholder={adjustmentType === 'ADJUSTMENT' ? 'Enter new stock count' : 'Enter quantity'}
                        error={errors.adjustmentQuantity?.message}
                    />
                    {adjustmentType === 'OUT' && adjustmentQuantity > product.currentStock && (
                        <div className="mt-2 flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">This will result in negative stock</span>
                        </div>
                    )}
                </div>

                {/* Stock Preview */}
                {previewStock !== product.currentStock && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Stock Preview</h4>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700">Current: {product.currentStock} {product.unitOfMeasure}</p>
                                    <p className="text-sm text-blue-700">
                                        After adjustment: {previewStock} {product.unitOfMeasure}
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        Change: {previewStock > product.currentStock ? '+' : ''}{previewStock - product.currentStock} {product.unitOfMeasure}
                                    </p>
                                </div>
                                {previewStockInfo && (
                                    <Badge variant={previewStockInfo.color}>
                                        {previewStockInfo.label}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                        {adjustmentType === 'IN' && (
                            <>
                                <option value="Stock received from supplier">Stock received from supplier</option>
                                <option value="Return from customer">Return from customer</option>
                                <option value="Production completed">Production completed</option>
                                <option value="Transfer from another location">Transfer from another location</option>
                                <option value="Initial stock entry">Initial stock entry</option>
                                <option value="Other">Other</option>
                            </>
                        )}
                        {adjustmentType === 'OUT' && (
                            <>
                                <option value="Stock used or consumed">Stock used or consumed</option>
                                <option value="Damaged or defective">Damaged or defective</option>
                                <option value="Sold to customer">Sold to customer</option>
                                <option value="Transfer to another location">Transfer to another location</option>
                                <option value="Expired or obsolete">Expired or obsolete</option>
                                <option value="Theft or loss">Theft or loss</option>
                                <option value="Other">Other</option>
                            </>
                        )}
                        {adjustmentType === 'ADJUSTMENT' && (
                            <>
                                <option value="Physical count adjustment">Physical count adjustment</option>
                                <option value="System correction">System correction</option>
                                <option value="Inventory reconciliation">Inventory reconciliation</option>
                                <option value="Audit adjustment">Audit adjustment</option>
                                <option value="Other">Other</option>
                            </>
                        )}
                    </select>
                    {errors.reason && (
                        <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                    </label>
                    <textarea
                        {...register('notes')}
                        placeholder="Enter additional notes or comments"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        rows={3}
                    />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loading size="sm" className="mr-2" />}
                        Apply Adjustment
                    </Button>
                </div>

                {/* Warning for negative stock */}
                {adjustmentType === 'OUT' && adjustmentQuantity > product.currentStock && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-amber-800">Warning: Negative Stock</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                    This adjustment will result in negative stock ({previewStock} {product.unitOfMeasure}).
                                    Please verify this is correct before proceeding.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    )
}