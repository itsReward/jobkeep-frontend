// src/components/invoices/InvoiceDetail.tsx

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Alert
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Send as SendIcon,
    Email as EmailIcon,
    Download as DownloadIcon,
    Payment as PaymentIcon,
    MoreVert as MoreVertIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import useInvoiceStore from '@/stores/invoiceStore'
import {
    InvoiceStatus,
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS,
    CreateInvoicePaymentDto,
    PAYMENT_METHODS,
    PAYMENT_METHOD_LABELS,
    UpdateInvoiceStatusDto
} from '@/types/invoice'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Payment form validation
const paymentSchema = yup.object({
    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    paymentMethod: yup.string().required('Payment method is required'),
    paymentDate: yup.string().required('Payment date is required'),
    notes: yup.string()
})

const InvoiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const {
        selectedInvoice,
        invoicePayments,
        loading,
        error,
        fetchInvoiceById,
        fetchInvoicePayments,
        processPayment,
        updateInvoiceStatus,
        sendInvoiceToClient,
        emailInvoiceToClient,
        downloadInvoicePdf,
        clearError
    } = useInvoiceStore()

    // Local state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [paymentDialog, setPaymentDialog] = useState(false)
    const [statusDialog, setStatusDialog] = useState(false)
    const [emailDialog, setEmailDialog] = useState(false)

    // Payment form
    const {
        control: paymentControl,
        handleSubmit: handlePaymentSubmit,
        reset: resetPaymentForm,
        formState: { errors: paymentErrors }
    } = useForm<CreateInvoicePaymentDto>({
        resolver: yupResolver(paymentSchema),
        defaultValues: {
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: PAYMENT_METHODS.CASH
        }
    })

    // Status form
    const [newStatus, setNewStatus] = useState<InvoiceStatus>(InvoiceStatus.DRAFT)
    const [statusNotes, setStatusNotes] = useState('')

    // Email form
    const [emailTo, setEmailTo] = useState('')
    const [emailSubject, setEmailSubject] = useState('')
    const [emailMessage, setEmailMessage] = useState('')

    // Load data on component mount
    useEffect(() => {
        if (id) {
            fetchInvoiceById(id)
            fetchInvoicePayments(id)
        }
    }, [id])

    // Set default email when invoice loads
    useEffect(() => {
        if (selectedInvoice) {
            setEmailTo(selectedInvoice.clientName) // You may want to get actual email from client data
            setEmailSubject(`Invoice ${selectedInvoice.invoiceNumber}`)
            setEmailMessage(`Dear ${selectedInvoice.clientName},\n\nPlease find attached your invoice ${selectedInvoice.invoiceNumber}.\n\nThank you for your business.`)
        }
    }, [selectedInvoice])

    // Handle menu actions
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    // Handle payment submission
    const onPaymentSubmit = async (data: CreateInvoicePaymentDto) => {
        if (!id) return

        try {
            await processPayment({
                ...data,
                invoiceId: id
            })
            setPaymentDialog(false)
            resetPaymentForm()
        } catch (error) {
            console.error('Failed to process payment:', error)
        }
    }

    // Handle status update
    const handleStatusUpdate = async () => {
        if (!id) return

        try {
            await updateInvoiceStatus(id, {
                status: newStatus,
                notes: statusNotes
            })
            setStatusDialog(false)
            setStatusNotes('')
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    // Handle send invoice
    const handleSendInvoice = async () => {
        if (!id) return

        try {
            await sendInvoiceToClient(id)
        } catch (error) {
            console.error('Failed to send invoice:', error)
        }
        handleMenuClose()
    }

    // Handle email invoice
    const handleEmailInvoice = async () => {
        if (!id) return

        try {
            await emailInvoiceToClient(id, {
                to: emailTo,
                subject: emailSubject,
                message: emailMessage
            })
            setEmailDialog(false)
        } catch (error) {
            console.error('Failed to email invoice:', error)
        }
    }

    // Handle download PDF
    const handleDownloadPdf = async () => {
        if (!id) return

        try {
            await downloadInvoicePdf(id)
        } catch (error) {
            console.error('Failed to download PDF:', error)
        }
        handleMenuClose()
    }

    const getStatusColor = (status: InvoiceStatus) => {
        const colorMap = {
            [InvoiceStatus.DRAFT]: 'default',
            [InvoiceStatus.SENT]: 'warning',
            [InvoiceStatus.PAID]: 'success',
            [InvoiceStatus.OVERDUE]: 'error',
            [InvoiceStatus.CANCELLED]: 'secondary'
        } as const
        return colorMap[status] || 'default'
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (!selectedInvoice) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" color="error">
                    Invoice not found
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/invoices')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        Invoice {selectedInvoice.invoiceNumber}
                    </Typography>
                    <Chip
                        label={INVOICE_STATUS_LABELS[selectedInvoice.status]}
                        color={getStatusColor(selectedInvoice.status)}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/invoices/edit/${selectedInvoice.invoiceId}`)}
                        disabled={selectedInvoice.status === InvoiceStatus.PAID}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={() => setPaymentDialog(true)}
                        disabled={selectedInvoice.status === InvoiceStatus.PAID}
                    >
                        Add Payment
                    </Button>
                    <IconButton onClick={handleMenuClick}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Invoice Information */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Invoice Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Client
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedInvoice.clientName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Vehicle
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedInvoice.vehicleInfo || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Invoice Date
                                    </Typography>
                                    <Typography variant="body1">
                                        {formatDate(selectedInvoice.invoiceDate)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Due Date
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        color={new Date(selectedInvoice.dueDate) < new Date() && selectedInvoice.status !== InvoiceStatus.PAID ? 'error' : 'inherit'}
                                    >
                                        {formatDate(selectedInvoice.dueDate)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Payment Terms
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedInvoice.paymentTerms}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Created
                                    </Typography>
                                    <Typography variant="body1">
                                        {formatDateTime(selectedInvoice.createdAt)}
                                    </Typography>
                                </Grid>
                                {selectedInvoice.notes && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            Notes
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedInvoice.notes}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Items
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell align="right">Qty</TableCell>
                                            <TableCell align="right">Unit Price</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedInvoice.items.map((item) => (
                                            <TableRow key={item.itemId}>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {item.description}
                                                    </Typography>
                                                    {item.productCode && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Code: {item.productCode}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={item.itemType}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(item.unitPrice)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight="medium">
                                                        {formatCurrency(item.totalPrice)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    {invoicePayments.length > 0 && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Payment History
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Method</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Notes</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {invoicePayments.map((payment) => (
                                                <TableRow key={payment.paymentId}>
                                                    <TableCell>
                                                        {formatDate(payment.paymentDate)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {PAYMENT_METHOD_LABELS[payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || payment.paymentMethod}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontWeight="medium">
                                                            {formatCurrency(payment.amount)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={payment.status}
                                                            color="success"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {payment.notes || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Invoice Summary */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Invoice Summary
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Subtotal:</Typography>
                                    <Typography>{formatCurrency(selectedInvoice.subtotal)}</Typography>
                                </Box>
                                {selectedInvoice.discountAmount > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>Discount:</Typography>
                                        <Typography color="error">-{formatCurrency(selectedInvoice.discountAmount)}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Tax ({selectedInvoice.taxRate}%):</Typography>
                                    <Typography>{formatCurrency(selectedInvoice.taxAmount)}</Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Total:
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {formatCurrency(selectedInvoice.totalAmount)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="success.main">Amount Paid:</Typography>
                                    <Typography color="success.main" fontWeight="medium">
                                        {formatCurrency(selectedInvoice.amountPaid)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color={selectedInvoice.balanceDue > 0 ? 'error' : 'success.main'} fontWeight="bold">
                                        Balance Due:
                                    </Typography>
                                    <Typography color={selectedInvoice.balanceDue > 0 ? 'error' : 'success.main'} fontWeight="bold">
                                        {formatCurrency(selectedInvoice.balanceDue)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ReceiptIcon />}
                                onClick={() => setStatusDialog(true)}
                                sx={{ mb: 1 }}
                            >
                                Update Status
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleSendInvoice} disabled={selectedInvoice.status === InvoiceStatus.PAID}>
                    <SendIcon sx={{ mr: 1 }} />
                    Send to Client
                </MenuItem>
                <MenuItem onClick={() => { setEmailDialog(true); handleMenuClose(); }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    Email Invoice
                </MenuItem>
                <MenuItem onClick={handleDownloadPdf}>
                    <DownloadIcon sx={{ mr: 1 }} />
                    Download PDF
                </MenuItem>
            </Menu>

            {/* Payment Dialog */}
            <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Payment</DialogTitle>
                <form onSubmit={handlePaymentSubmit(onPaymentSubmit)}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Invoice Balance: {formatCurrency(selectedInvoice.balanceDue)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="amount"
                                    control={paymentControl}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Payment Amount *"
                                            type="number"
                                            fullWidth
                                            inputProps={{ min: 0.01, step: 0.01, max: selectedInvoice.balanceDue }}
                                            error={!!paymentErrors.amount}
                                            helperText={paymentErrors.amount?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="paymentMethod"
                                    control={paymentControl}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!paymentErrors.paymentMethod}>
                                            <InputLabel>Payment Method *</InputLabel>
                                            <Select {...field} label="Payment Method *">
                                                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                                                    <MenuItem key={key} value={key}>
                                                        {label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {paymentErrors.paymentMethod && (
                                                <Typography variant="caption" color="error">
                                                    {paymentErrors.paymentMethod.message}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="paymentDate"
                                    control={paymentControl}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Payment Date *"
                                            type="date"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            error={!!paymentErrors.paymentDate}
                                            helperText={paymentErrors.paymentDate?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="notes"
                                    control={paymentControl}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Notes"
                                            multiline
                                            rows={3}
                                            fullWidth
                                            placeholder="Payment reference, notes..."
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Process Payment
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Status Update Dialog */}
            <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Invoice Status</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Current Status: {INVOICE_STATUS_LABELS[selectedInvoice.status]}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>New Status</InputLabel>
                                <Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as InvoiceStatus)}
                                    label="New Status"
                                >
                                    {Object.values(InvoiceStatus).map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {INVOICE_STATUS_LABELS[status]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Notes"
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
                                placeholder="Reason for status change..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
                    <Button onClick={handleStatusUpdate} variant="contained">
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Email Dialog */}
            <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Email Invoice</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="To"
                                value={emailTo}
                                onChange={(e) => setEmailTo(e.target.value)}
                                fullWidth
                                placeholder="client@email.com"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Message"
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                multiline
                                rows={6}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
                    <Button onClick={handleEmailInvoice} variant="contained">
                        Send Email
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}


export default InvoiceDetail