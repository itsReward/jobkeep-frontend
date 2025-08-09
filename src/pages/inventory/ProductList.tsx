// src/pages/inventory/ProductList.tsx - Consistent with ClientList/EmployeeList
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    BarChart3,
    Package,
    AlertTriangle,
    ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { productService, productCategoryService, supplierService } from '@/services/api/inventory'
import { Product, ProductCategory, Supplier } from '@/types'
import { formatCurrency } from '@/utils/format'
import { useAuth } from '@/components/providers/AuthProvider'
import { usePermissions } from '@/hooks/usePermissions'
import { getProductCategories, getStockStatus } from '@/utils/productHelpers'

export const ProductList: React.FC = () => {
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const { canManageInventory } = usePermissions()

    // State
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedSupplier, setSelectedSupplier] = useState('')
    const [stockStatusFilter, setStockStatusFilter] = useState('')

    // Fetch data
    const {
        data: products = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['products'],
        queryFn: productService.getAll,
        enabled: canManageInventory,
    })

    const { data: categories = [] } = useQuery({
        queryKey: ['product-categories'],
        queryFn: productCategoryService.getAll,
        enabled: canManageInventory,
    })

    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getAll,
        enabled: canManageInventory,
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: productService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Product deleted successfully!')
        },
        onError: () => {
            toast.error('Failed to delete product')
        },
    })

    // Get unique values for filters
    const stockStatuses = [
        { value: 'in-stock', label: 'In Stock' },
        { value: 'low-stock', label: 'Low Stock' },
        { value: 'out-of-stock', label: 'Out of Stock' },
    ]

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search term filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase()
                const matchesSearch =
                    product.productName?.toLowerCase().includes(searchLower) ||
                    product.productCode?.toLowerCase().includes(searchLower) ||
                    product.description?.toLowerCase().includes(searchLower) ||
                    product.supplierName?.toLowerCase().includes(searchLower)

                if (!matchesSearch) return false
            }

            // Category filter
            if (selectedCategory) {
                const categories = getProductCategories(product)
                const matchesCategory = categories.some(cat =>
                    cat.toLowerCase().includes(selectedCategory.toLowerCase())
                )
                if (!matchesCategory) return false
            }

            // Supplier filter
            if (selectedSupplier && product.supplierId !== selectedSupplier) {
                return false
            }

            // Stock status filter
            if (stockStatusFilter) {
                const stockStatus = getStockStatus(product)
                const statusMap = {
                    'in-stock': 'In Stock',
                    'low-stock': 'Low Stock',
                    'out-of-stock': 'Out of Stock',
                }
                if (stockStatus.label !== statusMap[stockStatusFilter as keyof typeof statusMap]) {
                    return false
                }
            }

            return true
        })
    }, [products, searchTerm, selectedCategory, selectedSupplier, stockStatusFilter])

    // Handlers
    const handleCreateProduct = () => {
        // Navigate to create product or open modal
        console.log('Create product')
    }

    const handleEditProduct = (product: Product) => {
        console.log('Edit product:', product)
    }

    const handleViewProduct = (product: Product) => {
        console.log('View product:', product)
    }

    const handleDeleteProduct = (product: Product) => {
        if (window.confirm(`Are you sure you want to delete "${product.productName}"?`)) {
            deleteMutation.mutate(product.productId)
        }
    }

    const handleStockAdjustment = (product: Product) => {
        console.log('Stock adjustment:', product)
    }

    const clearFilters = () => {
        setSelectedCategory('')
        setSelectedSupplier('')
        setStockStatusFilter('')
    }

    // Access control
    if (!canManageInventory) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                        <p className="text-gray-600 mb-4">
                            You don't have permission to access inventory management.
                        </p>
                        <div className="text-sm text-gray-500">
                            <p>User Role: {user?.userRole || 'None'}</p>
                            <p>Required: Admin, Manager, or Stores</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
                        <p className="text-red-600 mb-4">Failed to load products</p>
                        <Button onClick={() => refetch()} variant="outline">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-primary-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600">Manage your product inventory</p>
                    </div>
                </div>
                <Button onClick={handleCreateProduct} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products by name, code, description, or supplier..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                            {(selectedCategory || selectedSupplier || stockStatusFilter) && (
                                <Badge variant="secondary" className="ml-2">
                                    {[selectedCategory, selectedSupplier, stockStatusFilter].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.categoryId} value={category.categoryName}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Supplier Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Supplier
                                    </label>
                                    <select
                                        value={selectedSupplier}
                                        onChange={(e) => setSelectedSupplier(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Suppliers</option>
                                        {suppliers.map(supplier => (
                                            <option key={supplier.supplierId} value={supplier.supplierId}>
                                                {supplier.supplierName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock Status
                                    </label>
                                    <select
                                        value={stockStatusFilter}
                                        onChange={(e) => setStockStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">All Status</option>
                                        {stockStatuses.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(selectedCategory || selectedSupplier || stockStatusFilter) && (
                                <div className="mt-4">
                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                </p>
            </div>

            {/* Products Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loading size="lg" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                {products?.length === 0
                                    ? "No products found. Create your first product to get started."
                                    : "No products match your current filters."
                                }
                            </p>
                            {products?.length === 0 ? (
                                <Button onClick={handleCreateProduct}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Product
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categories
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => {
                                    const categories = getProductCategories(product)
                                    const stockStatus = getStockStatus(product)

                                    return (
                                        <tr key={product.productId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                                            <Package className="h-5 w-5 text-primary-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.productName}
                                                        </div>
                                                        {product.description && (
                                                            <div className="text-sm text-gray-500">
                                                                {product.description.length > 50
                                                                    ? `${product.description.substring(0, 50)}...`
                                                                    : product.description
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-gray-900">
                                                    {product.productCode}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    {categories.length > 0 ? (
                                                        categories.slice(0, 2).map((category, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {category}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-gray-400">None</span>
                                                    )}
                                                    {categories.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{categories.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Badge
                                                        variant={stockStatus.variant}
                                                        className="text-xs"
                                                    >
                                                        {stockStatus.label}
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                            {product.stockLevel || 0}
                                                        </span>
                                                </div>
                                                {product.minStockLevel > 0 && (
                                                    <div className="text-xs text-gray-400">
                                                        Min: {product.minStockLevel}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(product.unitPrice || 0)}
                                                </div>
                                                {product.costPrice && (
                                                    <div className="text-xs text-gray-500">
                                                        Cost: {formatCurrency(product.costPrice)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {product.supplierName || 'No supplier'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewProduct(product)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStockAdjustment(product)}
                                                        className="text-blue-400 hover:text-blue-600"
                                                    >
                                                        <BarChart3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditProduct(product)}
                                                        className="text-blue-400 hover:text-blue-600"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteProduct(product)}
                                                        className="text-red-400 hover:text-red-600"
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}