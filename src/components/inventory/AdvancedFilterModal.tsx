import React, { useState, useEffect } from 'react'
import { X, Filter } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { InventoryFilter, ProductCategory, Supplier, ProductVehicle } from '@/types'

interface AdvancedFilterModalProps {
    isOpen: boolean
    onClose: () => void
    filters: InventoryFilter
    onApplyFilters: (filters: InventoryFilter) => void
    categories: ProductCategory[]
    suppliers: Supplier[]
    vehicles: ProductVehicle[]
}

export const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            filters,
                                                                            onApplyFilters,
                                                                            categories,
                                                                            suppliers,
                                                                            vehicles,
                                                                        }) => {
    const [localFilters, setLocalFilters] = useState<InventoryFilter>(filters)

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const handleApply = () => {
        onApplyFilters(localFilters)
        onClose()
    }

    const handleClear = () => {
        const clearedFilters: InventoryFilter = {}
        setLocalFilters(clearedFilters)
        onApplyFilters(clearedFilters)
        onClose()
    }

    const updateFilter = (key: keyof InventoryFilter, value: any) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value || undefined,
        }))
    }

    const removeFilter = (key: keyof InventoryFilter) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev }
            delete newFilters[key]
            return newFilters
        })
    }

    const getActiveFiltersCount = () => {
        return Object.keys(localFilters).filter(key => localFilters[key as keyof InventoryFilter]).length
    }

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
                                    displayValue = categories.find(c => c.categoryId === value)?.categoryName || value
                                } else if (key === 'supplierId') {
                                    displayValue = suppliers.find(s => s.supplierId === value)?.supplierName || value
                                } else if (key === 'vehicleId') {
                                    const vehicle = vehicles.find(v => v.vehicleId === value)
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
                            {categories.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName} ({category.productCount} products)
                                </option>
                            ))}
                        </select>
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
                            {suppliers.map((supplier) => (
                                <option key={supplier.supplierId} value={supplier.supplierId}>
                                    {supplier.supplierName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Vehicle Filter */}
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
                            {vehicles.map((vehicle) => (
                                <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                    {vehicle.vehicleMake} {vehicle.vehicleModel}
                                    {vehicle.yearRange && ` (${vehicle.yearRange})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stock Level Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Level
                        </label>
                        <select
                            value={localFilters.stockLevel || ''}
                            onChange={(e) => updateFilter('stockLevel', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All stock levels</option>
                            <option value="out">Out of Stock</option>
                            <option value="low">Low Stock</option>
                            <option value="normal">Normal Stock</option>
                        </select>
                    </div>

                    {/* Min Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Price (USD)
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={localFilters.minPrice || ''}
                            onChange={(e) => updateFilter('minPrice', parseFloat(e.target.value) || undefined)}
                            placeholder="0.00"
                        />
                    </div>

                    {/* Max Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Price (USD)
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={localFilters.maxPrice || ''}
                            onChange={(e) => updateFilter('maxPrice', parseFloat(e.target.value) || undefined)}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Active Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="isActive"
                                checked={localFilters.isActive === undefined}
                                onChange={() => updateFilter('isActive', undefined)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">All</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="isActive"
                                checked={localFilters.isActive === true}
                                onChange={() => updateFilter('isActive', true)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="isActive"
                                checked={localFilters.isActive === false}
                                onChange={() => updateFilter('isActive', false)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Inactive</span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        disabled={getActiveFiltersCount() === 0}
                    >
                        Clear All
                    </Button>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleApply}>
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters ({getActiveFiltersCount()})
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}