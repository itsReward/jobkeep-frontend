// src/components/vehicles/VehicleView.tsx
import React from 'react'
import { Card, CardContent, CardHeader, Button, Badge, Loading } from '@/components/ui'
import { Vehicle } from '@/services/api/vehicles'
import { useVehicle } from '@/hooks/useVehicles'
import { useClient } from '@/hooks/useClients'
import { useJobCardsByVehicle } from '@/hooks/useJobCards'
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
    ExternalLink,
    ChevronRight
} from 'lucide-react'
import { formatDate } from '@/utils/date'

interface VehicleViewProps {
    vehicleId: string
    onClose: () => void
    onEdit: (vehicle: Vehicle) => void
    onViewClient?: (clientId: string) => void
    onViewJobCard?: (jobCardId: string) => void
}

export const VehicleView: React.FC<VehicleViewProps> = ({
                                                            vehicleId,
                                                            onClose,
                                                            onEdit,
                                                            onViewClient,
                                                            onViewJobCard
                                                        }) => {
    const { data: vehicle, isLoading: vehicleLoading, error: vehicleError } = useVehicle(vehicleId)
    const { data: client, isLoading: clientLoading } = useClient(vehicle?.clientId || '')
    const { data: jobCards, isLoading: jobCardsLoading } = useJobCardsByVehicle(vehicleId)

    // Filter completed job cards and sort by dateAndTimeClosed
    const completedJobCards = React.useMemo(() => {
        if (!jobCards) return []

        return jobCards
            .filter(jobCard => jobCard.dateAndTimeClosed) // Only completed job cards
            .sort((a, b) => {
                // Sort by dateAndTimeClosed, most recent first
                const dateA = new Date(a.dateAndTimeClosed!).getTime()
                const dateB = new Date(b.dateAndTimeClosed!).getTime()
                return dateB - dateA
            })
    }, [jobCards])

    const totalServices = completedJobCards.length

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

    const handleJobCardClick = (jobCardId: string) => {
        if (onViewJobCard) {
            onViewJobCard(jobCardId)
        } else {
            // TODO: Default navigation to job card view
            window.location.pathname = `/job-cards/${jobCardId}`
        }
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

                        {/* Service History Section */}
                        <Card className="border border-gray-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5 text-gray-600" />
                                        <h3 className="text-lg font-medium text-gray-900">Service History</h3>
                                        <Badge variant="secondary">{totalServices}</Badge>
                                    </div>
                                    {totalServices > 0 && (
                                        <Button size="sm" variant="outline">
                                            View All Services
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {jobCardsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loading size="sm" />
                                        <span className="ml-2 text-sm text-gray-500">Loading service history...</span>
                                    </div>
                                ) : completedJobCards.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No completed services found</p>
                                        <p className="text-sm text-gray-400 mt-1">Completed service records will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {completedJobCards.slice(0, 5).map((jobCard) => (
                                            <div
                                                key={jobCard.id}
                                                onClick={() => handleJobCardClick(jobCard.id)}
                                                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                            <FileText className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {jobCard.jobCardName}
                                                            </h4>
                                                            <div className="flex items-center space-x-4 mt-1">
                                                                <p className="text-xs text-gray-500">
                                                                    Completed: {formatDate(jobCard.dateAndTimeClosed!)}
                                                                </p>
                                                                {jobCard.serviceAdvisorName && (
                                                                    <p className="text-xs text-gray-500">
                                                                        Advisor: {jobCard.serviceAdvisorName}
                                                                    </p>
                                                                )}
                                                                {jobCard.priority && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Priority
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                            </div>
                                        ))}

                                        {completedJobCards.length > 5 && (
                                            <div className="text-center pt-3 border-t border-gray-100">
                                                <Button variant="ghost" size="sm" className="text-blue-600">
                                                    View {completedJobCards.length - 5} more services
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vehicle Statistics */}
                        <Card className="border border-gray-200 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">{totalServices}</p>
                                        <p className="text-sm text-gray-600">Total Services</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {jobCards?.filter(jc => !jc.dateAndTimeClosed).length || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Active Jobs</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {jobCards?.filter(jc => jc.priority && !jc.dateAndTimeClosed).length || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Priority Jobs</p>
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