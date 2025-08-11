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
  INVOICES: '/invoices',
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

export const INVOICE_EXPORT_FORMATS = {
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
