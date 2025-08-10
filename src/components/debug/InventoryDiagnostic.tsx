// src/pages/inventory/ProductList.tsx - FIXED VERSION
import React, { useState, useMemo, useEffect } from 'react'
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
    RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { ProductViewModal } from '@/components/inventory/ProductViewModal'
import { ProductFormModal } from '@/components/inventory/ProductFormModal'
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal'
import { productService, productCategoryService, supplierService } from '@/services/api/inventory'
import { Product, ProductCategory, Supplier } from '@/types'
import { formatCurrency } from '@/utils/format'
import { useAuth } from '@/components/providers/AuthProvider'
import { usePermissions } from '@/hooks/usePermissions'
import { getProductCategories, getStockStatus } from '@/utils/productHelpers'

export const ProductList: React.FC = () => {
    const queryClient = useQueryClient()
    const { user, isAuthenticated } = useAuth()
    const { canManageInventory } = usePermissions()

    // State
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedSupplier, setSelectedSupplier] = useState('')
    const [stockStatusFilter, setStockStatusFilter] = useState('')

    // Enhanced debug logging
    useEffect(() => {
        console.log('🔍 ProductList Mount Debug:', {
            user: user?.username,
            userRole: user?.userRole,
            canManageInventory,
            isAuthenticated,
            hasToken: !!localStorage.getItem('accessToken')
        })
    }, [user, canManageInventory, isAuthenticated])

    // Fetch products with better error handling and debugging
    const {
        data: products = [],
        isLoading: productsLoading,
        error: productsError,
        refetch: refetchProducts
    } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            console.log('🚀 Fetching products...')
            try {
                const result = await productService.getAll()
                console.log('✅ Products fetched successfully:', result?.length || 0, 'items')
                return result
            } catch (error: any) {
                console.error('❌ Products fetch failed:', {
                    status: error?.response?.status,
                    message: error?.message,
                    data: error?.response?.data
                })
                throw error
            }
        },
        enabled: isAuthenticated && canManageInventory,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Fetch categories with better error handling
    const {
        data: categories = [],
        isLoading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories
    } = useQuery({
        queryKey: ['product-categories'],
        queryFn: async () => {
            console.log('🚀 Fetching categories...')
            try {
                const result = await productCategoryService.getAll()
                console.log('✅ Categories fetched successfully:', result?.length || 0, 'items')
                return result
            } catch (error: any) {
                console.error('❌ Categories fetch failed:', {
                    status: error?.response?.status,
                    message: error?.message,
                    data: error?.response?.data
                })
                throw error
            }
        },
        enabled: isAuthenticated && canManageInventory,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000,
    })

    // Fetch suppliers with better error handling
    const {
        data: suppliers = [],
        isLoading: suppliersLoading,
        error: suppliersError,
        refetch: refetchSuppliers
    } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            console.log('🚀 Fetching suppliers...')
            try {
                const result = await supplierService.getAll()
                console.log('✅ Suppliers fetched successfully:', result?.length || 0, 'items')
                return result
            } catch (error: any) {
                console.error('❌ Suppliers fetch failed:', {
                    status: error?.response?.status,
                    message: error?.message,
                    data: error?.response?.data
                })
                throw error
            }
        },
        enabled: isAuthenticated && canManageInventory,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000,
    })

    // Aggregate loading and error states
    const isLoading = productsLoading || categoriesLoading || suppliersLoading
    const hasError = productsError || categoriesError || suppliersError
    const error = productsError || categoriesError || suppliersError

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: productService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Product deleted successfully!')
        },
        onError: (error: any) => {
            console.error('Delete product error:', error)
            toast.error(`Failed to delete product: ${error.response?.data?.message || error.message}`)
        }
    })

    // Filter products based on search and filters
    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return []

        return products.filter((product) => {
            const matchesSearch = !searchTerm || (
                product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            )

            const matchesCategory = !selectedCategory || product.categoryId === selectedCategory
            const matchesSupplier = !selectedSupplier || product.supplierId === selectedSupplier

            let matchesStockStatus = true
            if (stockStatusFilter) {
                const stockStatus = getStockStatus(product)
                matchesStockStatus = stockStatus === stockStatusFilter
            }

            return matchesSearch && matchesCategory && matchesSupplier && matchesStockStatus
        })
    }, [products, searchTerm, selectedCategory, selectedSupplier, stockStatusFilter])

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [stockModalOpen, setStockModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

    // Event handlers
    const handleCreateProduct = () => {
        setSelectedProduct(null)
        setFormMode('create')
        setFormModalOpen(true)
    }

    const handleEditProduct = (product: Product) => {
        console.log('Edit product:', product)
        setSelectedProduct(product)
        setFormMode('edit')
        setFormModalOpen(true)
    }

    const handleViewProduct = (product: Product) => {
        console.log('View product:', product)
        setSelectedProduct(product)
        setViewModalOpen(true)
    }

    const handleDeleteProduct = (product: Product) => {
        if (window.confirm(`Are you sure you want to delete "${product.productName}"?`)) {
            deleteMutation.mutate(product.productId)
        }
    }

    const handleStockAdjustment = (product: Product) => {
        console.log('Stock adjustment:', product)
        setSelectedProduct(product)
        setStockModalOpen(true)
    }

    // Modal handlers
    const handleCloseModals = () => {
        setViewModalOpen(false)
        setFormModalOpen(false)
        setStockModalOpen(false)
        setSelectedProduct(null)
    }

    const handleFormSuccess = () => {
        handleCloseModals()
        refetchProducts()
        toast.success(formMode === 'create' ? 'Product created successfully!' : 'Product updated successfully!')
    }

    const clearFilters = () => {
        setSelectedCategory('')
        setSelectedSupplier('')
        setStockStatusFilter('')
        setSearchTerm('')
    }

    const handleRefresh = () => {
        console.log('🔄 Manual refresh triggered')
        refetchProducts()
        refetchCategories()
        refetchSuppliers()
    }

    // Debug component state
    useEffect(() => {
        console.log('🔍 ProductList State Update:', {
            productsCount: products?.length || 0,
            categoriesCount: categories?.length || 0,
            suppliersCount: suppliers?.length || 0,
            isLoading,
            hasError: !!hasError,
            errorDetails: hasError ? {
                productsError: productsError?.message,
                categoriesError: categoriesError?.message,
                suppliersError: suppliersError?.message
            } : null
        })
    }, [products, categories, suppliers, isLoading, hasError, productsError, categoriesError, suppliersError])

    // Access control check
    if (!isAuthenticated) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
                        <p className="text-gray-600 mb-4">Please log in to access inventory management.</p>
                        <Button onClick={() => window.location.href = '/login'} variant="outline">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

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

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <Loading className="mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Products</h3>
                        <p className="text-gray-600">Please wait while we fetch your inventory data...</p>
                        <div className="mt-4 text-sm text-gray-500">
                            <p>Loading products, categories, and suppliers...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Error state with detailed error information
    if (hasError) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
                        <p className="text-red-600 mb-4">Failed to load inventory data</p>

                        {/* Detailed error information */}
                        <div className="text-left bg-red-50 p-4 rounded-lg mb-4 max-w-2xl mx-auto">
                            <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                            {productsError && (
                                <p className="text-sm text-red-700 mb-1">
                                    Products: {productsError.message}
                                </p>
                            )}
                            {categoriesError && (
                                <p className="text-sm text-red-700 mb-1">
                                    Categories: {categoriesError.message}
                                </p>
                            )}
                            {suppliersError && (
                                <p className="text-sm text-red-700 mb-1">
                                    Suppliers: {suppliersError.message}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2 justify-center">
                            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                onClick={() => {
                                    console.log('🔧 Running diagnostic...')
                                    // Run diagnostic function if available
                                    if (window.correctedProductDebug) {
                                        window.correctedProductDebug.testIndividualEndpoints()
                                    }
                                }}
                                variant="secondary"
                            >
                                Run Diagnostic
                            </Button>
                        </div>
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
                        <p className="text-gray-600">
                            Manage your product inventory ({products?.length || 0} products)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button onClick={handleCreateProduct} className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Product</span>
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search products by name, code, or brand..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            onClick={() => setShowFilters(!showFilters)}
                            variant="outline"
                            className="flex items-center space-x-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
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
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category.categoryId} value={category.categoryId}>
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
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    >
                                        <option value="">All Suppliers</option>
                                        {suppliers.map((supplier) => (
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
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    >
                                        <option value="">All Stock Levels</option>
                                        <option value="in-stock">In Stock</option>
                                        <option value="low-stock">Low Stock</option>
                                        <option value="out-of-stock">Out of Stock</option>
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="mt-4 flex justify-end">
                                <Button onClick={clearFilters} variant="outline" size="sm">
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Products List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Products</h2>
                        <Badge variant="secondary">
                            {filteredProducts.length} of {products.length} products
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                            <p className="text-gray-600 mb-4">
                                {products.length === 0
                                    ? "No products have been added yet."
                                    : "No products match your current filters."
                                }
                            </p>
                            {products.length === 0 ? (
                                <Button onClick={handleCreateProduct}>
                                    Add Your First Product
                                </Button>
                            ) : (
                                <Button onClick={clearFilters} variant="outline">
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
                                        Category
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
                                    const stockStatus = getStockStatus(product)
                                    return (
                                        <tr key={product.productId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.productName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.productCode} • {product.brand}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
                                                        {product.categoryName}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {product.currentStock} {product.unitOfMeasure}
                                                        </span>
                                                    <Badge
                                                        variant={
                                                            stockStatus === 'out-of-stock' ? 'destructive' :
                                                                stockStatus === 'low-stock' ? 'warning' : 'success'
                                                        }
                                                        className="ml-2"
                                                    >
                                                        {stockStatus.replace('-', ' ')}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatCurrency(product.sellingPrice)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Cost: {formatCurrency(product.costPrice)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
                                                        {product.supplierName}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        onClick={() => handleViewProduct(product)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleEditProduct(product)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleStockAdjustment(product)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <BarChart3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteProduct(product)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
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

            {/* Modal Components */}
            <ProductViewModal
                isOpen={viewModalOpen}
                onClose={handleCloseModals}
                onEdit={() => {
                    setViewModalOpen(false)
                    setFormMode('edit')
                    setFormModalOpen(true)
                }}
                productId={selectedProduct?.productId || null}
            />

            <ProductFormModal
                isOpen={formModalOpen}
                onClose={handleCloseModals}
                onSuccess={handleFormSuccess}
                product={selectedProduct}
                mode={formMode}
            />

            <StockAdjustmentModal
                isOpen={stockModalOpen}
                onClose={handleCloseModals}
                onSuccess={() => {
                    handleCloseModals()
                    refetchProducts()
                    toast.success('Stock adjustment completed successfully!')
                }}
                product={selectedProduct}
            />
        </div>
    )
}