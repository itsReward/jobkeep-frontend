// src/components/modals/EmployeeViewModal.tsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Edit,
    Mail,
    Phone,
    MapPin,
    Building,
    Star,
    ClipboardList,
    Calendar,
    Award,
} from 'lucide-react'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { employeeService } from '@/services/api/employees'
import { formatDate } from '@/utils/date'

interface EmployeeViewModalProps {
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    employeeId: string | null
}

export const EmployeeViewModal: React.FC<EmployeeViewModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onEdit,
                                                                        employeeId,
                                                                    }) => {
    const { data: employee, isLoading } = useQuery({
        queryKey: ['employees', employeeId],
        queryFn: () => employeeService.getById(employeeId!),
        enabled: !!employeeId && isOpen,
    })

    const renderStars = (rating?: number) => {
        if (!rating) return <span className="text-gray-400">No rating</span>

        return (
            <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${
                            i < Math.floor(rating)
                                ? 'text-yellow-400 fill-current'
                                : i < rating
                                    ? 'text-yellow-400 fill-current opacity-50'
                                    : 'text-gray-300'
                        }`}
                    />
                ))}
                <span className="text-sm text-gray-600 ml-2">{rating.toFixed(1)}</span>
            </div>
        )
    }

    if (!isOpen) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={employee ? `${employee.employeeName} ${employee.employeeSurname}` : 'Employee Details'}
            size="xl"
        >
            {isLoading ? (
                <div className="py-8">
                    <Loading size="lg" />
                </div>
            ) : employee ? (
                <div className="space-y-6">
                    {/* Action Button */}
                    <div className="flex justify-end">
                        <Button onClick={onEdit} className="flex items-center space-x-2">
                            <Edit className="h-4 w-4" />
                            <span>Edit Employee</span>
                        </Button>
                    </div>

                    {/* Employee Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Personal Information */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                                                <p className="text-base font-medium text-gray-900">
                                                    {employee.employeeName} {employee.employeeSurname}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Email</label>
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <a
                                                        href={`mailto:${employee.email}`}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        {employee.email}
                                                    </a>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <a
                                                        href={`tel:${employee.phoneNumber}`}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        {employee.phoneNumber}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Position</label>
                                                <div className="mt-1">
                                                    <Badge variant="secondary">{employee.employeeRole}</Badge>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Department</label>
                                                <div className="flex items-center space-x-2">
                                                    <Building className="h-4 w-4 text-gray-400" />
                                                    <p className="text-sm text-gray-900">
                                                        {employee.employeeDepartment || 'No department assigned'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Rating</label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Award className="h-4 w-4 text-gray-400" />
                                                    {renderStars(employee.rating)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {employee.homeAddress && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Home Address</label>
                                            <div className="flex items-start space-x-2 mt-1">
                                                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                                <p className="text-sm text-gray-900">{employee.homeAddress}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Stats */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <ClipboardList className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                                        <p className="text-xl font-bold text-blue-600">
                                            {employee.jobCards?.length || 0}
                                        </p>
                                        <p className="text-xs text-gray-600">Active Job Cards</p>
                                    </div>

                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <Calendar className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                        <p className="text-xl font-bold text-green-600">
                                            {employee.rating ? Math.round(employee.rating * 20) : 0}%
                                        </p>
                                        <p className="text-xs text-gray-600">Performance Score</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Job Cards */}
                    {employee.jobCards && employee.jobCards.length > 0 && (
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Recent Job Cards ({employee.jobCards.length})
                                </h3>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-64 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Job Card</TableHead>
                                                <TableHead>Client</TableHead>
                                                <TableHead>Date In</TableHead>
                                                <TableHead>Priority</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employee.jobCards.slice(0, 5).map((jobCard) => (
                                                <TableRow key={jobCard.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-sm">{jobCard.jobCardName}</p>
                                                            <p className="text-xs text-gray-500">#{jobCard.jobCardNumber}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm text-gray-900">{jobCard.clientName}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm text-gray-900">
                                                            {formatDate(jobCard.dateAndTimeIn)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={jobCard.priority ? "error" : "secondary"} className="text-xs">
                                                            {jobCard.priority ? "High" : "Normal"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="py-8 text-center">
                    <p className="text-gray-500">Employee not found</p>
                </div>
            )}
        </Modal>
    )
}

