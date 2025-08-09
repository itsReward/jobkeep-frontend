// src/pages/inventory/CategoryList.tsx
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Tags,
    Package,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { CategoryFormModal } from '@/components/inventory/CategoryFormModal'
import { CategoryViewModal } from '@/components/inventory/CategoryViewModal'
import { productCategoryService } from '@/services/api/inventory'
import { ProductCategory } from '@/types'
import { formatDate } from '@/utils/format'

export const CategoryList: React.FC = () => {
    const queryClient = useQueryClient()

    const [searchTerm, setSearchTerm] = useState('')
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

    // Fetch categories
    const { data: categories = [], isLoading, error, refetch } = useQuery({
        queryKey: ['product-categories'],
        queryFn: productCategoryService.getAll.bind(productCategoryService),
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: productCategoryService.delete.bind(productCategoryService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] })
            toast.success('Category deleted successfully!')
        },
        onError: () => {
            toast.error('Failed to delete category')
        },
    })

    // Filter categories
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories

        const term = searchTerm.toLowerCase()
        return categories.filter(category =>
            category.categoryName.toLowerCase().includes(term) ||
            category.description?.toLowerCase().includes(term)
        )
    }, [categories, searchTerm])

    const handleEdit = (category: ProductCategory) => {
        setSelectedCategory(category)
        setFormMode('edit')
        setFormModalOpen(true)
    }

    const handleView = (category: ProductCategory) => {
        setSelectedCategory(category)
        setViewModalOpen(true)
    }

    const handleDelete = (category: ProductCategory) => {
        if (category.productCount > 0) {
            toast.error('Cannot delete category with associated products')
            return
        }

        if (window.confirm(`Are you sure you want to delete "${category.categoryName}"?`)) {
            deleteMutation.mutate(category.categoryId)
        }
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
                    <Tags className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading categories</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        There was an error loading the categories. Please try again.
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
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                    />
                </div>

                <Button
                    onClick={() => {
                        setSelectedCategory(null)
                        setFormMode('create')
                        setFormModalOpen(true)
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Categories</p>
                                <p className="text-2xl font-bold">{filteredCategories.length}</p>
                            </div>
                            <Tags className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Categories</p>
                                <p className="text-2xl font-bold text-success-600">
                                    {filteredCategories.filter(c => c.isActive).length}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-success-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold">
                                    {filteredCategories.reduce((sum, c) => sum + c.productCount, 0)}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium">Categories ({filteredCategories.length})</h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category.categoryId}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                    <Tags className="h-4 w-4 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {category.categoryName}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {category.description ? (
                                                <span className="text-sm text-gray-600 max-w-xs truncate block">
                          {category.description}
                        </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">No description</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    {category.productCount} products
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={category.isActive ? 'success' : 'secondary'}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(category.createdAt)}
                      </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(category)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(category)}
                                                    className="text-red-600 hover:text-red-700"
                                                    disabled={category.productCount > 0}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {filteredCategories.length === 0 && (
                            <div className="text-center py-12">
                                <Tags className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm
                                        ? 'Try adjusting your search criteria.'
                                        : 'Get started by adding your first category.'}
                                </p>
                                {!searchTerm && (
                                    <Button
                                        className="mt-4"
                                        onClick={() => {
                                            setSelectedCategory(null)
                                            setFormMode('create')
                                            setFormModalOpen(true)
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Category
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <CategoryFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                category={selectedCategory}
                mode={formMode}
            />

            <CategoryViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                categoryId={selectedCategory?.categoryId || null}
            />
        </div>
    )
}