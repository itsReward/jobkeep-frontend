// src/pages/vehicles/VehicleList.tsx
import React, { useState, useMemo } from 'react'
import { useVehicles, useDeleteVehicle } from '@/hooks/useVehicles'
import { useClients } from '@/hooks/useClients'
import { Vehicle } from '@/services/api/vehicles'
import {
    Plus,
    Search,
    Filter,
    Edit,
    Eye,
    Trash2,
    Car,
    User,
    X,
    AlertTriangle,
    Hash
} from 'lucide-react'
import { Card, CardContent, CardHeader, Button, Badge, Input, Loading } from '@/components/ui'
import { VehicleForm } from '@/components/forms/VehicleForm'
import { VehicleView } from '@/components/vehicles/VehicleView'

const VehicleList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showVehicleForm, setShowVehicleForm] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const [viewingVehicleId, setViewingVehicleId] = useState<string | null>(null)

    // Filter states
    const [makeFilter, setMakeFilter] = useState('')
    const [colorFilter, setColorFilter] = useState('')
    const [clientFilter, setClientFilter] = useState('')

    // Fetch vehicles and clients
    const { data: vehicles, isLoading, error, refetch } = useVehicles(searchTerm)
    const { data: clients } = useClients()

    // Delete mutation
    const deleteVehicle = useDeleteVehicle()

    // Get unique makes and colors for filters
    const uniqueMakes = useMemo(() => {
        if (!vehicles) return []
        return [...new Set(vehicles.map(v => v.make))].sort()
    }, [vehicles])

    const uniqueColors = useMemo(() => {
        if (!vehicles) return []
        return [...new Set(vehicles.map(v => v.color))].sort()
    }, [vehicles])

    // Filtered vehicles based on additional filters
    const filteredVehicles = useMemo(() => {
        if (!vehicles) return []

        return vehicles.filter(vehicle => {
            // Make filter
            if (makeFilter && vehicle.make !== makeFilter) {
                return false
            }

            // Color filter
            if (colorFilter && vehicle.color !== colorFilter) {
                return false
            }

            // Client filter
            if (clientFilter && vehicle.clientId !== clientFilter) {
                return false
            }

            return true
        })
    }, [vehicles, makeFilter, colorFilter, clientFilter])

    // Event handlers
    const handleCreateVehicle = () => {
        setEditingVehicle(null)
        setShowVehicleForm(true)
    }

    const handleEditVehicle = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle)
        setShowVehicleForm(true)
    }

    const handleViewVehicle = (vehicleId: string) => {
        setViewingVehicleId(vehicleId)
    }

    const handleDeleteVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (selectedVehicle) {
            await deleteVehicle.mutateAsync(selectedVehicle.id)
            setShowDeleteModal(false)
            setSelectedVehicle(null)
        }
    }

    const resetFilters = () => {
        setSearchTerm('')
        setMakeFilter('')
        setColorFilter('')
        setClientFilter('')
    }

    const getOwnerName = (vehicle: Vehicle) => {
        if (vehicle.clientName && vehicle.clientSurname) {
            return `${vehicle.clientName} ${vehicle.clientSurname}`
        }

        // Fallback: find client by ID
        const client = clients?.find(c => c.id === vehicle.clientId)
        return client ? `${client.clientName} ${client.clientSurname}` : 'Unknown Owner'
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">Failed to load vehicles</p>
                        <Button onClick={() => refetch()} variant="outline">
                            Try Again
                        </Button>
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
                    <Car className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
                        <p className="text-gray-600">Manage your vehicle fleet</p>
                    </div>
                </div>
                <Button onClick={handleCreateVehicle} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Vehicle</span>
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search vehicles by make, model, registration, color, or owner..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                            {(makeFilter || colorFilter || clientFilter) && (
                                <Badge variant="secondary" className="ml-1">
                                    {[makeFilter, colorFilter, clientFilter].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Make Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Make
                                    </label>
                                    <select
                                        value={makeFilter}
                                        onChange={(e) => setMakeFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All makes</option>
                                        {uniqueMakes.map((make) => (
                                            <option key={make} value={make}>{make}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Color Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <select
                                        value={colorFilter}
                                        onChange={(e) => setColorFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All colors</option>
                                        {uniqueColors.map((color) => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Client Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Owner
                                    </label>
                                    <select
                                        value={clientFilter}
                                        onChange={(e) => setClientFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All owners</option>
                                        {clients?.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.clientName} {client.clientSurname}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reset Filters */}
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={resetFilters}
                                        className="w-full"
                                        disabled={!searchTerm && !makeFilter && !colorFilter && !clientFilter}
                                    >
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    {isLoading ? (
                        'Loading vehicles...'
                    ) : (
                        `Showing ${filteredVehicles.length} of ${vehicles?.length || 0} vehicles`
                    )}
                </p>
            </div>

            {/* Vehicle List */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loading size="lg" />
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="text-center py-12">
                            <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                {vehicles?.length === 0 ? 'No vehicles found' : 'No vehicles match your filters'}
                            </p>
                            {vehicles?.length === 0 && (
                                <Button onClick={handleCreateVehicle} variant="outline">
                                    Add Your First Vehicle
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehicle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Color
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredVehicles.map((vehicle) => (
                                    <tr
                                        key={vehicle.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleViewVehicle(vehicle.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Car className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {vehicle.make} {vehicle.model}
                                                    </div>
                                                    <div className="text-sm text-gray-500 font-mono">
                                                        VIN: {vehicle.chassisNumber.substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <Hash className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-mono text-gray-900">{vehicle.regNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{getOwnerName(vehicle)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded border border-gray-300"
                                                    style={{ backgroundColor: vehicle.color.toLowerCase() }}
                                                />
                                                <span className="text-sm text-gray-900">{vehicle.color}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleViewVehicle(vehicle.id)
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleEditVehicle(vehicle)
                                                    }}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteVehicle(vehicle)
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            {showVehicleForm && (
                <VehicleForm
                    vehicle={editingVehicle}
                    onClose={() => {
                        setShowVehicleForm(false)
                        setEditingVehicle(null)
                    }}
                    onSuccess={() => {
                        refetch()
                    }}
                />
            )}

            {viewingVehicleId && (
                <VehicleView
                    vehicleId={viewingVehicleId}
                    onClose={() => setViewingVehicleId(null)}
                    onEdit={(vehicle) => {
                        setViewingVehicleId(null)
                        handleEditVehicle(vehicle)
                    }}
                    onViewClient={(clientId) => {
                        // TODO: Implement client view navigation
                        console.log('View client:', clientId)
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Delete Vehicle</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete{' '}
                                <span className="font-medium">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.regNumber})
                </span>
                                ? This will also remove all associated service history and job cards.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteVehicle.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    disabled={deleteVehicle.isPending}
                                >
                                    {deleteVehicle.isPending ? 'Deleting...' : 'Delete Vehicle'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default VehicleList