// src/components/forms/QuotationForm.tsx
import React, { useState, useEffect, useMemo } from 'react'
import {
    useCreateQuotation,
    useProductSearch
} from '@/hooks/useQuotations.ts'
import { useClients } from '@/hooks/useClients.ts'
import { useVehicles } from '@/hooks/useVehicles.ts'
import {
    Quotation,
    CreateQuotationDto,
    CreateQuotationItemDto,
    QuotationItemType,
    QUOTATION_ITEM_TYPE_LABELS,
    DEFAULT_QUOTATION_TAX_RATE,
    DEFAULT_QUOTATION_VALID_DAYS
} from '@/types/quotation'
import { formatCurrency } from '@/utils/formatters.ts'
import {
    Plus,
    Trash2,
    Save,
    X,
    Calendar,
    User,
    Car,
    FileText,
    DollarSign,
    Package,
    Search
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    Button,
    Input,
    Loading,
    Badge
} from '@/components/ui'

interface QuotationFormProps {
    quotation?: Quotation | null
    onClose: () => void
    onSuccess: () => void
}

interface QuotationFormData {
    clientId: string
    vehicleId: string
    validUntil: string
    taxRate: number
    discountPercentage: number
    notes: string
    termsAndConditions: string
    items: CreateQuotationItemDto[]
}

interface QuotationItem extends CreateQuotationItemDto {
    id: string // Temporary ID for form management
}

const QuotationForm: React.FC<QuotationFormProps> = ({ quotation, onClose, onSuccess }) => {
    const isEditing = !!quotation
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const [showProductSearch, setShowProductSearch] = useState(false)
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)

    // Form state
    const [formData, setFormData] = useState<QuotationFormData>({
        clientId: '',
        vehicleId: '',
        validUntil: new Date(Date.now() + DEFAULT_QUOTATION_VALID_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxRate: DEFAULT_QUOTATION_TAX_RATE,
        discountPercentage: 0,
        notes: '',
        termsAndConditions: '',
        items: []
    })

    const [items, setItems] = useState<QuotationItem[]>([])

    // Hooks
    const { data: clients = [], isLoading: clientsLoading } = useClients()
    const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles()
    const { data: productResults = [] } = useProductSearch(productSearchTerm)
    const createQuotation = useCreateQuotation()

    // Get vehicles for selected client
    const availableVehicles = useMemo(() => {
        if (!formData.clientId) return []
        return vehicles.filter(vehicle => vehicle.clientId === formData.clientId)
    }, [vehicles, formData.clientId])

    // Calculate totals
    const calculations = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        const taxAmount = subtotal * (formData.taxRate / 100)
        const discountAmount = subtotal * (formData.discountPercentage / 100)
        const totalAmount = subtotal + taxAmount - discountAmount

        return {
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount
        }
    }, [items, formData.taxRate, formData.discountPercentage])

    // Initialize form with existing quotation data
    useEffect(() => {
        if (quotation) {
            setFormData({
                clientId: '', // Will need to derive from client name
                vehicleId: '', // Will need to derive from vehicle info
                validUntil: quotation.validUntil || '',
                taxRate: quotation.taxRate,
                discountPercentage: quotation.discountPercentage,
                notes: quotation.notes || '',
                termsAndConditions: quotation.termsAndConditions || '',
                items: []
            })

            const quotationItems: QuotationItem[] = quotation.items.map((item, index) => ({
                id: `existing-${index}`,
                productId: undefined, // We don't have this in the response
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                itemType: item.itemType
            }))

            setItems(quotationItems)
        }
    }, [quotation])

    // Add new item
    const addItem = () => {
        const newItem: QuotationItem = {
            id: `new-${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            itemType: QuotationItemType.SERVICE
        }
        setItems([...items, newItem])
    }

    // Remove item
    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    // Update item
    const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    // Select product for item
    const selectProduct = (productId: string, product: any) => {
        if (selectedItemIndex !== null) {
            const item = items[selectedItemIndex]
            updateItem(item.id, 'productId', productId)
            updateItem(item.id, 'description', product.productName)
            updateItem(item.id, 'unitPrice', product.sellingPrice)
            updateItem(item.id, 'itemType', QuotationItemType.PART)
        }
        setShowProductSearch(false)
        setProductSearchTerm('')
        setSelectedItemIndex(null)
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.clientId) {
            alert('Please select a client')
            return
        }

        if (items.length === 0) {
            alert('Please add at least one item')
            return
        }

        const quotationData: CreateQuotationDto = {
            clientId: formData.clientId,
            vehicleId: formData.vehicleId || undefined,
            validUntil: formData.validUntil || undefined,
            taxRate: formData.taxRate,
            discountPercentage: formData.discountPercentage,
            notes: formData.notes || undefined,
            termsAndConditions: formData.termsAndConditions || undefined,
            items: items.map(item => ({
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                itemType: item.itemType
            }))
        }

        createQuotation.mutate(quotationData, {
            onSuccess: () => {
                onSuccess()
            }
        })
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="inline h-4 w-4 mr-1" />
                            Client *
                        </label>
                        <select
                            value={formData.clientId}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    clientId: e.target.value,
                                    vehicleId: '' // Reset vehicle when client changes
                                }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                            disabled={clientsLoading}
                        >
                            <option value="">Select Client</option>
                            {clients.map(client => (
                                <option key={client.clientId} value={client.clientId}>
                                    {client.name} {client.surname}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Vehicle Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Car className="inline h-4 w-4 mr-1" />
                            Vehicle
                        </label>
                        <select
                            value={formData.vehicleId}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={!formData.clientId || vehiclesLoading}
                        >
                            <option value="">Select Vehicle (Optional)</option>
                            {availableVehicles.map(vehicle => (
                                <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.regNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dates and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Valid Until
                        </label>
                        <Input
                            type="date"
                            value={formData.validUntil}
                            onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Rate (%)
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.taxRate}
                            onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount (%)
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.discountPercentage}
                            onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
                        />
                    </div>
                </div>

                {/* Items Section */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Quotation Items</h3>
                            <Button type="button" onClick={addItem} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No items added yet. Click "Add Item" to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            {/* Description */}
                                            <div className="md:col-span-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description *
                                                </label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedItemIndex(index)
                                                            setShowProductSearch(true)
                                                        }}
                                                        className="flex-shrink-0"
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Quantity */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quantity *
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>

                                            {/* Unit Price */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit Price *
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>

                                            {/* Item Type */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Type *
                                                </label>
                                                <select
                                                    value={item.itemType}
                                                    onChange={(e) => updateItem(item.id, 'itemType', e.target.value as QuotationItemType)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    required
                                                >
                                                    {Object.values(QuotationItemType).map(type => (
                                                        <option key={type} value={type}>
                                                            {QUOTATION_ITEM_TYPE_LABELS[type]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Total Price */}
                                            <div className="md:col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Total
                                                </label>
                                                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-right font-medium">
                                                    {formatCurrency(item.quantity * item.unitPrice)}
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <div className="md:col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-700 w-full"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Calculations Summary */}
                <Card>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-right">
                                <span className="text-gray-600">Subtotal:</span>
                                <p className="font-medium">{formatCurrency(calculations.subtotal)}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                                <p className="font-medium">{formatCurrency(calculations.taxAmount)}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-600">Discount ({formData.discountPercentage}%):</span>
                                <p className="font-medium text-red-600">-{formatCurrency(calculations.discountAmount)}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-600">Total:</span>
                                <p className="font-bold text-lg">{formatCurrency(calculations.totalAmount)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="inline h-4 w-4 mr-1" />
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Additional notes or comments..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Terms and Conditions
                        </label>
                        <textarea
                            value={formData.termsAndConditions}
                            onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Terms and conditions for this quotation..."
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createQuotation.isPending}
                        className="flex items-center gap-2"
                    >
                        {createQuotation.isPending ? (
                            <Loading size="sm" className="mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isEditing ? 'Update Quotation' : 'Create Quotation'}
                    </Button>
                </div>
            </form>

            {/* Product Search Modal */}
            {showProductSearch && selectedItemIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Search Products</h3>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowProductSearch(false)
                                        setProductSearchTerm('')
                                        setSelectedItemIndex(null)
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search products..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {productSearchTerm.length < 2 ? (
                                    <p className="text-gray-500 text-center py-4">
                                        Type at least 2 characters to search
                                    </p>
                                ) : productResults.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">
                                        No products found
                                    </p>
                                ) : (
                                    productResults.map(product => (
                                        <div
                                            key={product.productId}
                                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => selectProduct(product.productId, product)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium">{product.productName}</p>
                                                    <p className="text-sm text-gray-600">{product.productCode}</p>
                                                    <p className="text-xs text-gray-500">{product.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(product.sellingPrice)}</p>
                                                    <p className="text-sm text-gray-600">Stock: {product.currentStock}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default QuotationForm