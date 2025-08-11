// src/components/invoices/InvoiceDashboard.tsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    LinearProgress,
    Tabs,
    Tab,
    Alert
} from '@mui/material'
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Receipt as ReceiptIcon,
    Payment as PaymentIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Add as AddIcon
} from '@mui/icons-material'
import useInvoiceStore from '@/stores/invoiceStore'
import {
    InvoiceStatus,
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS
} from '@/types/invoice'
import { formatCurrency, formatDate } from '@/utils/formatters'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`invoice-tabpanel-${index}`}
            aria-labelledby={`invoice-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    )
}

const InvoiceDashboard: React.FC = () => {
    const navigate = useNavigate()
    const {
        invoices,
        invoiceSummary,
        loading,
        error,
        fetchInvoices,
        fetchInvoiceSummary,
        clearError
    } = useInvoiceStore()

    const [tabValue, setTabValue] = useState(0)

    // Load data on component mount
    useEffect(() => {
        fetchInvoices({ size: 50 }) // Get more invoices for dashboard
        fetchInvoiceSummary()
    }, [])

    // Filter invoices by status
    const getInvoicesByStatus = (status: InvoiceStatus) => {
        return invoices.filter(invoice => invoice.status === status)
    }

    // Get overdue invoices
    const getOverdueInvoices = () => {
        const today = new Date().toISOString().split('T')[0]
        return invoices.filter(invoice =>
            invoice.status === InvoiceStatus.SENT &&
            invoice.dueDate < today
        )
    }

    // Get recent invoices
    const getRecentInvoices = () => {
        return invoices
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
    }

    // Calculate collection rate
    const getCollectionRate = () => {
        if (!invoiceSummary) return 0
        if (invoiceSummary.totalAmount === 0) return 0
        return (invoiceSummary.paidAmount / invoiceSummary.totalAmount) * 100
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
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

    if (loading && !invoiceSummary) {
        return <LoadingSpinner />
    }

    const overdueInvoices = getOverdueInvoices()
    const recentInvoices = getRecentInvoices()
    const collectionRate = getCollectionRate()

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Invoice Dashboard
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/invoices/new')}
                >
                    Create Invoice
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                    {error}
                </Alert>
            )}

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Total Invoices
                                    </Typography>
                                    <Typography variant="h4">
                                        {invoiceSummary?.totalInvoices || 0}
                                    </Typography>
                                </Box>
                                <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Total Amount
                                    </Typography>
                                    <Typography variant="h4">
                                        {formatCurrency(invoiceSummary?.totalAmount || 0)}
                                    </Typography>
                                </Box>
                                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Amount Paid
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {formatCurrency(invoiceSummary?.paidAmount || 0)}
                                    </Typography>
                                </Box>
                                <PaymentIcon color="success" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Outstanding
                                    </Typography>
                                    <Typography variant="h4" color="error.main">
                                        {formatCurrency(invoiceSummary?.pendingAmount || 0)}
                                    </Typography>
                                </Box>
                                <WarningIcon color="error" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Status Breakdown */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Invoice Status Breakdown
                            </Typography>
                            <Grid container spacing={2}>
                                {Object.values(InvoiceStatus).map((status) => {
                                    const count = status === InvoiceStatus.DRAFT ? invoiceSummary?.draftCount :
                                        status === InvoiceStatus.SENT ? invoiceSummary?.sentCount :
                                            status === InvoiceStatus.PAID ? invoiceSummary?.paidCount :
                                                status === InvoiceStatus.OVERDUE ? invoiceSummary?.overdueCount :
                                                    status === InvoiceStatus.CANCELLED ? invoiceSummary?.cancelledCount : 0

                                    return (
                                        <Grid item xs={6} sm={4} md={2.4} key={status}>
                                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                <Typography variant="h5" fontWeight="bold">
                                                    {count || 0}
                                                </Typography>
                                                <Chip
                                                    label={INVOICE_STATUS_LABELS[status]}
                                                    color={getStatusColor(status)}
                                                    size="small"
                                                />
                                            </Paper>
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Collection Rate
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h4" fontWeight="bold">
                                    {collectionRate.toFixed(1)}%
                                </Typography>
                                {collectionRate >= 80 ? (
                                    <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                                ) : (
                                    <WarningIcon color="warning" sx={{ ml: 1 }} />
                                )}
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={collectionRate}
                                color={collectionRate >= 80 ? 'success' : 'warning'}
                                sx={{ height: 8, borderRadius: 5 }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {formatCurrency(invoiceSummary?.paidAmount || 0)} of {formatCurrency(invoiceSummary?.totalAmount || 0)} collected
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs for different views */}
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Recent Invoices" />
                        <Tab label={`Overdue (${overdueInvoices.length})`} />
                        <Tab label="Pending Payment" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    {/* Recent Invoices */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Invoice #</TableCell>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentInvoices.map((invoice) => (
                                    <TableRow
                                        key={invoice.invoiceId}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/invoices/view/${invoice.invoiceId}`)}
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
                                            <Typography variant="body2">
                                                {formatCurrency(invoice.totalAmount)}
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
                                            <Button
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/invoices/view/${invoice.invoiceId}`)
                                                }}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    {/* Overdue Invoices */}
                    {overdueInvoices.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" color="success.main">
                                No Overdue Invoices
                            </Typography>
                            <Typography color="text.secondary">
                                All invoices are up to date!
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Invoice #</TableCell>
                                        <TableCell>Client</TableCell>
                                        <TableCell>Due Date</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Days Overdue</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {overdueInvoices.map((invoice) => {
                                        const daysOverdue = Math.floor(
                                            (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                                        )
                                        return (
                                            <TableRow
                                                key={invoice.invoiceId}
                                                hover
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/invoices/view/${invoice.invoiceId}`)}
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
                                                    <Typography variant="body2" color="error">
                                                        {formatDate(invoice.dueDate)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {formatCurrency(invoice.balanceDue)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${daysOverdue} days`}
                                                        color="error"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate(`/invoices/view/${invoice.invoiceId}`)
                                                        }}
                                                    >
                                                        Follow Up
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    {/* Pending Payment Invoices */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Invoice #</TableCell>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getInvoicesByStatus(InvoiceStatus.SENT).map((invoice) => (
                                    <TableRow
                                        key={invoice.invoiceId}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/invoices/view/${invoice.invoiceId}`)}
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
                                                {formatDate(invoice.dueDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
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
                                            <Button
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/invoices/payment/${invoice.invoiceId}`)
                                                }}
                                            >
                                                Add Payment
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Card>
        </Box>
    )
}

export default InvoiceDashboard