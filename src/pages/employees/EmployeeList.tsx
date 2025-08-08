// src/pages/employees/EmployeeList.tsx - Updated with Modals
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
    UserCheck,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Filter,
    Star,
    Building,
    MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui'
import { EmployeeViewModal } from '@/components/modals/EmployeeViewModal'
import { EmployeeFormModal } from '@/components/modals/EmployeeFormModal'
import { employeeService } from '@/services/api/employees'
import { Employee } from '@/types'

export const EmployeeList: React.FC = () => {
    const queryClient = useQueryClient()

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

    // Fetch employees
    const { data: employees = [], isLoading, error, refetch } = useQuery({
        queryKey: ['employees'],
        queryFn: employeeService.getAll.bind(employeeService),
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: employeeService.delete.bind(employeeService),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
            toast.success('Employee deleted successfully!')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete employee')
        },
    })

    // Get unique departments for filtering
    const departments = useMemo(() => {
        const depts = employees
            .map(emp => emp.employeeDepartment)
            .filter(Boolean)
            .filter((dept, index, arr) => arr.indexOf(dept) === index)
        return depts.sort()
    }, [employees])

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch = searchTerm === '' ||
                employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.employeeSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.phoneNumber.includes(searchTerm) ||
                employee.employeeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (employee.employeeDepartment && employee.employeeDepartment.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesDepartment = selectedDepartment === '' ||
                employee.employeeDepartment === selectedDepartment

            return matchesSearch && matchesDepartment
        })
    }, [employees, searchTerm, selectedDepartment])

    // Modal handlers
    const handleCreateEmployee = () => {
        setSelectedEmployee(null)
        setFormMode('create')
        setFormModalOpen(true)
    }

    const handleEditEmployee = (employee: Employee) => {
        setSelectedEmployee(employee)
        setFormMode('edit')
        setFormModalOpen(true)
    }

    const handleViewEmployee = (employee: Employee) => {
        setSelectedEmployee(employee)
        setViewModalOpen(true)
    }

    const handleDeleteEmployee = async (employee: Employee) => {
        if (window.confirm(`Are you sure you want to delete ${employee.employeeName} ${employee.employeeSurname}?`)) {
            deleteMutation.mutate(employee.employeeId)
        }
    }

    const closeViewModal = () => {
        setViewModalOpen(false)
        setSelectedEmployee(null)
    }

    const closeFormModal = () => {
        setFormModalOpen(false)
        setSelectedEmployee(null)
    }

    const handleEditFromView = () => {
        setViewModalOpen(false)
        setFormMode('edit')
        setFormModalOpen(true)
    }

    const getRatingColor = (rating?: number) => {
        if (!rating) return 'gray'
        if (rating >= 4.5) return 'success'
        if (rating >= 3.5) return 'warning'
        return 'error'
    }

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

    if (isLoading) {
        return (
            <div className="p-6">
                <Loading size="lg" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-red-600 mb-4">Failed to load employees</p>
                        <Button onClick={() => refetch()} variant="outline">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <UserCheck className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                            <p className="text-gray-600">Manage your staff members and their information</p>
                        </div>
                    </div>
                    <Button onClick={handleCreateEmployee} className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Employee</span>
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
                                        placeholder="Search employees by name, email, phone, position, or department..."
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
                            </Button>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        <select
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            className="input"
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {filteredEmployees.length} of {employees.length} employees
                    </p>
                </div>

                {/* Employees Table */}
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loading size="lg" />
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="text-center py-12">
                                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">
                                    {employees?.length === 0 ? 'No employees found' : 'No employees match your filters'}
                                </p>
                                {employees?.length === 0 && (
                                    <Button onClick={handleCreateEmployee} variant="outline">
                                        Add Your First Employee
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Position
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee.employeeId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <UserCheck className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {employee.employeeName} {employee.employeeSurname}
                                                        </div>
                                                        {employee.homeAddress && (
                                                            <div className="text-sm text-gray-500 flex items-center">
                                                                <MapPin className="h-3 w-3 mr-1" />
                                                                {employee.homeAddress.length > 30
                                                                    ? `${employee.homeAddress.substring(0, 30)}...`
                                                                    : employee.homeAddress
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{employee.phoneNumber}</div>
                                                {employee.email && (
                                                    <div className="text-sm text-gray-500">{employee.email}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant="secondary">{employee.employeeRole}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {employee.employeeDepartment ? (
                                                    <Badge variant="outline">
                                                        <Building className="h-3 w-3 mr-1" />
                                                        {employee.employeeDepartment}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No department</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {employee.rating ? (
                                                    <div className="flex items-center">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < Math.floor(employee.rating!)
                                                                            ? 'text-yellow-400 fill-current'
                                                                            : i < employee.rating!
                                                                                ? 'text-yellow-400 fill-current opacity-50'
                                                                                : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="ml-2 text-sm text-gray-600">
                                {employee.rating.toFixed(1)}
                              </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No rating</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleViewEmployee(employee)
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
                                                            handleEditEmployee(employee)
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteEmployee(employee)
                                                        }}
                                                        disabled={deleteMutation.isPending}
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
            </div>

            {/* Modals */}
            <EmployeeViewModal
                isOpen={viewModalOpen}
                onClose={closeViewModal}
                onEdit={handleEditFromView}
                employeeId={selectedEmployee?.employeeId || null}
            />

            <EmployeeFormModal
                isOpen={formModalOpen}
                onClose={closeFormModal}
                employee={selectedEmployee || undefined}
                mode={formMode}
            />
        </>
    )
}