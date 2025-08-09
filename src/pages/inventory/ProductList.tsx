// src/pages/inventory/ProductList.tsx
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
    Upload,
    Download,
    AlertTriangle,
    DollarSign,
    Package,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { ProductFormModal } from '@/components/inventory/ProductFormModal'
import { ProductViewModal } from '@/components/inventory/ProductViewModal'
import { ProductRelationshipModal } from '@/components/inventory/ProductRelationshipModal'
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal'
import { BulkImportModal } from '@/components/inventory/BulkImportModal'
import { AdvancedFilterModal } from '@/components/inventory/AdvancedFilterModal'
import { productService, productCategoryService, supplierService, productVehicleService } from '@/services/api/inventory'
import { Product, InventoryFilter } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'

export const ProductList: React.FC = () => {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    // Check if user has inventory access
    const hasInventoryAccess = ['admin', 'stores', 'serviceAdvisor'].includes(user?.role || '')

    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<InventoryFilter>({})
    const [showFilters, setShowFilters] = useState(false)

    // Modal states
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [relationshipModalOpen, setRelationshipModalOpen] = useState(false)
    const [stockModalOpen, setStockModalOpen] = useState(false)
    const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false)
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

    // Fetch data
    const { data: products = [], isLoading, error, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: productService.getAll.bind(productService),
        enabled: hasInventoryAccess,
    })

    const { data: categories = [] } = useQuery({
        queryKey: ['product-categories'],
        queryFn: productCategoryService.getAll.bind(productCategoryService),
        enabled: hasInventoryAccess,
    })

    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getAll.bind(supplierService),
        enabled: hasInventoryAccess,
    })

    const { data: vehicles = [] } = useQuery({
        queryKey: ['product-vehicles'],
        queryFn: productVehicleService.getAll.bind(productVehicleService),
        enabled: hasInventoryAccess,
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: productService.delete.bind(productService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Product deleted successfully!')
        },
        onError: () => {
            toast.error('Failed to delete product')
        },
    })

    // Export mutation
    const exportMutation = useMutation({
        mutationFn: productService.exportProducts.bind(productService),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('Products exported successfully!')
        },
        onError: () => {
            toast.error('Failed to export products')
        },
    })

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered = products

        // Text search
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(product =>
                product.productName.toLowerCase().includes(term) ||
                product.productCode.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term) ||
                product.supplierName?.toLowerCase().includes(term)
            )
        }

        // Advanced filters
        if (filters.categoryId) {
            filtered = filtered.filter(product =>
                product.categories.some(cat =>
                    categories.find(c => c.categoryId === filters.categoryId)?.categoryName === cat
                )
            )
        }

        if (filters.supplierId) {
            filtered = filtered.filter(product => product.supplierId === filters.supplierId)
        }

        if (filters.stockLevel) {
            switch (filters.stockLevel) {
                case 'low':
                    filtered = filtered.filter(product =>
                        product.stockLevel > 0 && product.stockLevel <= product.minStockLevel
                    )
                    break
                case 'out':
                    filtered = filtered.filter(product => product.stockLevel === 0)
                    break
                case 'normal':
                    filtered = filtered.filter(product => product.stockLevel > product.minStockLevel)
                    break
            }
        }

        if (filters.isActive !== undefined) {
            filtered = filtered.filter(product => product.isActive === filters.isActive)
        }

        if (filters.minPrice) {
            filtered = filtered.filter(product => product.unitPrice >= filters.minPrice!)
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(product => product.unitPrice <= filters.maxPrice!)
        }

        return filtered
    }, [products, searchTerm, filters, categories])

    const handleEdit = (product: Product) => {
        setSelectedProduct(product)
        setFormMode('edit')
        setFormModalOpen(true)
    }

    const handleView = (product: Product) => {
        setSelectedProduct(product)
        setViewModalOpen(true)
    }

    const handleManageRelationships = (product: Product) => {
        setSelectedProduct(product)
        setRelationshipModalOpen(true)
    }

    const handleStockAdjustment = (product: Product) => {
        setSelectedProduct(product)
        setStockModalOpen(true)
    }

    const handleDelete = (product: Product) => {
        if (window.confirm(`Are you sure you want to delete "${product.productName}"?`)) {
            deleteMutation.mutate(product.productId)
        }
    }

    const getStockStatus = (product: Product) => {
        if (product.stockLevel === 0) {
            return { label: 'Out of Stock', variant: 'error' as const }
        } else if (product.stockLevel <= product.minStockLevel) {
            return { label: 'Low Stock', variant: 'warning' as const }
        } else {
            return { label: 'In Stock', variant: 'success' as const }
        }
    }

    if (!hasInventoryAccess) {
        return (
            <div className="p-6 text-center">
                <div className="mx-auto max-w-md">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        You don't have permission to access inventory management.
                    </p>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <Loading size="lg" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="mx-auto max-w-md">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading products</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        There was an error loading the products. Please try again.
                    </p>
                    <Button onClick={() => refetch()} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 flex gap-4">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setFilterModalOpen(true)}
                        className={showFilters ? 'bg-primary-50 border-primary-200' : ''}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setBulkImportModalOpen(true)}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => exportMutation.mutate()}
                        disabled={exportMutation.isPending}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedProduct(null)
                            setFormMode('create')
                            setFormModalOpen(true)
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold">{filteredProducts.length}</p>
                            </div>
                            <Package className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Low Stock</p>
                                <p className="text-2xl font-bold text-warning-600">
                                    {filteredProducts.filter(p => p.stockLevel > 0 && p.stockLevel <= p.minStockLevel).length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-warning-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-bold text-error-600">
                                    {filteredProducts.filter(p => p.stockLevel === 0).length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-error-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Value</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        filteredProducts.reduce((sum, p) => sum + (p.unitPrice * p.stockLevel), 0)
                                    )}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-success-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium">Products ({filteredProducts.length})</h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(product)

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
                                                    {product.categories.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            {product.categories.slice(0, 2).map((category, index) => (
                                                                <Badge key={index} variant="secondary" className="text-xs">
                                                                    {category}
                                                                </Badge>
                                                            ))}
                                                            {product.categories.length > 2 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    +{product.categories.length - 2}
                                                                </Badge>
                                                            )}
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
                                                        <Badge variant={stockStatus.variant} className="text-xs">
                                                            {stockStatus.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Min: {product.minStockLevel}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {formatCurrency(product.unitPrice)}
                                                    </div>
                                                    {product.costPrice && (
                                                        <div className="text-sm text-gray-500">
                                                            Cost: {formatCurrency(product.costPrice)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {product.supplierName ? (
                                                    <span className="text-sm">{product.supplierName}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">No supplier</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={product.isActive ? 'success' : 'secondary'}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleView(product)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStockAdjustment(product)}
                                                    >
                                                        <BarChart3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleManageRelationships(product)}
                                                    >
                                                        <Package className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(product)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm || Object.keys(filters).length > 0
                                        ? 'Try adjusting your search criteria.'
                                        : 'Get started by adding your first product.'}
                                </p>
                                {!searchTerm && Object.keys(filters).length === 0 && (
                                    <Button
                                        className="mt-4"
                                        onClick={() => {
                                            setSelectedProduct(null)
                                            setFormMode('create')
                                            setFormModalOpen(true)
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Product
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <ProductFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                product={selectedProduct}
                mode={formMode}
            />

            <ProductViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                productId={selectedProduct?.productId || null}
            />

            <ProductRelationshipModal
                isOpen={relationshipModalOpen}
                onClose={() => setRelationshipModalOpen(false)}
                product={selectedProduct}
            />

            <StockAdjustmentModal
                isOpen={stockModalOpen}
                onClose={() => setStockModalOpen(false)}
                product={selectedProduct}
            />

            <BulkImportModal
                isOpen={bulkImportModalOpen}
                onClose={() => setBulkImportModalOpen(false)}
                type="products"
            />

            <AdvancedFilterModal
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                filters={filters}
                onApplyFilters={setFilters}
                categories={categories}
                suppliers={suppliers}
                vehicles={vehicles}
            />
        </div>
    )
}