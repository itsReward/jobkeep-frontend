// src/components/invoices/InvoiceForm.tsx

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Autocomplete,
    Alert,
    Divider
} from '@mui/material'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import useInvoiceStore from '@/stores/invoiceStore'
import { useClients } from '@/hooks/useClients'
import { useJobCards } from '@/hooks/useJobCards'
import { productService } from '@/services/api/inventory'
import {
    CreateInvoiceDto,
    CreateInvoiceItemDto,
    InvoiceItemType,
    INVOICE_ITEM_TYPE_LABELS,
    ProductSearchResult
} from '@/types/invoice'
import { formatCurrency } from '@/utils/formatters'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Validation schema
const invoiceSchema = yup.object({
    clientId: yup.string().required('Client is required'),
    vehicleId: yup.string().required('Vehicle is required'),
    jobCardId: yup.string(),
    invoiceDate: yup.string().required('Invoice date is required'),
    dueDate: yup.string().required('Due date is required'),
    taxRate: yup.number().min(0).max(100).default(15),
    discountPercentage: yup.number().min(0).max(100).default(0),
    paymentTerms: yup.string().default('Net 30'),
    notes: yup.string(),
    items: yup.array().of(
        yup.object({
            description: yup.string().required('Description is required'),
            quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
            unitPrice: yup.number().min(0, 'Unit price must be non-negative').required('Unit price is required'),
            itemType: yup.string().required('Item type is required')
        })
    ).min(1, 'At least one item is required')
})

interface InvoiceFormProps {
    mode: 'create' | 'edit'
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ mode }) => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const {
        selectedInvoice,
        loading,
        error,
        createInvoice,
        updateInvoice,
        fetchInvoiceById,
        clearError
    } = useInvoiceStore()

    const { clients = [], isLoading: clientsLoading } = useClients()
    const { data: jobCards = [], isLoading: jobCardsLoading } = useJobCards()

    // Local state
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [clientVehicles, setClientVehicles] = useState<any[]>([])
    const [productSearchCache, setProductSearchCache] = useState<Record<string, ProductSearchResult[]>>({})

    // Form setup
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<CreateInvoiceDto>({
        resolver: yupResolver(invoiceSchema),
        defaultValues: {
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            taxRate: 15,
            discountPercentage: 0,
            paymentTerms: 'Net 30',
            items: [{ description: '', quantity: 1, unitPrice: 0, itemType: InvoiceItemType.LABOR }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    })

    const watchedItems = watch('items')
    const watchedTaxRate = watch('taxRate') || 15
    const watchedDiscountPercentage = watch('discountPercentage') || 0

    // Load data on component mount
    useEffect(() => {
        // Clients and job cards are automatically loaded by their respective hooks
        if (mode === 'edit' && id) {
            fetchInvoiceById(id)
        }
    }, [mode, id])

    // Set form values when editing
    useEffect(() => {
        if (mode === 'edit' && selectedInvoice) {
            setValue('clientId', selectedInvoice.clientId)
            setValue('vehicleId', selectedInvoice.vehicleId)
            setValue('jobCardId', selectedInvoice.jobCardId || '')
            setValue('invoiceDate', selectedInvoice.invoiceDate)
            setValue('dueDate', selectedInvoice.dueDate)
            setValue('taxRate', selectedInvoice.taxRate)
            setValue('discountPercentage', selectedInvoice.discountPercentage)
            setValue('paymentTerms', selectedInvoice.paymentTerms)
            setValue('notes', selectedInvoice.notes || '')

            // Set items
            const items = selectedInvoice.items.map(item => ({
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                itemType: item.itemType
            }))
            setValue('items', items)

            setSelectedClient(selectedInvoice.clientId)
        }
    }, [selectedInvoice, mode, setValue])

    // Update vehicles when client changes
    useEffect(() => {
        if (selectedClient) {
            const client = clients.find(c => c.clientId === selectedClient)
            setClientVehicles(client?.vehicles || [])
        } else {
            setClientVehicles([])
        }
    }, [selectedClient, clients])ClientVehicles([])
}
}, [selectedClient, clients])

// Calculate totals
const calculateTotals = useCallback(() => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const discountAmount = (subtotal * watchedDiscountPercentage) / 100
    const discountedSubtotal = subtotal - discountAmount
    const taxAmount = (discountedSubtotal * watchedTaxRate) / 100
    const totalAmount = discountedSubtotal + taxAmount

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
    }
}, [watchedItems, watchedTaxRate, watchedDiscountPercentage])

const totals = calculateTotals()

// Product search with caching
const handleProductSearch = async (searchTerm: string, index: number) => {
    if (!searchTerm.trim()) return []

    // Check cache first
    if (productSearchCache[searchTerm]) {
        return productSearchCache[searchTerm]
    }

    try {
        const results = await productService.search(searchTerm)
        const productResults: ProductSearchResult[] = results.map((product: any) => ({
            productId: product.productId,
            productCode: product.productCode,
            productName: product.productName,
            description: product.description,
            sellingPrice: product.sellingPrice,
            currentStock: product.currentStock,
            unitOfMeasure: product.unitOfMeasure
        }))

        // Cache results
        setProductSearchCache(prev => ({
            ...prev,
            [searchTerm]: productResults
        }))

        return productResults
    } catch (error) {
        console.error('Failed to search products:', error)
        return []
    }
}

// Handle product selection
const handleProductSelect = (product: ProductSearchResult, index: number) => {
    setValue(`items.${index}.productId`, product.productId)
    setValue(`items.${index}.description`, `${product.productCode} - ${product.productName}`)

    // For PART items, use the product's selling price
    const currentItemType = watchedItems[index]?.itemType
    if (currentItemType === InvoiceItemType.PART) {
        setValue(`items.${index}.unitPrice`, product.sellingPrice)
    }
}

// Handle item type change
const handleItemTypeChange = (itemType: InvoiceItemType, index: number) => {
    setValue(`items.${index}.itemType`, itemType)

    // If changing to PART and we have a selected product, update price
    if (itemType === InvoiceItemType.PART) {
        const currentItem = watchedItems[index]
        if (currentItem?.productId) {
            // Find product in cache and update price
            Object.values(productSearchCache).flat().forEach(product => {
                if (product.productId === currentItem.productId) {
                    setValue(`items.${index}.unitPrice`, product.sellingPrice)
                }
            })
        }
    }
}

// Add new item
const addItem = () => {
    append({ description: '', quantity: 1, unitPrice: 0, itemType: InvoiceItemType.LABOR })
}

// Remove item
const removeItem = (index: number) => {
    if (fields.length > 1) {
        remove(index)
    }
}

// Handle form submission
const onSubmit = async (data: CreateInvoiceDto) => {
    try {
        if (mode === 'create') {
            await createInvoice(data)
        } else if (mode === 'edit' && id) {
            await updateInvoice(id, data)
        }
        navigate('/invoices')
    } catch (error) {
        console.error('Failed to save invoice:', error)
    }
}

if (loading && mode === 'edit') {
    return <LoadingSpinner />
}

return (
    <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
                {mode === 'create' ? 'Create Invoice' : 'Edit Invoice'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/invoices')}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Invoice'}
                </Button>
            </Box>
        </Box>

        {/* Error Alert */}
        {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                {error}
            </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Invoice Details */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Invoice Details
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="clientId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.clientId}>
                                        <InputLabel>Client *</InputLabel>
                                        <Select
                                            {...field}
                                            label="Client *"
                                            onChange={(e) => {
                                                field.onChange(e)
                                                setSelectedClient(e.target.value)
                                                setValue('vehicleId', '') // Reset vehicle selection
                                            }}
                                        >
                                            {clients.map((client) => (
                                                <MenuItem key={client.clientId} value={client.clientId}>
                                                    {client.name} {client.surname}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.clientId && (
                                            <Typography variant="caption" color="error">
                                                {errors.clientId.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="vehicleId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.vehicleId}>
                                        <InputLabel>Vehicle *</InputLabel>
                                        <Select
                                            {...field}
                                            label="Vehicle *"
                                            disabled={!selectedClient}
                                        >
                                            {clientVehicles.map((vehicle) => (
                                                <MenuItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                                    {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.vehicleId && (
                                            <Typography variant="caption" color="error">
                                                {errors.vehicleId.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="jobCardId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>Job Card (Optional)</InputLabel>
                                        <Select
                                            {...field}
                                            label="Job Card (Optional)"
                                        >
                                            <MenuItem value="">None</MenuItem>
                                            {jobCards
                                                .filter(jc => jc.clientId === selectedClient)
                                                .map((jobCard) => (
                                                    <MenuItem key={jobCard.id} value={jobCard.id}>
                                                        {jobCard.jobCardNumber} - {jobCard.jobCardName}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="invoiceDate"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Invoice Date *"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.invoiceDate}
                                        helperText={errors.invoiceDate?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="dueDate"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Due Date *"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.dueDate}
                                        helperText={errors.dueDate?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="paymentTerms"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Payment Terms"
                                        fullWidth
                                        placeholder="e.g., Net 30, Due on receipt"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Controller
                                name="taxRate"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Tax Rate (%)"
                                        type="number"
                                        fullWidth
                                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                                        error={!!errors.taxRate}
                                        helperText={errors.taxRate?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Controller
                                name="discountPercentage"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Discount (%)"
                                        type="number"
                                        fullWidth
                                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                                        error={!!errors.discountPercentage}
                                        helperText={errors.discountPercentage?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Notes"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        placeholder="Additional notes or terms..."
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Invoice Items
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addItem}
                            size="small"
                        >
                            Add Item
                        </Button>
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description *</TableCell>
                                    <TableCell>Qty *</TableCell>
                                    <TableCell>Unit Price *</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <Controller
                                                name={`items.${index}.itemType`}
                                                control={control}
                                                render={({ field: typeField }) => (
                                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                                        <Select
                                                            {...typeField}
                                                            onChange={(e) => handleItemTypeChange(e.target.value as InvoiceItemType, index)}
                                                        >
                                                            {Object.values(InvoiceItemType).map((type) => (
                                                                <MenuItem key={type} value={type}>
                                                                    {INVOICE_ITEM_TYPE_LABELS[type]}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Controller
                                                name={`items.${index}.description`}
                                                control={control}
                                                render={({ field: descField }) => (
                                                    <Autocomplete
                                                        freeSolo
                                                        options={[]}
                                                        value={descField.value}
                                                        onInputChange={async (event, newInputValue) => {
                                                            descField.onChange(newInputValue)
                                                            if (newInputValue && newInputValue.length > 2) {
                                                                const results = await handleProductSearch(newInputValue, index)
                                                                // Update options dynamically - this is a simplified version
                                                                // In practice, you'd want to manage the options state more carefully
                                                            }
                                                        }}
                                                        onChange={(event, newValue) => {
                                                            if (typeof newValue === 'object' && newValue) {
                                                                handleProductSelect(newValue as ProductSearchResult, index)
                                                            } else {
                                                                descField.onChange(newValue || '')
                                                            }
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                size="small"
                                                                error={!!errors.items?.[index]?.description}
                                                                placeholder="Start typing to search products..."
                                                                sx={{ minWidth: 250 }}
                                                            />
                                                        )}
                                                    />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Controller
                                                name={`items.${index}.quantity`}
                                                control={control}
                                                render={({ field: qtyField }) => (
                                                    <TextField
                                                        {...qtyField}
                                                        type="number"
                                                        size="small"
                                                        inputProps={{ min: 0.1, step: 0.1 }}
                                                        error={!!errors.items?.[index]?.quantity}
                                                        sx={{ width: 80 }}
                                                    />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Controller
                                                name={`items.${index}.unitPrice`}
                                                control={control}
                                                render={({ field: priceField }) => (
                                                    <TextField
                                                        {...priceField}
                                                        type="number"
                                                        size="small"
                                                        inputProps={{
                                                            min: 0,
                                                            step: 0.01,
                                                            // Disable editing for PART items as price comes from inventory
                                                            readOnly: watchedItems[index]?.itemType === InvoiceItemType.PART
                                                        }}
                                                        error={!!errors.items?.[index]?.unitPrice}
                                                        sx={{ width: 100 }}
                                                    />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {formatCurrency(watchedItems[index]?.quantity * watchedItems[index]?.unitPrice || 0)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => removeItem(index)}
                                                disabled={fields.length === 1}
                                                size="small"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {errors.items && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                            {errors.items.message}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Invoice Totals */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Invoice Summary
                    </Typography>
                    <Box sx={{ maxWidth: 400, ml: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Subtotal:</Typography>
                            <Typography>{formatCurrency(totals.subtotal)}</Typography>
                        </Box>
                        {totals.discountAmount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Discount ({watchedDiscountPercentage}%):</Typography>
                                <Typography color="error">-{formatCurrency(totals.discountAmount)}</Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Tax ({watchedTaxRate}%):</Typography>
                            <Typography>{formatCurrency(totals.taxAmount)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">
                                Total:
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {formatCurrency(totals.totalAmount)}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </form>
    </Box>
)
}

export default InvoiceForm