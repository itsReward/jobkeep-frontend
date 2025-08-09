// src/components/inventory/AdvancedFilterModal.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react'
import { X, Filter, RotateCcw } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ProductCategory, Supplier, ProductVehicle, InventoryFilter } from '@/types'

interface AdvancedFilterModalProps {
    isOpen: boolean
    onClose: () => void
    filters: InventoryFilter
    onApplyFilters: (filters: InventoryFilter) => void
    categories: ProductCategory[]
    suppliers: Supplier[]
    vehicles?: ProductVehicle[] // Make optional with default
}

export const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            filters,
                                                                            onApplyFilters,
                                                                            categories = [], // Safe default
                                                                            suppliers = [], // Safe default
                                                                            vehicles = [], // Safe default
                                                                        }) => {
    const [localFilters, setLocalFilters] = useState<InventoryFilter>(filters)

    // Sync with parent filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters)
        }
    }, [isOpen, filters])

    // Add debugging for props
    useEffect(() => {
        console.log('🔧 AdvancedFilterModal Debug:', {
            categories: categories?.length || 0,
            suppliers: suppliers?.length || 0,
            vehicles: vehicles?.length || 0,
            categoriesType: typeof categories,
            suppliersType: typeof suppliers,
            vehiclesType: typeof vehicles,
            isOpen
        })
    }, [categories, suppliers, vehicles, isOpen])

    const updateFilter = (key: keyof InventoryFilter, value: any) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }))
    }

    const removeFilter = (key: keyof InventoryFilter) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev }
            delete newFilters[key]
            return newFilters
        })
    }

    const clearAllFilters = () => {
        setLocalFilters({})
    }

    const applyFilters = () => {
        onApplyFilters(localFilters)
        onClose()
    }

    const getActiveFiltersCount = () => {
        return Object.values(localFilters).filter(value =>
            value !== undefined && value !== null && value !== ''
        ).length
    }

    // Safe array access with fallbacks
    const safeCategories = Array.isArray(categories) ? categories : []
    const safeSuppliers = Array.isArray(suppliers) ? suppliers : []
    const safeVehicles = Array.isArray(vehicles) ? vehicles : []

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Advanced Filters"
            size="lg"
        >
            <div className="space-y-6">
                {/* Active Filters Summary */}
                {getActiveFiltersCount() > 0 && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-primary-900 mb-2">
                            Active Filters ({getActiveFiltersCount()})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(localFilters).map(([key, value]) => {
                                if (!value) return null

                                let displayValue = value
                                if (key === 'categoryId') {
                                    displayValue = safeCategories.find(c => c.categoryId === value)?.categoryName || value
                                } else if (key === 'supplierId') {
                                    displayValue = safeSuppliers.find(s => s.supplierId === value)?.supplierName || value
                                } else if (key === 'vehicleId') {
                                    const vehicle = safeVehicles.find(v => v.vehicleId === value)
                                    displayValue = vehicle ? `${vehicle.vehicleMake} ${vehicle.vehicleModel}` : value
                                }

                                return (
                                    <Badge
                                        key={key}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {key}: {displayValue}
                                        <button
                                            onClick={() => removeFilter(key as keyof InventoryFilter)}
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="mt-2"
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Clear All
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={localFilters.categoryId || ''}
                            onChange={(e) => updateFilter('categoryId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All categories</option>
                            {safeCategories.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                        {safeCategories.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">No categories available</p>
                        )}
                    </div>

                    {/* Supplier Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Supplier
                        </label>
                        <select
                            value={localFilters.supplierId || ''}
                            onChange={(e) => updateFilter('supplierId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All suppliers</option>
                            {safeSuppliers.map((supplier) => (
                                <option key={supplier.supplierId} value={supplier.supplierId}>
                                    {supplier.supplierName}
                                </option>
                            ))}
                        </select>
                        {safeSuppliers.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">No suppliers available</p>
                        )}
                    </div>

                    {/* Stock Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Status
                        </label>
                        <select
                            value={localFilters.stockStatus || ''}
                            onChange={(e) => updateFilter('stockStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All stock levels</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>

                    {/* Vehicle Compatibility Filter - FIXED */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle Compatibility
                        </label>
                        <select
                            value={localFilters.vehicleId || ''}
                            onChange={(e) => updateFilter('vehicleId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All vehicles</option>
                            {/* FIXED: Safe array mapping */}
                            {safeVehicles.map((vehicle) => (
                                <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                    {vehicle.vehicleMake} {vehicle.vehicleModel}
                                    {vehicle.yearRange && ` (${vehicle.yearRange})`}
                                </option>
                            ))}
                        </select>
                        {safeVehicles.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">No vehicle types available</p>
                        )}
                    </div>

                    {/* Price Range Filters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Price
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={localFilters.minPrice || ''}
                            onChange={(e) => updateFilter('minPrice', parseFloat(e.target.value) || undefined)}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Price
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={localFilters.maxPrice || ''}
                            onChange={(e) => updateFilter('maxPrice', parseFloat(e.target.value) || undefined)}
                            placeholder="1000.00"
                        />
                    </div>

                    {/* Active Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={localFilters.isActive?.toString() || ''}
                            onChange={(e) => updateFilter('isActive', e.target.value ? e.target.value === 'true' : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All statuses</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    {/* Search in Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search in Description
                        </label>
                        <Input
                            value={localFilters.description || ''}
                            onChange={(e) => updateFilter('description', e.target.value || undefined)}
                            placeholder="Search descriptions..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        {getActiveFiltersCount() > 0 ? (
                            `${getActiveFiltersCount()} filter${getActiveFiltersCount() === 1 ? '' : 's'} active`
                        ) : (
                            'No filters applied'
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={clearAllFilters}>
                            Clear All
                        </Button>
                        <Button onClick={applyFilters}>
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {/* Debug Information (remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                        <p><strong>Debug Info:</strong></p>
                        <p>Categories: {safeCategories.length}</p>
                        <p>Suppliers: {safeSuppliers.length}</p>
                        <p>Vehicles: {safeVehicles.length}</p>
                        <p>Active Filters: {JSON.stringify(localFilters, null, 2)}</p>
                    </div>
                )}
            </div>
        </Modal>
    )
}