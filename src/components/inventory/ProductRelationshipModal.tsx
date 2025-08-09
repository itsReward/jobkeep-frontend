// src/pages/inventory/modals/ProductRelationshipModal.tsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Plus, X, Tags, Car } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import {
    productService,
    productCategoryService,
    productVehicleService
} from '@/services/api/inventory'
import { Product, ProductCategory, ProductVehicle } from '@/types'

interface ProductRelationshipModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
}

type TabType = 'categories' | 'vehicles'

export const ProductRelationshipModal: React.FC<ProductRelationshipModalProps> = ({
                                                                                      isOpen,
                                                                                      onClose,
                                                                                      product,
                                                                                  }) => {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<TabType>('categories')
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch categories and vehicles
    const { data: categories = [] } = useQuery({
        queryKey: ['product-categories'],
        queryFn: productCategoryService.getAll.bind(productCategoryService),
        enabled: isOpen,
    })

    const { data: vehicles = [] } = useQuery({
        queryKey: ['product-vehicles'],
        queryFn: productVehicleService.getAll.bind(productVehicleService),
        enabled: isOpen,
    })

    // Get current product with full relationships
    const { data: fullProduct, isLoading } = useQuery({
        queryKey: ['products', product?.productId, 'full'],
        queryFn: () => productService.getByIdFull(product!.productId),
        enabled: !!product && isOpen,
    })

    // Add category mutation
    const addCategoryMutation = useMutation({
        mutationFn: ({ productId, categoryId }: { productId: string; categoryId: string }) =>
            productService.addCategory(productId, categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['products', product?.productId, 'full'] })
            toast.success('Category added successfully!')
        },
        onError: () => {
            toast.error('Failed to add category')
        },
    })

    // Remove category mutation
    const removeCategoryMutation = useMutation({
        mutationFn: ({ productId, categoryId }: { productId: string; categoryId: string }) =>
            productService.removeCategory(productId, categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['products', product?.productId, 'full'] })
            toast.success('Category removed successfully!')
        },
        onError: () => {
            toast.error('Failed to remove category')
        },
    })

    // Add vehicle mutation
    const addVehicleMutation = useMutation({
        mutationFn: ({ productId, vehicleId }: { productId: string; vehicleId: string }) =>
            productService.addVehicle(productId, vehicleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['products', product?.productId, 'full'] })
            toast.success('Vehicle compatibility added successfully!')
        },
        onError: () => {
            toast.error('Failed to add vehicle compatibility')
        },
    })

    // Remove vehicle mutation
    const removeVehicleMutation = useMutation({
        mutationFn: ({ productId, vehicleId }: { productId: string; vehicleId: string }) =>
            productService.removeVehicle(productId, vehicleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['products', product?.productId, 'full'] })
            toast.success('Vehicle compatibility removed successfully!')
        },
        onError: () => {
            toast.error('Failed to remove vehicle compatibility')
        },
    })

    if (!product) return null

    const handleAddCategory = (categoryId: string) => {
        addCategoryMutation.mutate({ productId: product.productId, categoryId })
    }

    const handleRemoveCategory = (categoryName: string) => {
        const category = categories.find(c => c.categoryName === categoryName)
        if (category) {
            removeCategoryMutation.mutate({
                productId: product.productId,
                categoryId: category.categoryId
            })
        }
    }

    const handleAddVehicle = (vehicleId: string) => {
        addVehicleMutation.mutate({ productId: product.productId, vehicleId })
    }

    const handleRemoveVehicle = (vehicleName: string) => {
        const vehicle = vehicles.find(v => `${v.vehicleMake} ${v.vehicleModel}` === vehicleName)
        if (vehicle) {
            removeVehicleMutation.mutate({
                productId: product.productId,
                vehicleId: vehicle.vehicleId
            })
        }
    }

    // Filter available items
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
        const notAlreadyAdded = !fullProduct?.categories.includes(category.categoryName)
        return matchesSearch && notAlreadyAdded
    })

    const filteredVehicles = vehicles.filter(vehicle => {
        const vehicleName = `${vehicle.vehicleMake} ${vehicle.vehicleModel}`
        const matchesSearch = vehicleName.toLowerCase().includes(searchTerm.toLowerCase())
        const notAlreadyAdded = !fullProduct?.compatibleVehicles.includes(vehicleName)
        return matchesSearch && notAlreadyAdded
    })

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Manage Relationships - ${product.productName}`}
            size="xl"
        >
            {isLoading ? (
                <div className="py-8">
                    <Loading size="lg" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={cn(
                                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                    activeTab === 'categories'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                )}
                            >
                                <Tags className="h-5 w-5" />
                                Categories ({fullProduct?.categories.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('vehicles')}
                                className={cn(
                                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                    activeTab === 'vehicles'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                )}
                            >
                                <Car className="h-5 w-5" />
                                Vehicle Compatibility ({fullProduct?.compatibleVehicles.length || 0})
                            </button>
                        </nav>
                    </div>

                    {/* Search */}
                    <div>
                        <Input
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <div className="space-y-6">
                            {/* Current Categories */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium">Current Categories</h3>
                                </CardHeader>
                                <CardContent>
                                    {fullProduct?.categories.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {fullProduct.categories.map((categoryName) => (
                                                <Badge
                                                    key={categoryName}
                                                    variant="primary"
                                                    className="flex items-center gap-1"
                                                >
                                                    {categoryName}
                                                    <button
                                                        onClick={() => handleRemoveCategory(categoryName)}
                                                        className="ml-1 hover:text-red-600"
                                                        disabled={removeCategoryMutation.isPending}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No categories assigned</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Available Categories */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium">Available Categories</h3>
                                </CardHeader>
                                <CardContent>
                                    {filteredCategories.length ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {filteredCategories.map((category) => (
                                                <div
                                                    key={category.categoryId}
                                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                                >
                                                    <div>
                                                        <p className="font-medium">{category.categoryName}</p>
                                                        {category.description && (
                                                            <p className="text-sm text-gray-500">{category.description}</p>
                                                        )}
                                                        <p className="text-xs text-gray-400">
                                                            {category.productCount} products
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddCategory(category.categoryId)}
                                                        disabled={addCategoryMutation.isPending}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">
                                            {searchTerm ? 'No categories found matching your search' : 'All categories already assigned'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Vehicles Tab */}
                    {activeTab === 'vehicles' && (
                        <div className="space-y-6">
                            {/* Current Vehicles */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium">Current Vehicle Compatibility</h3>
                                </CardHeader>
                                <CardContent>
                                    {fullProduct?.compatibleVehicles.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {fullProduct.compatibleVehicles.map((vehicleName) => (
                                                <Badge
                                                    key={vehicleName}
                                                    variant="secondary"
                                                    className="flex items-center gap-1"
                                                >
                                                    {vehicleName}
                                                    <button
                                                        onClick={() => handleRemoveVehicle(vehicleName)}
                                                        className="ml-1 hover:text-red-600"
                                                        disabled={removeVehicleMutation.isPending}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No vehicle compatibility set</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Available Vehicles */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium">Available Vehicle Types</h3>
                                </CardHeader>
                                <CardContent>
                                    {filteredVehicles.length ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {filteredVehicles.map((vehicle) => (
                                                <div
                                                    key={vehicle.vehicleId}
                                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {vehicle.vehicleMake} {vehicle.vehicleModel}
                                                        </p>
                                                        {vehicle.yearRange && (
                                                            <p className="text-sm text-gray-500">Year: {vehicle.yearRange}</p>
                                                        )}
                                                        {vehicle.engineType && (
                                                            <p className="text-sm text-gray-500">Engine: {vehicle.engineType}</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddVehicle(vehicle.vehicleId)}
                                                        disabled={addVehicleMutation.isPending}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">
                                            {searchTerm ? 'No vehicles found matching your search' : 'All vehicles already assigned'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                        <Button onClick={onClose}>
                            Done
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    )
}