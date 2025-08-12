// src/components/invoices/InvoiceForm.tsx
import React, { useState, useEffect, useMemo } from 'react'
import {
    useCreateInvoice,
    useUpdateInvoice,
    useProductSearch
} from '@/hooks/useInvoices.ts'
import { useClients } from '@/hooks/useClients.ts'
import { useJobCards } from '@/hooks/useJobCards.ts'
import {
    Invoice,
    CreateInvoiceDto,
    CreateInvoiceItemDto,
    InvoiceItemType,
    INVOICE_ITEM_TYPE_LABELS
} from '@/types/invoice'
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

interface InvoiceFormProps {
    invoice?: Invoice | null
    onClose: () => void
    onSuccess: () => void
}

interface InvoiceFormData {
    clientId: string
    vehicleId: string
    jobCardId?: string
    quotationId?: string
    invoiceDate: string
    dueDate: string
    taxRate: number
    discountPercentage: number
    paymentTerms: string
    notes: string
    items: CreateInvoiceItemDto[]
}

interface InvoiceItem extends CreateInvoiceItemDto {
    id: string // Temporary ID for form management
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onClose, onSuccess }) => {
    const isEditing = !!invoice
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const [showProductSearch, setShowProductSearch] = useState(false)
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)

    // Form state
    const [formData, setFormData] = useState<InvoiceFormData>({
        clientId: '',
        vehicleId: '',
        jobCardId: '',
        quotationId: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        taxRate: 15,
        discountPercentage: 0,
        paymentTerms: 'Net 30',
        notes: '',
        items: []
    })

    const [items, setItems] = useState<InvoiceItem[]>([])

    // Hooks
    const { data: clients = [], isLoading: clientsLoading } = useClients()
    const { data: jobCards = [], isLoading: jobCardsLoading } = useJobCards()
    const { data: productResults = [] } = useProductSearch(productSearchTerm)
    const createInvoice = useCreateInvoice()
    const updateInvoice = useUpdateInvoice()

    // Initialize form with existing invoice data
    useEffect(() => {
        if (invoice) {
            setFormData({
                clientId: invoice.clientId,
                vehicleId: invoice.vehicleId,
                jobCardId: invoice.jobCardId || '',
                quotationId: invoice.quotationId || '',
                invoiceDate: invoice.invoiceDate.split('T')[0],
                dueDate: invoice.dueDate.split('T')[0],
                taxRate: invoice.taxRate,
                discountPercentage: invoice.discountPercentage,
                paymentTerms: invoice.paymentTerms,
                notes: invoice.notes || '',
                items: []
            })

            // Convert existing items to form items
            const formItems: InvoiceItem[] = invoice.items.map((item, index) => ({
                id: `item-${index}`,
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                itemType: item.itemType
            }))
            setItems(formItems)
        }
    }, [invoice])

    // Get selected client's vehicles
    const selectedClient = clients.find(c => c.clientId === formData.clientId)
    const clientVehicles = selectedClient?.vehicles || []

    // Get job cards for selected client
    const clientJobCards = jobCards.filter(jc => jc.clientId === formData.clientId)

    // Calculate totals
    const calculations = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        const discountAmount = subtotal * (formData.discountPercentage / 100)
        const taxableAmount = subtotal - discountAmount
        const taxAmount = taxableAmount * (formData.taxRate / 100)
        const totalAmount = taxableAmount + taxAmount

        return {
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount
        }
    }, [items, formData.taxRate, formData.discountPercentage])

    // Handlers
    const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const addNewItem = () => {
        const newItem: InvoiceItem = {
            id: `item-${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            itemType: InvoiceItemType.LABOR
        }
        setItems(prev => [...prev, newItem])
    }

    const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ))
    }

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    const handleProductSelect = (product: any, itemIndex: number) => {
        const item = items[itemIndex]
        if (item) {
            updateItem(item.id, {
                productId: product.productId,
                description: product.productName,
                unitPrice: product.sellingPrice,
                itemType: InvoiceItemType.PART
            })
        }
        setShowProductSearch(false)
        setProductSearchTerm('')
        setSelectedItemIndex(null)
    }

    const openProductSearch = (itemIndex: number) => {
        setSelectedItemIndex(itemIndex)
        setShowProductSearch(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (items.length === 0) {
            alert('Please add at least one item to the invoice')
            return
        }

        // Convert form items to API format
        const invoiceItems: CreateInvoiceItemDto[] = items.map(item => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            itemType: item.itemType
        }))

        const invoiceData: CreateInvoiceDto = {
            ...formData,
            items: invoiceItems
        }

        if (isEditing && invoice) {
            updateInvoice.mutate(
                { id: invoice.invoiceId, invoice: invoiceData },
                { onSuccess }
            )
        } else {
            createInvoice.mutate(invoiceData, { onSuccess })
        }
    }

    const isLoading = createInvoice.isPending || updateInvoice.isPending

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Invoice' : 'Create Invoice'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEditing ? 'Update invoice details' : 'Create a new billing document'}
                    </p>
                </div>
                <Button variant="outline" onClick={onClose}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice Information
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Client Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="h-4 w-4 inline mr-1" />
                                    Client *
                                </label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => {
                                        handleInputChange('clientId', e.target.value)
                                        handleInputChange('vehicleId', '') // Reset vehicle when client changes
                                    }}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={clientsLoading}
                                >
                                    <option value="">Select a client</option>
                                    {clients.map((client) => (
                                        <option key={client.clientId} value={client.clientId}>
                                            {client.clientName} {client.clientSurname}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Vehicle Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Car className="h-4 w-4 inline mr-1" />
                                    Vehicle *
                                </label>
                                <select
                                    value={formData.vehicleId}
                                    onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                                    required
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={!formData.clientId}
                                >
                                    <option value="">Select a vehicle</option>
                                    {clientVehicles.map((vehicle) => (
                                        <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                            {vehicle.vehicleMake} {vehicle.vehicleModel} ({vehicle.registrationNumber})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Job Card Selection (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Card (Optional)
                                </label>
                                <select
                                    value={formData.jobCardId}
                                    onChange={(e) => handleInputChange('jobCardId', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={!formData.clientId}
                                >
                                    <option value="">No job card</option>
                                    {clientJobCards.map((jobCard) => (
                                        <option key={jobCard.id} value={jobCard.id}>
                                            {jobCard.jobCardName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Invoice Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4 inline mr-1" />
                                    Invoice Date *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.invoiceDate}
                                    onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4 inline mr-1" />
                                    Due Date *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Payment Terms */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Terms
                                </label>
                                <Input
                                    value={formData.paymentTerms}
                                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                                    placeholder="e.g., Net 30"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Additional notes or terms..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Items */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Invoice Items
                            </h2>
                            <Button type="button" onClick={addNewItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">No items added yet</p>
                                <Button type="button" onClick={addNewItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Item
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                            {/* Description */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description *
                                                </label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                        placeholder="Item description"
                                                        required
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => openProductSearch(index)}
                                                        title="Search products"
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Item Type */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Type
                                                </label>
                                                <select
                                                    value={item.itemType}
                                                    onChange={(e) => updateItem(item.id, { itemType: e.target.value as InvoiceItemType })}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    {Object.values(InvoiceItemType).map((type) => (
                                                        <option key={type} value={type}>
                                                            {INVOICE_ITEM_TYPE_LABELS[type]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quantity *
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                                    required
                                                />
                                            </div>

                                            {/* Unit Price */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit Price *
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                                    required
                                                />
                                            </div>

                                            {/* Total */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Total
                                                </label>
                                                <div className="p-2 bg-gray-100 rounded text-sm font-medium">
                                                    {formatCurrency(item.quantity * item.unitPrice)}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-700"
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

                {/* Calculations */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Calculations
                        </h2>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tax and Discount Settings */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tax Rate (%)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.taxRate}
                                        onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount (%)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.discountPercentage}
                                        onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
                                </div>
                                {calculations.discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">
                                            Discount ({formData.discountPercentage}%):
                                        </span>
                                        <span className="font-medium text-red-600">
                                            -{formatCurrency(calculations.discountAmount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Tax ({formData.taxRate}%):
                                    </span>
                                    <span className="font-medium">{formatCurrency(calculations.taxAmount)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold">Total:</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {formatCurrency(calculations.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || items.length === 0}>
                        {isLoading ? (
                            <Loading size="sm" className="mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {isEditing ? 'Update Invoice' : 'Create Invoice'}
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
                                    productResults.map((product) => (
                                        <div
                                            key={product.productId}
                                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleProductSelect(product, selectedItemIndex)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{product.productName}</p>
                                                    <p className="text-sm text-gray-600">{product.description}</p>
                                                    <div className="flex gap-4 mt-1">
                                                        <Badge variant="outline">
                                                            {product.productCode}
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">
                                                            Stock: {product.currentStock} {product.unitOfMeasure}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">
                                                        {formatCurrency(product.sellingPrice)}
                                                    </p>
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

export default InvoiceForm