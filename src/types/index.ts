// User interface for authentication and role management
export interface User {
  id: string
  username: string
  email: string
  userRole: 'ADMIN' | 'Manager' | 'Service Advisor' | 'Technician' | 'Stores'
  employeeId: string
  employeeName: string
  employeeSurname: string
}

// Role-based access control types
export type UserRole = 'ADMIN' | 'Manager' | 'Service Advisor' | 'Technician' | 'Stores'

export interface RolePermissions {
  canAccessClients: boolean
  canAccessEmployees: boolean
  canAccessFinancials: boolean
  canAccessReports: boolean
  canAccessSettings: boolean
  canManageUsers: boolean
  canManageInventory: boolean
  canViewAllJobCards: boolean
  canApproveRequisitions: boolean
}

// Role permissions mapping
export const rolePermissions: Record<UserRole, RolePermissions> = {
  ADMIN: {
    canAccessClients: true,
    canAccessEmployees: true,
    canAccessFinancials: true,
    canAccessReports: true,
    canAccessSettings: true,
    canManageUsers: true,
    canManageInventory: true,
    canViewAllJobCards: true,
    canApproveRequisitions: true,
  },
  Manager: {
    canAccessClients: false,
    canAccessEmployees: true, // Read only
    canAccessFinancials: false,
    canAccessReports: true,
    canAccessSettings: false,
    canManageUsers: false,
    canManageInventory: true,
    canViewAllJobCards: true,
    canApproveRequisitions: true,
  },
  'Service Advisor': {
    canAccessClients: true,
    canAccessEmployees: false,
    canAccessFinancials: true, // Own job cards only
    canAccessReports: false,
    canAccessSettings: false,
    canManageUsers: false,
    canManageInventory: false,
    canViewAllJobCards: false, // Own job cards only
    canApproveRequisitions: false,
  },
  Technician: {
    canAccessClients: false,
    canAccessEmployees: false,
    canAccessFinancials: false,
    canAccessReports: false,
    canAccessSettings: false,
    canManageUsers: false,
    canManageInventory: false,
    canViewAllJobCards: false, // Assigned job cards only
    canApproveRequisitions: false,
  },
  Stores: {
    canAccessClients: false,
    canAccessEmployees: false,
    canAccessFinancials: false,
    canAccessReports: false,
    canAccessSettings: false,
    canManageUsers: false,
    canManageInventory: true,
    canViewAllJobCards: false,
    canApproveRequisitions: true,
  },
}

// Helper function to get permissions for a role
export const getPermissions = (role: UserRole): RolePermissions => {
  return rolePermissions[role]
}

// Helper function to check if user has specific permission
export const hasPermission = (role: UserRole, permission: keyof RolePermissions): boolean => {
  return rolePermissions[role][permission]
}

export interface Client {
  id: string
  clientName: string
  clientSurname: string
  gender: string
  jobTitle: string
  company: string
  phone: string
  email: string
  address: string
  vehicles: Vehicle[]
}

export interface Vehicle {
  id: string
  model: string
  make: string
  year?: number
  registrationNumber?: string
  vinNumber?: string
  clientId: string
  client?: Client
}

export interface Employee {
  employeeId: string
  employeeName: string
  employeeSurname: string
  email: string
  phoneNumber: string
  employeeRole: string
  rating?: number
  employeeDepartment?: string
  homeAddress?: string
  jobCards?: JobCard[]
}

export interface JobCard {
  id: string
  jobCardName: string
  jobCardNumber: number
  vehicleId: string
  vehicleName: string
  clientId: string
  clientName: string
  serviceAdvisorId: string
  serviceAdvisorName: string
  supervisorId: string
  supervisorName: string
  dateAndTimeIn: string
  estimatedTimeOfCompletion: string
  dateAndTimeFrozen?: string
  dateAndTimeClosed?: string
  priority: boolean
  jobCardDeadline: string
  timesheets: Timesheet[]
  stateChecklistId?: string
  serviceChecklistId?: string
  controlChecklistId?: string
}

export interface JobCardTechnician {
  employeeId: string
  employeeName: string
  employeeSurname: string
}

export interface Comment {
  commentId: string
  jobCardId: string
  jobCardName: string
  employeeId: string
  employeeName: string
  comment: string
  commentDate: string
}

export interface Timesheet {
  id: string
  sheetTitle: string
  report: string
  clockInDateAndTime: string
  clockOutDateAndTime: string
  jobCardId: string
  jobCardName: string
  technicianId: string
  technicianName: string
  hoursWorked?: number // Calculated field
}


export interface Appointment {
  id: string
  clientId: string
  vehicleId: string
  appointmentDate: string
  appointmentTime: string
  durationMinutes: number
  serviceType: string
  status: string
  notes?: string
  reminderSent: boolean
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  jobCardId?: string
  clientId: string
  invoiceDate: string
  dueDate?: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  status: string
  notes?: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  itemType: string
}

export type ApiResponse<T> = {
  data: T
  message?: string
  success: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}


// src/types/inventory.ts
export interface Product {
  productId: string
  productCode: string
  productName: string
  description: string
  categoryId: string
  categoryName: string
  brand: string
  unitOfMeasure: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  costPrice: number
  sellingPrice: number
  markupPercentage: number
  supplierId: string
  supplierName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductDto {
  productCode: string
  productName: string
  description?: string
  unitPrice: number
  costPrice?: number
  stockLevel?: number
  minStockLevel?: number
  supplierId?: string
  isActive?: boolean
}

export interface ProductCategory {
  categoryId: string
  categoryName: string
  description: string
  createdAt: string
}


export interface CreateProductCategoryDto {
  categoryName: string
  description?: string
  isActive?: boolean
}

export interface ProductCategoryWithProducts {
  categoryId: string
  categoryName: string
  description?: string
  isActive: boolean
  products: Product[]
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  supplierId: string
  supplierName: string
  companyName?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  paymentTerms?: string
  taxNumber?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierDto {
  supplierName: string
  companyName?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  paymentTerms?: string
  taxNumber?: string
}

export interface ProductVehicle {
  vehicleId: string
  vehicleMake: string
  vehicleModel: string
  yearRange?: string
  engineType?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductVehicle {
  vehicleMake: string
  vehicleModel: string
  yearRange?: string
  engineType?: string
  isActive?: boolean
}

export interface ProductVehicleWithProducts {
  vehicleId: string
  vehicleMake: string
  vehicleModel: string
  yearRange?: string
  engineType?: string
  isActive: boolean
  products: Product[]
  createdAt: string
  updatedAt: string
}

export interface StockAdjustment {
  productId: string
  adjustmentType: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string
  notes?: string
  adjustedBy: string
  adjustmentDate: string
}

export interface InventoryMetrics {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalCategories: number
  totalSuppliers: number
  totalInventoryValue: number
  recentAdjustments: number
}

export interface InventoryFilter {
  searchTerm?: string
  categoryId?: string
  vehicleId?: string
  supplierId?: string
  stockLevel?: 'low' | 'out' | 'normal' | 'all'
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
}

export interface BulkImportResult {
  totalProcessed: number
  successCount: number
  errorCount: number
  errors: string[]
}


// src/types/invoice.ts

export interface Invoice {
  invoiceId: string
  invoiceNumber: string
  clientId: string
  clientName: string
  vehicleId: string
  vehicleInfo?: string
  jobCardId?: string
  quotationId?: string
  invoiceDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  taxRate: number
  discountAmount: number
  discountPercentage: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  status: InvoiceStatus
  paymentTerms: string
  notes?: string
  createdAt: string
  updatedAt: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  itemId: string
  invoiceId: string
  productId?: string
  productCode?: string
  productName?: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  itemType: InvoiceItemType
}

export interface CreateInvoiceDto {
  clientId: string
  vehicleId: string
  jobCardId?: string
  quotationId?: string
  invoiceDate: string
  dueDate: string
  taxRate?: number
  discountPercentage?: number
  paymentTerms?: string
  notes?: string
  items: CreateInvoiceItemDto[]
}

export interface CreateInvoiceItemDto {
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  itemType: InvoiceItemType
}

export interface UpdateInvoiceDto {
  clientId?: string
  vehicleId?: string
  invoiceDate?: string
  dueDate?: string
  taxRate?: number
  discountPercentage?: number
  paymentTerms?: string
  notes?: string
  items?: CreateInvoiceItemDto[]
}

export interface UpdateInvoiceStatusDto {
  status: InvoiceStatus
  notes?: string
}

export interface InvoiceListFilters {
  status?: InvoiceStatus
  clientId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface InvoiceSummary {
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
  draftCount: number
  sentCount: number
  paidCount: number
  overdueCount: number
  cancelledCount: number
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum InvoiceItemType {
  LABOR = 'LABOR',
  PART = 'PART',
  CONSUMABLE = 'CONSUMABLE'
}

export const INVOICE_STATUS_LABELS = {
  [InvoiceStatus.DRAFT]: 'Draft',
  [InvoiceStatus.SENT]: 'Sent',
  [InvoiceStatus.PAID]: 'Paid',
  [InvoiceStatus.OVERDUE]: 'Overdue',
  [InvoiceStatus.CANCELLED]: 'Cancelled'
} as const

export const INVOICE_STATUS_COLORS = {
  [InvoiceStatus.DRAFT]: 'secondary',
  [InvoiceStatus.SENT]: 'warning',
  [InvoiceStatus.PAID]: 'success',
  [InvoiceStatus.OVERDUE]: 'error',
  [InvoiceStatus.CANCELLED]: 'gray'
} as const

export const INVOICE_ITEM_TYPE_LABELS = {
  [InvoiceItemType.LABOR]: 'Labor',
  [InvoiceItemType.PART]: 'Part',
  [InvoiceItemType.CONSUMABLE]: 'Consumable'
} as const

// Payment types for invoice payments
export interface InvoicePayment {
  paymentId: string
  invoiceId: string
  amount: number
  paymentMethod: string
  paymentDate: string
  status: string
  notes?: string
  createdAt: string
}

export interface CreateInvoicePaymentDto {
  invoiceId: string
  amount: number
  paymentMethod: string
  paymentDate: string
  notes?: string
}

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOBILE_MONEY: 'MOBILE_MONEY',
  CHEQUE: 'CHEQUE'
} as const

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.CARD]: 'Card',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.MOBILE_MONEY]: 'Mobile Money',
  [PAYMENT_METHODS.CHEQUE]: 'Cheque'
} as const

// Product search for invoice items
export interface ProductSearchResult {
  productId: string
  productCode: string
  productName: string
  description: string
  sellingPrice: number
  currentStock: number
  unitOfMeasure: string
}

// Utility types for invoice calculations
export interface InvoiceCalculations {
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
}

// Invoice PDF generation
export interface InvoicePdfOptions {
  includePayments?: boolean
  includeTaxBreakdown?: boolean
  includeTerms?: boolean
}
