// src/components/invoices/InvoiceView.tsx
import React from 'react'
import {
    useInvoice,
    useInvoicePayments,
    useDownloadInvoicePdf,
    useEmailInvoiceToClient,
    useSendInvoiceToClient,
    useUpdateInvoiceStatus,
    useProcessPayment
} from '@/hooks/useInvoices'
import {
    Invoice,
    InvoiceStatus,
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS,
    INVOICE_ITEM_TYPE_LABELS,
    PAYMENT_METHOD_LABELS,
    PAYMENT_METHODS
} from '@/types/invoice.ts'
import { formatDate, formatCurrency } from '@/utils/formatters'
import {
    ArrowLeft,
    Calendar,
    Car,
    CheckCircle,
    Download,
    DollarSign,
    Edit,
    Mail,
    Package,
    Plus,
    Printer,
    Send,
    User,
    CreditCard,
    AlertTriangle,
    FileText,
    Clock,
    X
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    Button,
    Badge,
    Loading,
    Input
} from '@/components/ui'

interface InvoiceViewProps {
    invoiceId: string
    onClose: () => void
    onEdit: (invoice: Invoice) => void
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoiceId, onClose, onEdit }) => {
    const [showPaymentForm, setShowPaymentForm] = React.useState(false)
    const [paymentForm, setPaymentForm] = React.useState({
        amount: '',
        paymentMethod: PAYMENT_METHODS.CASH,
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
    })

    // Hooks
    const { data: invoice, isLoading: invoiceLoading, error: invoiceError } = useInvoice(invoiceId)
    const { data: payments = [], isLoading: paymentsLoading } = useInvoicePayments(invoiceId)
    const downloadPdf = useDownloadInvoicePdf()
    const emailToClient = useEmailInvoiceToClient()
    const sendToClient = useSendInvoiceToClient()
    const updateStatus = useUpdateInvoiceStatus()
    const processPayment = useProcessPayment()

    // Handlers
    const handleDownloadPdf = () => {
        downloadPdf.mutate(invoiceId)
    }

    const handleEmailToClient = () => {
        emailToClient.mutate({ id: invoiceId })
    }

    const handleSendToClient = () => {
        sendToClient.mutate(invoiceId)
    }

    const handleStatusChange = (status: InvoiceStatus) => {
        updateStatus.mutate({ id: invoiceId, statusUpdate: { status } })
    }

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        processPayment.mutate({
            invoiceId,
            amount: parseFloat(paymentForm.amount),
            paymentMethod: paymentForm.paymentMethod,
            paymentDate: paymentForm.paymentDate,
            notes: paymentForm.notes || undefined
        }, {
            onSuccess: () => {
                setShowPaymentForm(false)
                setPaymentForm({
                    amount: '',
                    paymentMethod: PAYMENT_METHODS.CASH,
                    paymentDate: new Date().toISOString().split('T')[0],
                    notes: ''
                })
            }
        })
    }

    const getStatusIcon = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.DRAFT:
                return <Edit className="h-4 w-4" />
            case InvoiceStatus.SENT:
                return <Send className="h-4 w-4" />
            case InvoiceStatus.PAID:
                return <CheckCircle className="h-4 w-4" />
            case InvoiceStatus.OVERDUE:
                return <AlertTriangle className="h-4 w-4" />
            case InvoiceStatus.CANCELLED:
                return <Clock className="h-4 w-4" />
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    if (invoiceLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loading size="lg" />
            </div>
        )
    }

    if (invoiceError || !invoice) {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Failed to load invoice</p>
                <Button variant="outline" onClick={onClose}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        )
    }

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const balanceDue = invoice.totalAmount - totalPaid

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onClose}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {invoice.invoiceNumber}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant={INVOICE_STATUS_COLORS[invoice.status]}
                                className="flex items-center gap-1"
                            >
                                {getStatusIcon(invoice.status)}
                                {INVOICE_STATUS_LABELS[invoice.status]}
                            </Badge>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">
                                Created {formatDate(invoice.invoiceDate)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onEdit(invoice)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                    <Button variant="outline" onClick={handleEmailToClient}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client & Vehicle Information */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Invoice Details</h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Client</p>
                                        <p className="font-medium">{invoice.clientName}</p>
                                    </div>
                                </div>
                                {invoice.vehicleInfo && (
                                    <div className="flex items-start gap-3">
                                        <Car className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Vehicle</p>
                                            <p className="font-medium">{invoice.vehicleInfo}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Invoice Date</p>
                                        <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Due Date</p>
                                        <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                                    </div>
                                </div>
                            </div>
                            {invoice.paymentTerms && (
                                <div>
                                    <p className="text-sm text-gray-500">Payment Terms</p>
                                    <p className="font-medium">{invoice.paymentTerms}</p>
                                </div>
                            )}
                            {invoice.notes && (
                                <div>
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="text-gray-700">{invoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Items ({invoice.items.length})
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {invoice.items.map((item, index) => (
                                    <div key={item.itemId} className="p-3 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{item.description}</p>
                                                    <Badge variant="outline">
                                                        {INVOICE_ITEM_TYPE_LABELS[item.itemType]}
                                                    </Badge>
                                                </div>
                                                {item.productCode && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Code: {item.productCode}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatCurrency(item.totalPrice)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} × {formatCurrency(item.unitPrice)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payments ({payments.length})
                                </h2>
                                {invoice.status !== InvoiceStatus.PAID && balanceDue > 0 && (
                                    <Button onClick={() => setShowPaymentForm(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Payment
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {paymentsLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loading />
                                </div>
                            ) : payments.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    No payments recorded
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {payments.map((payment) => (
                                        <div key={payment.paymentId} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {PAYMENT_METHOD_LABELS[payment.paymentMethod]} • {formatDate(payment.paymentDate)}
                                                </p>
                                                {payment.notes && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {payment.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="success">
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Financial Summary */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Financial Summary
                            </h2>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.discountAmount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Discount ({invoice.discountPercentage}%):
                                    </span>
                                    <span className="font-medium text-red-600">
                                        -{formatCurrency(invoice.discountAmount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Tax ({invoice.taxRate}%):
                                </span>
                                <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold">Total:</span>
                                    <span className="text-lg font-bold">
                                        {formatCurrency(invoice.totalAmount)}
                                    </span>
                                </div>
                            </div>
                            <div className="border-t pt-3 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount Paid:</span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(totalPaid)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Balance Due:</span>
                                    <span className={`font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(balanceDue)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Quick Actions</h2>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {invoice.status === InvoiceStatus.DRAFT && (
                                <Button
                                    className="w-full"
                                    onClick={() => handleStatusChange(InvoiceStatus.SENT)}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send to Client
                                </Button>
                            )}
                            {invoice.status !== InvoiceStatus.PAID && balanceDue <= 0 && (
                                <Button
                                    className="w-full"
                                    onClick={() => handleStatusChange(InvoiceStatus.PAID)}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Paid
                                </Button>
                            )}
                            <Button variant="outline" className="w-full" onClick={handleSendToClient}>
                                <Send className="h-4 w-4 mr-2" />
                                Send to Client
                            </Button>
                            <Button variant="outline" className="w-full" onClick={handleDownloadPdf}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Invoice
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payment Form Modal */}
            {showPaymentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Record Payment</h3>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowPaymentForm(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount *
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={balanceDue}
                                        step="0.01"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm(prev => ({
                                            ...prev,
                                            amount: e.target.value
                                        }))}
                                        placeholder={`Max: ${formatCurrency(balanceDue)}`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method *
                                    </label>
                                    <select
                                        value={paymentForm.paymentMethod}
                                        onChange={(e) => setPaymentForm(prev => ({
                                            ...prev,
                                            paymentMethod: e.target.value
                                        }))}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Date *
                                    </label>
                                    <Input
                                        type="date"
                                        value={paymentForm.paymentDate}
                                        onChange={(e) => setPaymentForm(prev => ({
                                            ...prev,
                                            paymentDate: e.target.value
                                        }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={paymentForm.notes}
                                        onChange={(e) => setPaymentForm(prev => ({
                                            ...prev,
                                            notes: e.target.value
                                        }))}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Payment reference, notes..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowPaymentForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processPayment.isPending}
                                    >
                                        {processPayment.isPending ? (
                                            <Loading size="sm" className="mr-2" />
                                        ) : (
                                            <CreditCard className="h-4 w-4 mr-2" />
                                        )}
                                        Record Payment
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default InvoiceView