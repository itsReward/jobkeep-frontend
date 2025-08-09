export interface User {
  id: string
  username: string
  role: string
}

export interface UserWithEmployee {
  id: string
  username: string
  email: string
  userRole: string
  employeeId: string
  employeeName: string
  employeeSurname: string
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
  description?: string
  unitPrice: number
  costPrice?: number
  stockLevel: number
  minStockLevel: number
  supplierName?: string
  supplierId?: string
  isActive: boolean
  categories: string[]
  compatibleVehicles: string[]
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
  description?: string
  isActive: boolean
  productCount: number
  createdAt: string
  updatedAt: string
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
