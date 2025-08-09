// src/components/dashboard/InventoryMetrics.tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    Package,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Users
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui'
import { inventoryMetricsService } from '@/services/api/inventory'
import { formatCurrency, formatNumber } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'

export const InventoryMetrics: React.FC = () => {
    const navigate = useNavigate()
    const { hasInventoryAccess } = useAuth()

    const { data: metrics, isLoading, error } = useQuery({
        queryKey: ['inventory-metrics'],
        queryFn: inventoryMetricsService.getMetrics.bind(inventoryMetricsService),
        enabled: hasInventoryAccess(),
        refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    })

    if (!hasInventoryAccess()) {
        return null
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium">Inventory Overview</h3>
                </CardHeader>
                <CardContent>
                    <Loading size="sm" />
                </CardContent>
            </Card>
        )
    }

    if (error || !metrics) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium">Inventory Overview</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">Unable to load inventory metrics</p>
                </CardContent>
            </Card>
        )
    }

    const alertCount = metrics.lowStockProducts + metrics.outOfStockProducts

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Inventory Overview</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/inventory')}
                >
                    <Package className="h-4 w-4 mr-2" />
                    Manage Inventory
                </Button>
            </div>

            {/* Alert Banner */}
            {alertCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-800">
                                Stock Alert: {alertCount} product{alertCount !== 1 ? 's' : ''} need{alertCount === 1 ? 's' : ''} attention
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                                {metrics.outOfStockProducts > 0 && `${metrics.outOfStockProducts} out of stock`}
                                {metrics.outOfStockProducts > 0 && metrics.lowStockProducts > 0 && ', '}
                                {metrics.lowStockProducts > 0 && `${metrics.lowStockProducts} low stock`}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/inventory?filter=low-stock')}
                            className="text-orange-600 border-orange-300 hover:bg-orange-100"
                        >
                            View Details
                        </Button>
                    </div>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total Products */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/inventory')}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(metrics.totalProducts)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Across {formatNumber(metrics.totalCategories)} categories
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Value */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Inventory Value</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(metrics.totalInventoryValue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Based on current stock
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Alerts */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/inventory?filter=alerts')}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Stock Alerts</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-2xl font-bold text-orange-600">
                                        {formatNumber(alertCount)}
                                    </p>
                                    {alertCount > 0 && (
                                        <Badge variant="warning" className="text-xs">
                                            Urgent
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Requires immediate attention
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Suppliers */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/inventory?tab=suppliers')}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Suppliers</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(metrics.totalSuppliers)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Vendor partnerships
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Recent Adjustments</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(metrics.recentAdjustments)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Last 7 days
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Quick Actions</p>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/inventory?action=add-product')}
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => navigate('/inventory?tab=suppliers&action=add')}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add Supplier
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Low Stock Items */}
            {metrics.lowStockProducts > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Items Requiring Attention</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/inventory?filter=low-stock')}
                            >
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <p className="text-sm text-orange-800">
                                    {metrics.lowStockProducts} product{metrics.lowStockProducts !== 1 ? 's' : ''} below minimum stock level
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}