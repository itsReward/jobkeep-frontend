// src/pages/inventory/modals/SupplierViewModal.tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Edit,
    Truck,
    Mail,
    Phone,
    MapPin,
    Building,
    Calendar,
    CreditCard,
    Hash,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { supplierService } from '@/services/api/inventory'
import { formatDate } from '@/utils/format'

interface SupplierViewModalProps {
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    supplierId: string | null
}

export const SupplierViewModal: React.FC<SupplierViewModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onEdit,
                                                                        supplierId,
                                                                    }) => {
    const { data: supplier, isLoading } = useQuery({
        queryKey: ['suppliers', supplierId],
        queryFn: () => supplierService.getById(supplierId!),
        enabled: !!supplierId && isOpen,
    })

    if (!isOpen) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={supplier ? supplier.supplierName : 'Supplier Details'}
            size="lg"
        >
            {isLoading ? (
                <div className="py-8">
                    <Loading size="lg" />
                </div>
            ) : supplier ? (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{supplier.supplierName}</h2>
                                <Badge variant={supplier.isActive ? 'success' : 'secondary'}>
                                    {supplier.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            {supplier.companyName && (
                                <p className="text-gray-600">{supplier.companyName}</p>
                            )}
                        </div>
                        <Button onClick={onEdit} className="ml-4">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Supplier
                        </Button>
                    </div>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-medium">Contact Information</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {supplier.contactPerson && (
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Building className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Contact Person</p>
                                        <p className="font-medium">{supplier.contactPerson}</p>
                                    </div>
                                </div>
                            )}

                            {supplier.email && (
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <a
                                            href={`mailto:${supplier.email}`}
                                            className="font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            {supplier.email}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {supplier.phone && (
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Phone className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <a
                                            href={`tel:${supplier.phone}`}
                                            className="font-medium text-green-600 hover:text-green-700"
                                        >
                                            {supplier.phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {supplier.address && (
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPin className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Address</p>
                                        <p className="font-medium">{supplier.address}</p>
                                    </div>
                                </div>
                            )}

                            {!supplier.contactPerson && !supplier.email && !supplier.phone && !supplier.address && (
                                <p className="text-gray-500 text-sm italic">No contact information available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Business Information */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-medium">Business Information</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {supplier.paymentTerms && (
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Terms</p>
                                        <Badge variant="secondary">{supplier.paymentTerms}</Badge>
                                    </div>
                                </div>
                            )}

                            {supplier.taxNumber && (
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Hash className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tax Number</p>
                                        <p className="font-medium font-mono">{supplier.taxNumber}</p>
                                    </div>
                                </div>
                            )}

                            {!supplier.paymentTerms && !supplier.taxNumber && (
                                <p className="text-gray-500 text-sm italic">No business information available</p>
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
                                    <p className="font-medium">{formatDate(supplier.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Last Updated</p>
                                    <p className="font-medium">{formatDate(supplier.updatedAt)}</p>
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
                            Edit Supplier
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <Truck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Supplier not found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        The supplier you're looking for doesn't exist or has been deleted.
                    </p>
                </div>
            )}
        </Modal>
    )
}