// src/pages/inventory/InventoryPage.tsx
import React, { useState } from 'react'
import { Package, Tags, Truck, Car } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ProductList } from './ProductList'
import { CategoryList } from './CategoryList'
import { SupplierList } from './SupplierList'
import { VehicleList } from './VehicleList'

type TabType = 'products' | 'categories' | 'suppliers' | 'vehicles'

interface Tab {
    id: TabType
    label: string
    icon: React.ComponentType<{ className?: string }>
    component: React.ComponentType
}

const tabs: Tab[] = [
    {
        id: 'products',
        label: 'Products',
        icon: Package,
        component: ProductList,
    },
    {
        id: 'categories',
        label: 'Categories',
        icon: Tags,
        component: CategoryList,
    },
    {
        id: 'suppliers',
        label: 'Suppliers',
        icon: Truck,
        component: SupplierList,
    },
    {
        id: 'vehicles',
        label: 'Vehicle Types',
        icon: Car,
        component: VehicleList,
    },
]

export const InventoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('products')

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProductList

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600 mt-2">
                    Manage your products, categories, suppliers, and vehicle compatibility
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id
                        const Icon = tab.icon

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                    isActive
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <ActiveComponent />
            </div>
        </div>
    )
}