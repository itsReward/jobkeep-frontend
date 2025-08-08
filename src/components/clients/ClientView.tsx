// src/components/clients/ClientView.tsx
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, Button, Badge, Loading } from '@/components/ui'
import { Client } from '@/types'
import { Vehicle } from '@/services/api/vehicles'
import { useClient } from '@/hooks/useClients'
import { VehicleForm } from '@/components/forms/VehicleForm'
import {
    X,
    Edit,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Building,
    Car,
    Plus,
    Calendar,
    Hash,
    ExternalLink
} from 'lucide-react'
import { formatDate } from '@/utils/date'

interface ClientViewProps {
    clientId: string
    onClose: () => void
    onEdit: (client: Client) => void
    onAddVehicle?: (clientId: string) => void
}

export const ClientView: React.FC<ClientViewProps> = ({
                                                          clientId,
                                                          onClose,
                                                          onEdit,
                                                          onAddVehicle
                                                      }) => {
    const { data: client, isLoading, error, refetch } = useClient(clientId)
    const [showVehicleForm, setShowVehicleForm] = useState(false)

    const handleAddVehicle = () => {
        setShowVehicleForm(true)
    }

    const handleVehicleSuccess = () => {
        refetch() // Refresh client data to update vehicle list
    }

    if (isLoading) {
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

    if (error || !client) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-4xl">
                    <CardContent className="text-center p-8">
                        <p className="text-red-600">Failed to load client details</p>
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
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {client.clientName} {client.clientSurname}
                                </h2>
                                <p className="text-sm text-gray-500">Client Details</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(client)}
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
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                                {client.gender.charAt(0)}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Gender</p>
                                            <p className="text-sm text-gray-600">{client.gender}</p>
                                        </div>
                                    </div>

                                    {client.jobTitle && (
                                        <div className="flex items-center space-x-3">
                                            <Briefcase className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Job Title</p>
                                                <p className="text-sm text-gray-600">{client.jobTitle}</p>
                                            </div>
                                        </div>
                                    )}

                                    {client.company && (
                                        <div className="flex items-center space-x-3">
                                            <Building className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Company</p>
                                                <p className="text-sm text-gray-600">{client.company}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-3">
                                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Phone</p>
                                            <p className="text-sm text-gray-600">{client.phone}</p>
                                        </div>
                                    </div>

                                    {client.email && (
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Email</p>
                                                <p className="text-sm text-gray-600">{client.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start space-x-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Address</p>
                                            <p className="text-sm text-gray-600 leading-relaxed">{client.address}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Vehicles Section */}
                        <Card className="border border-gray-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Car className="h-5 w-5 text-gray-600" />
                                        <h3 className="text-lg font-medium text-gray-900">Vehicles</h3>
                                        <Badge variant="secondary">
                                            {client.vehicles?.length || 0}
                                        </Badge>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleAddVehicle}
                                        className="flex items-center space-x-1"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Vehicle</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {client.vehicles && client.vehicles.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {client.vehicles.map((vehicle: any) => (
                                            <Card key={vehicle.id} className="border border-gray-100 bg-gray-50">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-2 flex-1">
                                                            <h4 className="font-medium text-gray-900">
                                                                {vehicle.make} {vehicle.model}
                                                            </h4>

                                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                <Hash className="h-4 w-4" />
                                                                <span>{vehicle.regNumber || vehicle.registrationNumber}</span>
                                                            </div>

                                                            {vehicle.color && (
                                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                                    <div
                                                                        className="w-3 h-3 rounded border border-gray-300"
                                                                        style={{ backgroundColor: vehicle.color.toLowerCase() }}
                                                                    />
                                                                    <span>{vehicle.color}</span>
                                                                </div>
                                                            )}

                                                            {(vehicle.chassisNumber || vehicle.vinNumber) && (
                                                                <p className="text-xs text-gray-500 font-mono">
                                                                    VIN: {(vehicle.chassisNumber || vehicle.vinNumber)?.substring(0, 8)}...
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center space-x-1 ml-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // TODO: Navigate to vehicle details
                                                                    console.log('Go to vehicle details:', vehicle.id)
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                                title="Go to Vehicle Details"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No vehicles registered</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddVehicle}
                                            className="mt-3"
                                        >
                                            Add First Vehicle
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Client Statistics */}
                        <Card className="border border-gray-200 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">{client.vehicles?.length || 0}</p>
                                        <p className="text-sm text-gray-600">Vehicles</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">0</p>
                                        <p className="text-sm text-gray-600">Active Jobs</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">0</p>
                                        <p className="text-sm text-gray-600">Total Jobs</p>
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

            {/* Vehicle Form Modal */}
            {showVehicleForm && (
                <VehicleForm
                    preSelectedClientId={client.id}
                    onClose={() => setShowVehicleForm(false)}
                    onSuccess={handleVehicleSuccess}
                />
            )}
        </div>
    )
}

export default ClientView