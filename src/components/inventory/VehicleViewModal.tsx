import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Edit,
    Car,
    Calendar,
    Settings,
    Package,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { productVehicleService } from '@/services/api/inventory'
import { formatCurrency, formatDate } from '@/utils/format'

interface VehicleViewModalProps {
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    vehicleId: string | null
}

export const VehicleViewModal: React.FC<VehicleViewModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onEdit,
                                                                      vehicleId,
                                                                  }) => {
    const { data: vehicle, isLoading } = useQuery({
        queryKey: ['product-vehicles', vehicleId, 'with-products'],
        queryFn: () => productVehicleService.getByIdWithProducts(vehicleId!),
        enabled: !!vehicleId && isOpen,
    })

    if (!isOpen) return null

    const totalValue = vehicle?.products.reduce((sum, product) =>
        sum + (product.unitPrice * product.stockLevel), 0
    ) || 0

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={vehicle ? `${vehicle.vehicleMake} ${vehicle.vehicleModel}` : 'Vehicle Type Details'}
            size="xl"
        >
            {isLoading ? (
                <div className="py-8">
                    <Loading size="lg" />
                </div>
            ) : vehicle ? (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {vehicle.vehicleMake} {vehicle.vehicleModel}
                                </h2>
                                <Badge variant={vehicle.isActive ? 'success' : 'secondary'}>
                                    {vehicle.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600">
                                {vehicle.yearRange && (
                                    <span>Year: {vehicle.yearRange}</span>
                                )}
                                {vehicle.engineType && (
                                    <span>Engine: {vehicle.engineType}</span>
                                )}
                            </div>
                        </div>
                        <Button onClick={onEdit} className="ml-4">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Vehicle Type
                        </Button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Compatible Products</p>
                                        <p className="text-2xl font-bold">{vehicle.products.length}</p>
                                    </div>
                                    <Package className="h-8 w-8 text-primary-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Value</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(totalValue)}
                                        </p>
                                    </div>
                                    <Settings className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active Products</p>
                                        <p className="text-2xl font-bold">
                                            {vehicle.products.filter(p => p.isActive).length}
                                        </p>
                                    </div>
                                    <Car className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Compatible Products */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Compatible Products ({vehicle.products.length})
                            </h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            {vehicle.products.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {vehicle.products.map((product) => (
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
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{product.stockLevel}</span>
                                                            {product.stockLevel === 0 && (
                                                                <Badge variant="error" className="text-xs">Out</Badge>
                                                            )}
                                                            {product.stockLevel > 0 && product.stockLevel <= product.minStockLevel && (
                                                                <Badge variant="warning" className="text-xs">Low</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {formatCurrency(product.unitPrice)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.isActive ? 'success' : 'secondary'}>
                                                            {product.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No compatible products</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Products can be assigned compatibility with this vehicle type when creating or editing them.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Record Information */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Record Information
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Created</p>
                                    <p className="font-medium">{formatDate(vehicle.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Last Updated</p>
                                    <p className="font-medium">{formatDate(vehicle.updatedAt)}</p>
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
                            Edit Vehicle Type
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <Car className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Vehicle type not found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        The vehicle type you're looking for doesn't exist or has been deleted.
                    </p>
                </div>
            )}
        </Modal>
    )
}