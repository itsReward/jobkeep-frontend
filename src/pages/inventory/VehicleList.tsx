// src/pages/inventory/VehicleList.tsx
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Car,
    Calendar,
    Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { VehicleFormModal } from '@/components/inventory/VehicleFormModal'
import { VehicleViewModal } from '@/components/inventory/VehicleViewModal'
import { productVehicleService } from '@/services/api/inventory'
import { ProductVehicle } from '@/types'
import { formatDate } from '@/utils/format'

export const VehicleList: React.FC = () => {
    const queryClient = useQueryClient()

    const [searchTerm, setSearchTerm] = useState('')
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<ProductVehicle | null>(null)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

    // Fetch vehicles
    const { data: vehicles = [], isLoading, error, refetch } = useQuery({
        queryKey: ['product-vehicles'],
        queryFn: productVehicleService.getAll.bind(productVehicleService),
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: productVehicleService.delete.bind(productVehicleService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-vehicles'] })
            toast.success('Vehicle type deleted successfully!')
        },
        onError: () => {
            toast.error('Failed to delete vehicle type')
        },
    })

    // Filter vehicles
    const filteredVehicles = useMemo(() => {
        if (!searchTerm) return vehicles

        const term = searchTerm.toLowerCase()
        return vehicles.filter(vehicle =>
            vehicle.vehicleMake.toLowerCase().includes(term) ||
            vehicle.vehicleModel.toLowerCase().includes(term) ||
            vehicle.yearRange?.toLowerCase().includes(term) ||
            vehicle.engineType?.toLowerCase().includes(term)
        )
    }, [vehicles, searchTerm])

    // Group vehicles by make
    const vehiclesByMake = useMemo(() => {
        const grouped = filteredVehicles.reduce((acc, vehicle) => {
            const make = vehicle.vehicleMake
            if (!acc[make]) {
                acc[make] = []
            }
            acc[make].push(vehicle)
            return acc
        }, {} as Record<string, ProductVehicle[]>)

        return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    }, [filteredVehicles])

    const handleEdit = (vehicle: ProductVehicle) => {
        setSelectedVehicle(vehicle)
        setFormMode('edit')
        setFormModalOpen(true)
    }

    const handleView = (vehicle: ProductVehicle) => {
        setSelectedVehicle(vehicle)
        setViewModalOpen(true)
    }

    const handleDelete = (vehicle: ProductVehicle) => {
        if (window.confirm(`Are you sure you want to delete "${vehicle.vehicleMake} ${vehicle.vehicleModel}"?`)) {
            deleteMutation.mutate(vehicle.vehicleId)
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
                    <Car className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading vehicle types</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        There was an error loading the vehicle types. Please try again.
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
                        placeholder="Search vehicle types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                    />
                </div>

                <Button
                    onClick={() => {
                        setSelectedVehicle(null)
                        setFormMode('create')
                        setFormModalOpen(true)
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle Type
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Vehicle Types</p>
                                <p className="text-2xl font-bold">{filteredVehicles.length}</p>
                            </div>
                            <Car className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Vehicle Makes</p>
                                <p className="text-2xl font-bold text-success-600">
                                    {vehiclesByMake.length}
                                </p>
                            </div>
                            <Settings className="h-8 w-8 text-success-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Types</p>
                                <p className="text-2xl font-bold">
                                    {filteredVehicles.filter(v => v.isActive).length}
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Vehicle Types by Make */}
            {vehiclesByMake.length > 0 ? (
                <div className="space-y-6">
                    {vehiclesByMake.map(([make, makeVehicles]) => (
                        <Card key={make}>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    {make} ({makeVehicles.length} models)
                                </h3>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Model</TableHead>
                                                <TableHead>Year Range</TableHead>
                                                <TableHead>Engine Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {makeVehicles.map((vehicle) => (
                                                <TableRow key={vehicle.vehicleId}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <Car className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {vehicle.vehicleModel}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {vehicle.yearRange ? (
                                                            <Badge variant="secondary">
                                                                {vehicle.yearRange}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">Not specified</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {vehicle.engineType ? (
                                                            <span className="text-sm">{vehicle.engineType}</span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">Not specified</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={vehicle.isActive ? 'success' : 'secondary'}>
                                                            {vehicle.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDate(vehicle.createdAt)}
                            </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleView(vehicle)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(vehicle)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(vehicle)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Car className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicle types found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm
                                ? 'Try adjusting your search criteria.'
                                : 'Get started by adding your first vehicle type.'}
                        </p>
                        {!searchTerm && (
                            <Button
                                className="mt-4"
                                onClick={() => {
                                    setSelectedVehicle(null)
                                    setFormMode('create')
                                    setFormModalOpen(true)
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Vehicle Type
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <VehicleFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                vehicle={selectedVehicle}
                mode={formMode}
            />

            <VehicleViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                vehicleId={selectedVehicle?.vehicleId || null}
            />
        </div>
    )
}