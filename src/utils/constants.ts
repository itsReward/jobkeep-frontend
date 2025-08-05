export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
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
