// src/components/vehicles/VehicleView.tsx
import React from 'react'
import { Card, CardContent, CardHeader, Button, Badge, Loading } from '@/components/ui'
import { Vehicle } from '@/services/api/vehicles'
import { useVehicle } from '@/hooks/useVehicles'
import { useClient } from '@/hooks/useClients'
import {
    X,
    Edit,
    Car,
    User,
    Hash,
    Palette,
    Settings,
    Calendar,
    FileText,
    ExternalLink
} from 'lucide-react'

interface VehicleViewProps {
    vehicleId: string
    onClose: () => void
    onEdit: (vehicle: Vehicle) => void
    onViewClient?: (clientId: string) => void
}

export const VehicleView: React.FC<VehicleViewProps> = ({
                                                            vehicleId,
                                                            onClose,
                                                            onEdit,
                                                            onViewClient
                                                        }) => {
    const { data: vehicle, isLoading: vehicleLoading, error: vehicleError } = useVehicle(vehicleId)
    const { data: client, isLoading: clientLoading } = useClient(vehicle?.clientId || '')

    if (vehicleLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-4xl">
                    <CardContent className="flex items-center justify-center p-8">
                        <Loading size="lg" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (vehicleError || !vehicle) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-4xl">
                    <CardContent className="text-center p-8">
                        <p className="text-red-600">Failed to load vehicle details</p>
                        <Button onClick={onClose} className="mt-4">Close</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Car className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {vehicle.make} {vehicle.model}
                                </h2>
                                <p className="text-sm text-gray-500">Vehicle Details</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(vehicle)}
                                className="flex items-center space-x-1"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="overflow-y-auto">
                    <div className="space-y-6">
                        {/* Vehicle Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Car className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Make & Model</p>
                                            <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Hash className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Registration Number</p>
                                            <p className="text-sm text-gray-600 font-mono">{vehicle.regNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Palette className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Color</p>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded border border-gray-300"
                                                    style={{ backgroundColor: vehicle.color.toLowerCase() }}
                                                />
                                                <span className="text-sm text-gray-600">{vehicle.color}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Settings className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Chassis Number (VIN)</p>
                                            <p className="text-sm text-gray-600 font-mono break-all">{vehicle.chassisNumber}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Owner Information */}
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">Owner Information</h3>
                                        {onViewClient && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewClient(vehicle.clientId)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {clientLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loading size="sm" />
                                        </div>
                                    ) : client ? (
                                        <>
                                            <div className="flex items-center space-x-3">
                                                <User className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Full Name</p>
                                                    <p className="text-sm text-gray-600">{client.clientName} {client.clientSurname}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <div className="h-5 w-5 flex items-center justify-center">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {client.phone ? '📞' : '❌'}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Phone</p>
                                                    <p className="text-sm text-gray-600">{client.phone || 'Not provided'}</p>
                                                </div>
                                            </div>

                                            {client.email && (
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-5 w-5 flex items-center justify-center">
                                                        <Badge variant="secondary" className="text-xs">
                                                            ✉️
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Email</p>
                                                        <p className="text-sm text-gray-600">{client.email}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {(client.jobTitle || client.company) && (
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-5 w-5 flex items-center justify-center">
                                                        <Badge variant="secondary" className="text-xs">
                                                            💼
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Work</p>
                                                        <p className="text-sm text-gray-600">
                                                            {[client.jobTitle, client.company].filter(Boolean).join(' at ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500">Owner information not available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Service History Section (Placeholder) */}
                        <Card className="border border-gray-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5 text-gray-600" />
                                        <h3 className="text-lg font-medium text-gray-900">Service History</h3>
                                        <Badge variant="secondary">0</Badge>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        View All Services
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No service history found</p>
                                    <p className="text-sm text-gray-400 mt-1">Service records will appear here once work is completed</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Statistics */}
                        <Card className="border border-gray-200 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">0</p>
                                        <p className="text-sm text-gray-600">Total Services</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">0</p>
                                        <p className="text-sm text-gray-600">Active Jobs</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">0</p>
                                        <p className="text-sm text-gray-600">Pending Jobs</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">$0</p>
                                        <p className="text-sm text-gray-600">Total Spent</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}