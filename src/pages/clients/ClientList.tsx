// src/pages/clients/ClientList.tsx
import React, { useState, useMemo } from 'react'
import { useClients, useDeleteClient } from '@/hooks/useClients'
import { Client } from '@/types'
import {
    Plus,
    Search,
    Filter,
    Edit,
    Eye,
    Trash2,
    User,
    Car,
    X,
    AlertTriangle,
    Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, Button, Badge, Input, Loading } from '@/components/ui'
import { ClientForm } from '@/components/forms/ClientForm'
import { ClientView } from '@/components/clients/ClientView'

const ClientList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showClientForm, setShowClientForm] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [viewingClientId, setViewingClientId] = useState<string | null>(null)

    // Filter states
    const [genderFilter, setGenderFilter] = useState('')
    const [vehicleCountFilter, setVehicleCountFilter] = useState('')

    // Fetch clients with search
    const { data: clients, isLoading, error, refetch } = useClients(searchTerm)

    // Delete mutation
    const deleteClient = useDeleteClient()

    // Filtered clients based on additional filters
    const filteredClients = useMemo(() => {
        if (!clients) return []

        return clients.filter(client => {
            // Gender filter
            if (genderFilter && client.gender !== genderFilter) {
                return false
            }

            // Vehicle count filter
            if (vehicleCountFilter) {
                const vehicleCount = client.vehicles?.length || 0
                switch (vehicleCountFilter) {
                    case 'none':
                        if (vehicleCount > 0) return false
                        break
                    case 'one':
                        if (vehicleCount !== 1) return false
                        break
                    case 'multiple':
                        if (vehicleCount <= 1) return false
                        break
                }
            }

            return true
        })
    }, [clients, genderFilter, vehicleCountFilter])

    // Event handlers
    const handleCreateClient = () => {
        setEditingClient(null)
        setShowClientForm(true)
    }

    const handleEditClient = (client: Client) => {
        setEditingClient(client)
        setShowClientForm(true)
    }

    const handleViewClient = (clientId: string) => {
        setViewingClientId(clientId)
    }

    const handleDeleteClient = (client: Client) => {
        setSelectedClient(client)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (selectedClient) {
            await deleteClient.mutateAsync(selectedClient.id)
            setShowDeleteModal(false)
            setSelectedClient(null)
        }
    }

    const resetFilters = () => {
        setSearchTerm('')
        setGenderFilter('')
        setVehicleCountFilter('')
    }

    const getGenderBadgeColor = (gender: string) => {
        switch (gender.toLowerCase()) {
            case 'male':
                return 'bg-blue-100 text-blue-800'
            case 'female':
                return 'bg-pink-100 text-pink-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getVehicleCountBadge = (count: number) => {
        if (count === 0) return { color: 'bg-gray-100 text-gray-800', text: 'No vehicles' }
        if (count === 1) return { color: 'bg-green-100 text-green-800', text: '1 vehicle' }
        return { color: 'bg-blue-100 text-blue-800', text: `${count} vehicles` }
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">Failed to load clients</p>
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
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                        <p className="text-gray-600">Manage your customer database</p>
                    </div>
                </div>
                <Button onClick={handleCreateClient} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Client</span>
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
                                    placeholder="Search clients by name, email, phone, or company..."
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
                            {(genderFilter || vehicleCountFilter) && (
                                <Badge variant="secondary" className="ml-1">
                                    {[genderFilter, vehicleCountFilter].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Gender Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender
                                    </label>
                                    <select
                                        value={genderFilter}
                                        onChange={(e) => setGenderFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All genders</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>

                                {/* Vehicle Count Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vehicles
                                    </label>
                                    <select
                                        value={vehicleCountFilter}
                                        onChange={(e) => setVehicleCountFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="">All clients</option>
                                        <option value="none">No vehicles</option>
                                        <option value="one">One vehicle</option>
                                        <option value="multiple">Multiple vehicles</option>
                                    </select>
                                </div>

                                {/* Reset Filters */}
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={resetFilters}
                                        className="w-full"
                                        disabled={!searchTerm && !genderFilter && !vehicleCountFilter}
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
                        'Loading clients...'
                    ) : (
                        `Showing ${filteredClients.length} of ${clients?.length || 0} clients`
                    )}
                </p>
            </div>

            {/* Client List */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loading size="lg" />
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                                {clients?.length === 0 ? 'No clients found' : 'No clients match your filters'}
                            </p>
                            {clients?.length === 0 && (
                                <Button onClick={handleCreateClient} variant="outline">
                                    Add Your First Client
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gender
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehicles
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClients.map((client) => {
                                    const vehicleCount = client.vehicles?.length || 0
                                    const vehicleBadge = getVehicleCountBadge(vehicleCount)

                                    return (
                                        <tr
                                            key={client.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleViewClient(client.id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {client.clientName} {client.clientSurname}
                                                        </div>
                                                        {(client.jobTitle || client.company) && (
                                                            <div className="text-sm text-gray-500">
                                                                {[client.jobTitle, client.company].filter(Boolean).join(' at ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge className={getGenderBadgeColor(client.gender)}>
                                                    {client.gender}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge className={vehicleBadge.color}>
                                                    <Car className="h-3 w-3 mr-1" />
                                                    {vehicleBadge.text}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{client.phone}</div>
                                                {client.email && (
                                                    <div className="text-sm text-gray-500">{client.email}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleViewClient(client.id)
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
                                                            handleEditClient(client)
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
                                                            handleDeleteClient(client)
                                                        }}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            {showClientForm && (
                <ClientForm
                    client={editingClient}
                    onClose={() => {
                        setShowClientForm(false)
                        setEditingClient(null)
                    }}
                    onSuccess={() => {
                        refetch()
                    }}
                />
            )}

            {viewingClientId && (
                <ClientView
                    clientId={viewingClientId}
                    onClose={() => setViewingClientId(null)}
                    onEdit={(client) => {
                        setViewingClientId(null)
                        handleEditClient(client)
                    }}
                    onAddVehicle={(clientId) => {
                        // TODO: Implement vehicle form
                        console.log('Add vehicle for client:', clientId)
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Delete Client</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete{' '}
                                <span className="font-medium">
                  {selectedClient.clientName} {selectedClient.clientSurname}
                </span>
                                ? This will also remove all associated vehicles and service history.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteClient.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                    disabled={deleteClient.isPending}
                                >
                                    {deleteClient.isPending ? 'Deleting...' : 'Delete Client'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default ClientList