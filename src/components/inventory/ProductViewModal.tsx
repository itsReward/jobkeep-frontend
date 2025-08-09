// src/pages/inventory/modals/ProductViewModal.tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Edit,
    Package,
    DollarSign,
    BarChart3,
    Truck,
    Tags,
    Car,
    Calendar,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { productService } from '@/services/api/inventory'
import { formatCurrency, formatDate, formatStockLevel } from '@/utils/format'

interface ProductViewModalProps {
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    productId: string | null
}

export const ProductViewModal: React.FC<ProductViewModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onEdit,
                                                                      productId,
                                                                  }) => {
    const { data: product, isLoading } = useQuery({
        queryKey: ['products', productId, 'full'],
        queryFn: () => productService.getByIdFull(productId!),
        enabled: !!productId && isOpen,
    })

    if (!isOpen) return null

    const stockStatus = product ? formatStockLevel(product.stockLevel, product.minStockLevel) : null
    const profitMargin = product?.costPrice && product.unitPrice > 0
        ? ((product.unitPrice - product.costPrice) / product.unitPrice * 100).toFixed(2)
        : null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={product ? product.productName : 'Product Details'}
            size="xl"
        >
            {isLoading ? (
                <div className="py-8">
                    <Loading size="lg" />
                </div>
            ) : product ? (
                <div className="space-y-6">
                    {/* Header with Status */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{product.productName}</h2>
                                <Badge variant={product.isActive ? 'success' : 'secondary'}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <p className="text-gray-600">Product Code: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{product.productCode}</code></p>
                            {product.description && (
                                <p className="text-gray-600 mt-2">{product.description}</p>
                            )}
                        </div>
                        <Button onClick={onEdit} className="ml-4">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Product
                        </Button>
                    </div>

                    {/* Stock Alert */}
                    {stockStatus && (stockStatus.level === 'low' || stockStatus.level === 'out') && (
                        <div className={`rounded-lg p-4 ${
                            stockStatus.level === 'out'
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-orange-50 border border-orange-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={`h-5 w-5 ${
                                    stockStatus.level === 'out' ? 'text-red-600' : 'text-orange-600'
                                }`} />
                                <p className={`font-medium ${
                                    stockStatus.level === 'out' ? 'text-red-800' : 'text-orange-800'
                                }`}>
                                    {stockStatus.label}: {product.stockLevel} units remaining
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Main Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pricing & Financial */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Pricing Information
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Unit Price</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {formatCurrency(product.unitPrice)}
                                        </p>
                                    </div>
                                    {product.costPrice && (
                                        <div>
                                            <p className="text-sm text-gray-600">Cost Price</p>
                                            <p className="text-lg font-medium text-gray-900">
                                                {formatCurrency(product.costPrice)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {profitMargin && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">Profit Margin</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-lg font-medium text-gray-900">{profitMargin}%</p>
                                            <Badge variant={parseFloat(profitMargin) > 20 ? 'success' : parseFloat(profitMargin) > 10 ? 'warning' : 'error'}>
                                                {parseFloat(profitMargin) > 20 ? 'Excellent' : parseFloat(profitMargin) > 10 ? 'Good' : 'Low'}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">Inventory Value</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {formatCurrency(product.unitPrice * product.stockLevel)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Based on {product.stockLevel} units at {formatCurrency(product.unitPrice)} each
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Information */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Stock Information
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Current Stock</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-2xl font-bold text-gray-900">{product.stockLevel}</p>
                                            {stockStatus && (
                                                <Badge variant={
                                                    stockStatus.level === 'out' ? 'error' :
                                                        stockStatus.level === 'low' ? 'warning' : 'success'
                                                }>
                                                    {stockStatus.label}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Minimum Level</p>
                                        <p className="text-2xl font-bold text-orange-600">{product.minStockLevel}</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">Stock Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {product.stockLevel === 0 ? (
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                        ) : product.stockLevel <= product.minStockLevel ? (
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}
                                        <span className={`text-sm font-medium ${
                                            product.stockLevel === 0 ? 'text-red-600' :
                                                product.stockLevel <= product.minStockLevel ? 'text-orange-600' : 'text-green-600'
                                        }`}>
                      {product.stockLevel === 0 ? 'Out of Stock' :
                          product.stockLevel <= product.minStockLevel ? 'Reorder Required' : 'Stock Level Healthy'}
                    </span>
                                    </div>
                                </div>

                                {product.stockLevel > product.minStockLevel && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">Days Until Reorder</p>
                                        <p className="text-lg font-medium text-gray-900">
                                            {product.stockLevel - product.minStockLevel} units above minimum
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Supplier Information */}
                    {product.supplierName && (
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Supplier Information
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{product.supplierName}</p>
                                        <p className="text-sm text-gray-500">Primary Supplier</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Categories and Vehicle Compatibility */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Categories */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Tags className="h-5 w-5" />
                                    Categories ({product.categories.length})
                                </h3>
                            </CardHeader>
                            <CardContent>
                                {product.categories.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {product.categories.map((category, index) => (
                                            <Badge key={index} variant="primary">
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No categories assigned</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vehicle Compatibility */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Vehicle Compatibility ({product.compatibleVehicles.length})
                                </h3>
                            </CardHeader>
                            <CardContent>
                                {product.compatibleVehicles.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {product.compatibleVehicles.map((vehicle, index) => (
                                            <Badge key={index} variant="secondary">
                                                {vehicle}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No vehicle compatibility set</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timestamps */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Record Information
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Created</p>
                                    <p className="font-medium">{formatDate(product.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Last Updated</p>
                                    <p className="font-medium">{formatDate(product.updatedAt)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Product
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Product not found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        The product you're looking for doesn't exist or has been deleted.
                    </p>
                </div>
            )}
        </Modal>
    )
}