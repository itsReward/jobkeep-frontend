export interface User {
  id: string
  username: string
  role: string
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
  id: string
  employeeName: string
  employeeSurname: string
  rating: number
  employeeRole: string
  employeeDepartment: string
  phoneNumber: string
  homeAddress: string
  jobCards: JobCard[]
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
