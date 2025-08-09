// src/pages/inventory/modals/CategoryViewModal.tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Edit,
    Tags,
    Package,
    Calendar,
    BarChart3,
    DollarSign,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { productCategoryService } from '@/services/api/inventory'
import { formatCurrency, formatDate } from '@/utils/format'

interface CategoryViewModalProps {
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    categoryId: string | null
}

export const CategoryViewModal: React.FC<CategoryViewModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onEdit,
                                                                        categoryId,
                                                                    }) => {
    const { data: category, isLoading } = useQuery({
        queryKey: ['product-categories', categoryId, 'with-products'],
        queryFn: () => productCategoryService.getByIdWithProducts(categoryId!),
        enabled: !!categoryId && isOpen,
    })

    if (!isOpen) return null

    const totalValue = category?.products.reduce((sum, product) =>
        sum + (product.unitPrice * product.stockLevel), 0
    ) || 0

    const lowStockProducts = category?.products.filter(product =>
        product.stockLevel <= product.minStockLevel
    ) || []

    const outOfStockProducts = category?.products.filter(product =>
        product.stockLevel === 0
    ) || []

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={category ? category.categoryName : 'Category Details'}
            size="xl"
        >
            {isLoading ? (
                <div className="py-8">
                    <Loading size="lg" />
                </div>
            ) : category ? (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{category.categoryName}</h2>
                                <Badge variant={category.isActive ? 'success' : 'secondary'}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            {category.description && (
                                <p className="text-gray-600">{category.description}</p>
                            )}
                        </div>
                        <Button onClick={onEdit} className="ml-4">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Category
                        </Button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Products</p>
                                        <p className="text-2xl font-bold">{category.products.length}</p>
                                    </div>
                                    <Package className="h-8 w-8 text-primary-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Category Value</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(totalValue)}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Low Stock</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {lowStockProducts.length}
                                        </p>
                                    </div>
                                    <BarChart3 className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Out of Stock</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {outOfStockProducts.length}
                                        </p>
                                    </div>
                                    <Package className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stock Alerts */}
                    {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-5 w-5 text-orange-600" />
                                <h3 className="font-medium text-orange-800">Stock Alerts</h3>
                            </div>
                            <div className="text-sm text-orange-700">
                                {outOfStockProducts.length > 0 && (
                                    <p className="mb-1">
                                        <strong>{outOfStockProducts.length}</strong> products are out of stock
                                    </p>
                                )}
                                {lowStockProducts.length > 0 && (
                                    <p>
                                        <strong>{lowStockProducts.length}</strong> products are below minimum stock level
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Products in Category */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Products in Category ({category.products.length})
                            </h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            {category.products.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {category.products.map((product) => {
                                                const stockValue = product.unitPrice * product.stockLevel
                                                const isLowStock = product.stockLevel <= product.minStockLevel
                                                const isOutOfStock = product.stockLevel === 0

                                                return (
                                                    <TableRow key={product.productId}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {product.productName}
                                                                </div>
                                                                {product.description && (
                                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                        {product.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                                {product.productCode}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">{product.stockLevel}</span>
                                                                    {isOutOfStock && (
                                                                        <Badge variant="error" className="text-xs">
                                                                            Out
                                                                        </Badge>
                                                                    )}
                                                                    {!isOutOfStock && isLowStock && (
                                                                        <Badge variant="warning" className="text-xs">
                                                                            Low
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Min: {product.minStockLevel}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {formatCurrency(product.unitPrice)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {formatCurrency(stockValue)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={product.isActive ? 'success' : 'secondary'}>
                                                                {product.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products in this category</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Products can be assigned to this category when creating or editing them.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category Information */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Category Information
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Created</p>
                                    <p className="font-medium">{formatDate(category.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Last Updated</p>
                                    <p className="font-medium">{formatDate(category.updatedAt)}</p>
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
                            Edit Category
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <Tags className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Category not found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        The category you're looking for doesn't exist or has been deleted.
                    </p>
                </div>
            )}
        </Modal>
    )
}