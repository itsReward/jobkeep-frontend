// src/components/inventory/ProductViewModal.tsx - FIXED VERSION
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Edit,
    Package,
    DollarSign,
    BarChart3,
    Truck,
    Tags,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Info,
    TrendingUp,
    Warehouse
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { productService } from '@/services/api/inventory'
import { formatCurrency } from '@/utils/format'
import { getStockStatusInfo, calculateMarkupPercentage } from '@/utils/productHelpers'
import { Product } from '@/types'

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
    const { data: product, isLoading, error } = useQuery({
        queryKey: ['products', productId, 'full'],
        queryFn: () => productService.getByIdFull(productId!),
        enabled: !!productId && isOpen,
    })

    if (!isOpen) return null

    const stockInfo = product ? getStockStatusInfo(product) : null
    const markupPercentage = product ? calculateMarkupPercentage(product.costPrice, product.sellingPrice) : 0

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Product Details"
            size="xl"
        >
            {isLoading ? (
                <div className="py-8 text-center">
                    <Loading className="mx-auto mb-4" />
                    <p className="text-gray-600">Loading product details...</p>
                </div>
            ) : error ? (
                <div className="py-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Product</h3>
                    <p className="text-red-600 mb-4">Failed to load product details</p>
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
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
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Package className="h-4 w-4" />
                                    {product.productCode}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Tags className="h-4 w-4" />
                                    {product.categoryName}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Truck className="h-4 w-4" />
                                    {product.supplierName}
                                </span>
                            </div>
                        </div>
                        <Button onClick={onEdit} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Product
                        </Button>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Product Information */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Product Information
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <p className="text-gray-900 font-medium">{product.productName}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product Code</label>
                                    <p className="text-gray-900 font-mono">{product.productCode}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                                    <p className="text-gray-900">{product.brand}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <p className="text-gray-900">{product.description || 'No description provided'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit of Measure</label>
                                    <p className="text-gray-900">{product.unitOfMeasure}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <div className="flex items-center gap-2">
                                        <Tags className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-900">{product.categoryName}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Supplier</label>
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-900">{product.supplierName}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Information */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Warehouse className="h-5 w-5" />
                                    Stock Information
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-600">Current Stock</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {product.currentStock} {product.unitOfMeasure}
                                        </p>
                                    </div>
                                    {stockInfo && (
                                        <div className="text-right">
                                            <Badge variant={stockInfo.color}>
                                                {stockInfo.label}
                                            </Badge>
                                            <p className="text-xs text-gray-500 mt-1">{stockInfo.description}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Minimum Stock</label>
                                        <p className="text-gray-900 font-medium">
                                            {product.minimumStock} {product.unitOfMeasure}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Maximum Stock</label>
                                        <p className="text-gray-900 font-medium">
                                            {product.maximumStock} {product.unitOfMeasure}
                                        </p>
                                    </div>
                                </div>

                                {/* Stock Level Indicator */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Level</label>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                stockInfo?.color === 'destructive' ? 'bg-red-500' :
                                                    stockInfo?.color === 'warning' ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                            }`}
                                            style={{
                                                width: `${Math.min(100, Math.max(0, (product.currentStock / Math.max(product.maximumStock, 1)) * 100))}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0</span>
                                        <span>Min: {product.minimumStock}</span>
                                        <span>Max: {product.maximumStock}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing Information */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Pricing Information
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-600 mb-1">Cost Price</p>
                                        <p className="text-xl font-bold text-blue-900">
                                            {formatCurrency(product.costPrice)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-600 mb-1">Selling Price</p>
                                        <p className="text-xl font-bold text-green-900">
                                            {formatCurrency(product.sellingPrice)}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-purple-600 mb-1">Markup Percentage</p>
                                            <p className="text-xl font-bold text-purple-900">
                                                {markupPercentage.toFixed(2)}%
                                            </p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-purple-400" />
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Profit per Unit</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {formatCurrency(product.sellingPrice - product.costPrice)}
                                    </p>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-orange-600 mb-1">Total Stock Value (Cost)</p>
                                    <p className="text-lg font-medium text-orange-900">
                                        {formatCurrency(product.currentStock * product.costPrice)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Additional Information
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                                    <p className="text-gray-900">
                                        {new Date(product.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                                    <p className="text-gray-900">
                                        {new Date(product.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product ID</label>
                                    <p className="text-gray-900 font-mono text-sm">{product.productId}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button onClick={onEdit} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Product
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
                    <p className="text-gray-600 mb-4">The requested product could not be found.</p>
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            )}
        </Modal>
    )
}