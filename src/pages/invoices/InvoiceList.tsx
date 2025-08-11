// src/components/invoices/InvoiceList.tsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Pagination,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material'
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    Download as DownloadIcon,
    Payment as PaymentIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material'
import { formatCurrency, formatDate } from '@/utils/formatters'
import useInvoiceStore from '@/stores/invoiceStore'
import { useClients } from '@/hooks/useClients'
import {
    Invoice,
    InvoiceStatus,
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS,
    InvoiceListFilters
} from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const InvoiceList: React.FC = () => {
    const navigate = useNavigate()
    const {
        invoices,
        loading,
        error,
        pagination,
        filters,
        fetchInvoices,
        deleteInvoice,
        sendInvoiceToClient,
        downloadInvoicePdf,
        setFilters,
        clearFilters,
        clearError
    } = useInvoiceStore()

    const { clients = [], isLoading: clientsLoading } = useClients()

    // Local state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [localFilters, setLocalFilters] = useState<InvoiceListFilters>(filters)

    // Load data on component mount
    useEffect(() => {
        fetchInvoices()
        // Clients are automatically loaded by the useClients hook
    }, [])

    // Handle menu actions
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
        setAnchorEl(event.currentTarget)
        setSelectedInvoice(invoice)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedInvoice(null)
    }

    // Handle actions
    const handleEdit = () => {
        if (selectedInvoice) {
            navigate(`/invoices/edit/${selectedInvoice.invoiceId}`)
        }
        handleMenuClose()
    }

    const handleView = (invoice: Invoice) => {
        navigate(`/invoices/view/${invoice.invoiceId}`)
    }

    const handleDelete = () => {
        setDeleteDialog(true)
        handleMenuClose()
    }

    const confirmDelete = async () => {
        if (selectedInvoice) {
            try {
                await deleteInvoice(selectedInvoice.invoiceId)
                setDeleteDialog(false)
                setSelectedInvoice(null)
            } catch (error) {
                console.error('Failed to delete invoice:', error)
            }
        }
    }

    const handleSend = async () => {
        if (selectedInvoice) {
            try {
                await sendInvoiceToClient(selectedInvoice.invoiceId)
            } catch (error) {
                console.error('Failed to send invoice:', error)
            }
        }
        handleMenuClose()
    }

    const handleDownload = async () => {
        if (selectedInvoice) {
            try {
                await downloadInvoicePdf(selectedInvoice.invoiceId)
            } catch (error) {
                console.error('Failed to download invoice:', error)
            }
        }
        handleMenuClose()
    }

    const handleAddPayment = () => {
        if (selectedInvoice) {
            navigate(`/invoices/payment/${selectedInvoice.invoiceId}`)
        }
        handleMenuClose()
    }

    // Handle pagination
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        fetchInvoices({ page: value - 1 })
    }

    // Handle filters
    const applyFilters = () => {
        setFilters(localFilters)
        fetchInvoices({ page: 0, filters: localFilters })
        setShowFilters(false)
    }

    const clearAllFilters = () => {
        setLocalFilters({})
        clearFilters()
        fetchInvoices({ page: 0 })
        setShowFilters(false)
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

    if (loading && invoices.length === 0) {
        return <LoadingSpinner />
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Invoices
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/invoices/new')}
                    >
                        New Invoice
                    </Button>
                </Box>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                    {error}
                </Alert>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Filter Invoices
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    label="Search"
                                    value={localFilters.search || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                    placeholder="Invoice number, client name..."
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={localFilters.status || ''}
                                        onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value as InvoiceStatus })}
                                        label="Status"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {Object.values(InvoiceStatus).map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {INVOICE_STATUS_LABELS[status]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Client</InputLabel>
                                    <Select
                                        value={localFilters.clientId || ''}
                                        onChange={(e) => setLocalFilters({ ...localFilters, clientId: e.target.value })}
                                        label="Client"
                                    >
                                        <MenuItem value="">All Clients</MenuItem>
                                        {clients.map((client) => (
                                            <MenuItem key={client.clientId} value={client.clientId}>
                                                {client.name} {client.surname}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    label="From Date"
                                    type="date"
                                    value={localFilters.dateFrom || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    label="To Date"
                                    type="date"
                                    value={localFilters.dateTo || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="contained" onClick={applyFilters} size="small">
                                        Apply
                                    </Button>
                                    <Button variant="outlined" onClick={clearAllFilters} size="small">
                                        Clear
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Invoice Table */}
            <Card>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Invoice #</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Paid</TableCell>
                                <TableCell>Balance</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow
                                    key={invoice.invoiceId}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleView(invoice)}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {invoice.invoiceNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {invoice.clientName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(invoice.invoiceDate)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color={new Date(invoice.dueDate) < new Date() && invoice.status !== InvoiceStatus.PAID ? 'error' : 'inherit'}
                                        >
                                            {formatDate(invoice.dueDate)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatCurrency(invoice.totalAmount)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatCurrency(invoice.amountPaid)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color={invoice.balanceDue > 0 ? 'error' : 'success'}
                                            fontWeight="medium"
                                        >
                                            {formatCurrency(invoice.balanceDue)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={INVOICE_STATUS_LABELS[invoice.status]}
                                            color={getStatusColor(invoice.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleMenuClick(e, invoice)
                                            }}
                                            size="small"
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.page + 1}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}
            </Card>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleSend} disabled={selectedInvoice?.status === InvoiceStatus.PAID}>
                    <SendIcon sx={{ mr: 1 }} />
                    Send to Client
                </MenuItem>
                <MenuItem onClick={handleDownload}>
                    <DownloadIcon sx={{ mr: 1 }} />
                    Download PDF
                </MenuItem>
                <MenuItem onClick={handleAddPayment} disabled={selectedInvoice?.status === InvoiceStatus.PAID}>
                    <PaymentIcon sx={{ mr: 1 }} />
                    Add Payment
                </MenuItem>
                <MenuItem onClick={handleDelete} disabled={selectedInvoice?.status === InvoiceStatus.PAID}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete Invoice</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete invoice {selectedInvoice?.invoiceNumber}? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default InvoiceList