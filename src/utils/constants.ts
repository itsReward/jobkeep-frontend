export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'JobKeep'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  VEHICLES: '/vehicles',
  EMPLOYEES: '/employees',
  JOBCARDS: '/jobcards',
  APPOINTMENTS: '/appointments',
    PARTS_REQUISITION: '/parts-requisition',
    INVOICES: '/invoices',
  QUOTATIONS: '/quotations',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const

export const JOB_CARD_STATUSES = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  FROZEN: 'FROZEN',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const

export const JOB_CARD_STATUS_LABELS = {
  [JOB_CARD_STATUSES.OPEN]: 'Open',
  [JOB_CARD_STATUSES.IN_PROGRESS]: 'In Progress',
  [JOB_CARD_STATUSES.FROZEN]: 'Frozen',
  [JOB_CARD_STATUSES.COMPLETED]: 'Completed',
  [JOB_CARD_STATUSES.CLOSED]: 'Closed',
} as const

export const JOB_CARD_STATUS_COLORS = {
  [JOB_CARD_STATUSES.OPEN]: 'secondary',
  [JOB_CARD_STATUSES.IN_PROGRESS]: 'warning',
  [JOB_CARD_STATUSES.FROZEN]: 'error',
  [JOB_CARD_STATUSES.COMPLETED]: 'success',
  [JOB_CARD_STATUSES.CLOSED]: 'gray',
} as const

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOBILE_MONEY: 'MOBILE_MONEY',
  CHEQUE: 'CHEQUE',
} as const

export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export const INVOICE_STATUSES = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const

export const QUOTATION_STATUSES = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CONVERTED: 'CONVERTED',
} as const

export const QUOTATION_STATUS_LABELS = {
  [QUOTATION_STATUSES.DRAFT]: 'Draft',
  [QUOTATION_STATUSES.PENDING]: 'Pending',
  [QUOTATION_STATUSES.APPROVED]: 'Approved',
  [QUOTATION_STATUSES.REJECTED]: 'Rejected',
  [QUOTATION_STATUSES.EXPIRED]: 'Expired',
  [QUOTATION_STATUSES.CONVERTED]: 'Converted',
} as const

export const QUOTATION_STATUS_COLORS = {
  [QUOTATION_STATUSES.DRAFT]: 'secondary',
  [QUOTATION_STATUSES.PENDING]: 'warning',
  [QUOTATION_STATUSES.APPROVED]: 'success',
  [QUOTATION_STATUSES.REJECTED]: 'error',
  [QUOTATION_STATUSES.EXPIRED]: 'gray',
  [QUOTATION_STATUSES.CONVERTED]: 'blue',
} as const

export const PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

export const PRIORITY_LABELS = {
  [PRIORITIES.LOW]: 'Low',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.HIGH]: 'High',
  [PRIORITIES.URGENT]: 'Urgent',
} as const

export const PRIORITY_COLORS = {
  [PRIORITIES.LOW]: 'gray',
  [PRIORITIES.MEDIUM]: 'secondary',
  [PRIORITIES.HIGH]: 'warning',
  [PRIORITIES.URGENT]: 'error',
} as const



//invoice constants
export const DEFAULT_TAX_RATE = 15 // 15% for Zimbabwe
export const DEFAULT_PAYMENT_TERMS = 'Net 30'
export const INVOICE_NUMBER_PREFIX = 'INV'

// Quotation constants
export const DEFAULT_QUOTATION_TAX_RATE = 15 // 15% for Zimbabwe
export const DEFAULT_QUOTATION_VALID_DAYS = 30 // 30 days validity
export const QUOTATION_NUMBER_PREFIX = 'QUO'


export const INVOICE_EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv'
} as const

export const QUOTATION_EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv'
} as const

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const

export const INVOICE_TEMPLATES = {
  STANDARD: 'standard',
  DETAILED: 'detailed',
  SIMPLE: 'simple'
} as const

export const QUOTATION_TEMPLATES = {
  STANDARD: 'standard',
  DETAILED: 'detailed',
  SIMPLE: 'simple'
} as const


export const PART_REQUISITION_STATUSES = {
    REQUESTED: 'REQUESTED',
    APPROVED: 'APPROVED',
    DISBURSED: 'DISBURSED',
    USED: 'USED',
    PARTIALLY_USED: 'PARTIALLY_USED',
    NOT_AVAILABLE: 'NOT_AVAILABLE',
    REJECTED: 'REJECTED',
} as const

export const PART_REQUISITION_STATUS_LABELS = {
    [PART_REQUISITION_STATUSES.REQUESTED]: 'Requested',
    [PART_REQUISITION_STATUSES.APPROVED]: 'Approved',
    [PART_REQUISITION_STATUSES.DISBURSED]: 'Disbursed',
    [PART_REQUISITION_STATUSES.USED]: 'Used',
    [PART_REQUISITION_STATUSES.PARTIALLY_USED]: 'Partially Used',
    [PART_REQUISITION_STATUSES.NOT_AVAILABLE]: 'Not Available',
    [PART_REQUISITION_STATUSES.REJECTED]: 'Rejected',
} as const

export const PART_REQUISITION_STATUS_COLORS = {
    [PART_REQUISITION_STATUSES.REQUESTED]: 'warning',
    [PART_REQUISITION_STATUSES.APPROVED]: 'secondary',
    [PART_REQUISITION_STATUSES.DISBURSED]: 'blue',
    [PART_REQUISITION_STATUSES.USED]: 'success',
    [PART_REQUISITION_STATUSES.PARTIALLY_USED]: 'success',
    [PART_REQUISITION_STATUSES.NOT_AVAILABLE]: 'gray',
    [PART_REQUISITION_STATUSES.REJECTED]: 'error',
} as const
