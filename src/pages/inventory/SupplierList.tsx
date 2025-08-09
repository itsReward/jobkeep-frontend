// src/pages/inventory/SupplierList.tsx
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Truck,
    Mail,
    Phone,
    Building,
    Upload,
    Download,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { SupplierFormModal } from '@/components/inventory/SupplierFormModal'
import { SupplierViewModal } from '@/components/inventory/SupplierViewModal'
import { BulkImportModal } from '@/components/inventory/BulkImportModal'
import { supplierService } from '@/services/api/inventory'
import { Supplier } from '@/types'
import { formatDate } from '@/utils/format'

export const SupplierList: React.FC = () => {
    const queryClient = useQueryClient()

    const [searchTerm, setSearchTerm] = useState('')
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

    // Fetch suppliers
    const { data: suppliers = [], isLoading, error, refetch } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getAll.bind(supplierService),
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: supplierService.delete.bind(supplierService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
            toast.success('Supplier deleted successfully!')
        },
        onError: () => {
            toast.error('Failed to delete supplier')
        },
    })

    // Export mutation
    const exportMutation = useMutation({
        mutationFn: supplierService.exportSuppliers.bind(supplierService),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `suppliers_${new Date().toISOString().split('T')[0]}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('Suppliers exported successfully!')
        },
        onError: () => {
            toast.error('Failed to export suppliers')
        },
    })

    // Filter suppliers
    const filteredSuppliers = useMemo(() => {
        if (!searchTerm) return suppliers

        const term = searchTerm.toLowerCase()
        return suppliers.filter(supplier =>
            supplier.supplierName.toLowerCase().includes(term) ||
            supplier.companyName?.toLowerCase().includes(term) ||
            supplier.email?.toLowerCase().includes(term) ||
            supplier.phone?.toLowerCase().includes(term) ||
            supplier.contactPerson?.toLowerCase().includes(term)
        )
    }, [suppliers, searchTerm])

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setFormMode('edit')
        setFormModalOpen(true)
    }

    const handleView = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setViewModalOpen(true)
    }

    const handleDelete = (supplier: Supplier) => {
        if (window.confirm(`Are you sure you want to delete "${supplier.supplierName}"?`)) {
            deleteMutation.mutate(supplier.supplierId)
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
                    <Truck className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading suppliers</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        There was an error loading the suppliers. Please try again.
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
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setBulkImportModalOpen(true)}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => exportMutation.mutate()}
                        disabled={exportMutation.isPending}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedSupplier(null)
                            setFormMode('create')
                            setFormModalOpen(true)
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Supplier
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Suppliers</p>
                                <p className="text-2xl font-bold">{filteredSuppliers.length}</p>
                            </div>
                            <Truck className="h-8 w-8 text-primary-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Suppliers</p>
                                <p className="text-2xl font-bold text-success-600">
                                    {filteredSuppliers.filter(s => s.isActive).length}
                                </p>
                            </div>
                            <Building className="h-8 w-8 text-success-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">With Email</p>
                                <p className="text-2xl font-bold">
                                    {filteredSuppliers.filter(s => s.email).length}
                                </p>
                            </div>
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Suppliers Table */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium">Suppliers ({filteredSuppliers.length})</h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Payment Terms</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSuppliers.map((supplier) => (
                                    <TableRow key={supplier.supplierId}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                    <Truck className="h-4 w-4 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {supplier.supplierName}
                                                    </div>
                                                    {supplier.taxNumber && (
                                                        <div className="text-sm text-gray-500">
                                                            Tax: {supplier.taxNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {supplier.contactPerson && (
                                                    <div className="text-sm font-medium">
                                                        {supplier.contactPerson}
                                                    </div>
                                                )}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Mail className="h-3 w-3" />
                                                        {supplier.email}
                                                    </div>
                                                )}
                                                {supplier.phone && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Phone className="h-3 w-3" />
                                                        {supplier.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {supplier.companyName ? (
                                                <span className="text-sm">{supplier.companyName}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400">No company</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {supplier.paymentTerms ? (
                                                <Badge variant="secondary">
                                                    {supplier.paymentTerms}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not specified</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={supplier.isActive ? 'success' : 'secondary'}>
                                                {supplier.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(supplier.createdAt)}
                      </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(supplier)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(supplier)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(supplier)}
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

                        {filteredSuppliers.length === 0 && (
                            <div className="text-center py-12">
                                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm
                                        ? 'Try adjusting your search criteria.'
                                        : 'Get started by adding your first supplier.'}
                                </p>
                                {!searchTerm && (
                                    <Button
                                        className="mt-4"
                                        onClick={() => {
                                            setSelectedSupplier(null)
                                            setFormMode('create')
                                            setFormModalOpen(true)
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Supplier
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <SupplierFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                supplier={selectedSupplier}
                mode={formMode}
            />

            <SupplierViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                supplierId={selectedSupplier?.supplierId || null}
            />

            <BulkImportModal
                isOpen={bulkImportModalOpen}
                onClose={() => setBulkImportModalOpen(false)}
                type="suppliers"
            />
        </div>
    )
}