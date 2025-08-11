import React, { useState } from 'react'
import {
    Box,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material'
import {
    Send as SendIcon,
    Email as EmailIcon,
    Download as DownloadIcon,
    Payment as PaymentIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import useInvoiceStore from '@/stores/invoiceStore'
import { Invoice, InvoiceStatus } from '@/types/invoice'

interface InvoiceQuickActionsProps {
    invoice: Invoice
    showLabels?: boolean
}

const InvoiceQuickActions: React.FC<InvoiceQuickActionsProps> = ({
                                                                     invoice,
                                                                     showLabels = false
                                                                 }) => {
    const navigate = useNavigate()
    const { sendInvoiceToClient, downloadInvoicePdf } = useInvoiceStore()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleEdit = () => {
        navigate(`/invoices/edit/${invoice.invoiceId}`)
        handleMenuClose()
    }

    const handleView = () => {
        navigate(`/invoices/view/${invoice.invoiceId}`)
        handleMenuClose()
    }

    const handleSend = async () => {
        try {
            await sendInvoiceToClient(invoice.invoiceId)
        } catch (error) {
            console.error('Failed to send invoice:', error)
        }
        handleMenuClose()
    }

    const handleDownload = async () => {
        try {
            await downloadInvoicePdf(invoice.invoiceId)
        } catch (error) {
            console.error('Failed to download invoice:', error)
        }
        handleMenuClose()
    }

    const handleAddPayment = () => {
        navigate(`/invoices/payment/${invoice.invoiceId}`)
        handleMenuClose()
    }

    if (showLabels) {
        return (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    disabled={invoice.status === InvoiceStatus.PAID}
                >
                    Edit
                </Button>
                <Button
                    size="small"
                    startIcon={<SendIcon />}
                    onClick={handleSend}
                    disabled={invoice.status === InvoiceStatus.PAID}
                >
                    Send
                </Button>
                <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                >
                    PDF
                </Button>
                <Button
                    size="small"
                    startIcon={<PaymentIcon />}
                    onClick={handleAddPayment}
                    disabled={invoice.status === InvoiceStatus.PAID}
                >
                    Payment
                </Button>
            </Box>
        )
    }

    return (
        <>
            <Button
                size="small"
                onClick={handleMenuClick}
                endIcon={<MoreVertIcon />}
            >
                Actions
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleView}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={handleEdit}
                    disabled={invoice.status === InvoiceStatus.PAID}
                >
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Invoice</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={handleSend}
                    disabled={invoice.status === InvoiceStatus.PAID}
                >
                    <ListItemIcon>
                        <SendIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Send to Client</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDownload}>
                    <ListItemIcon>
                        <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Download PDF</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={handleAddPayment}
                    disabled={invoice.status === InvoiceStatus.PAID}
                >
                    <ListItemIcon>
                        <PaymentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Add Payment</ListItemText>
                </MenuItem>
            </Menu>
        </>
    )
}

export default InvoiceQuickActions
