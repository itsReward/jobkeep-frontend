#!/bin/bash

# JobKeep Components Generation Script
# This script creates all the React components for the JobKeep application

echo "🔧 Generating JobKeep Components..."
echo "=================================="

# Create TypeScript type definitions
echo "📝 Creating TypeScript types..."

cat > src/types/index.ts << 'EOF'
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

export interface Timesheet {
  id: string
  employeeId: string
  jobCardId: string
  startTime: string
  endTime: string
  description: string
  hoursWorked: number
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
EOF

# Create API service files
echo "🌐 Creating API services..."

cat > src/services/api/base.ts << 'EOF'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export class ApiService {
  protected basePath: string

  constructor(basePath: string) {
    this.basePath = basePath
  }

  protected async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get(`${this.basePath}${endpoint}`, config)
    return response.data
  }

  protected async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post(`${this.basePath}${endpoint}`, data, config)
    return response.data
  }

  protected async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put(`${this.basePath}${endpoint}`, data, config)
    return response.data
  }

  protected async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete(`${this.basePath}${endpoint}`, config)
    return response.data
  }
}
EOF

cat > src/services/api/auth.ts << 'EOF'
import { ApiService } from './base'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export class AuthService extends ApiService {
  constructor() {
    super('')
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth', credentials)
  }

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken')
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  }
}

export const authService = new AuthService()
EOF

cat > src/services/api/clients.ts << 'EOF'
import { ApiService } from './base'
import { Client } from '@/types'

export interface CreateClientRequest {
  clientName: string
  clientSurname: string
  gender: string
  jobTitle: string
  company: string
  phone: string
  email: string
  address: string
}

export class ClientService extends ApiService {
  constructor() {
    super('/clients')
  }

  async getAll(): Promise<Client[]> {
    return this.get<Client[]>('/all')
  }

  async getById(id: string): Promise<Client> {
    return this.get<Client>(`/get/${id}`)
  }

  async create(client: CreateClientRequest): Promise<Client> {
    return this.post<Client>('/new', client)
  }

  async update(id: string, client: Partial<CreateClientRequest>): Promise<Client> {
    return this.put<Client>(`/update/${id}`, client)
  }

  async delete(id: string): Promise<string> {
    return this.delete<string>(`/delete/${id}`)
  }
}

export const clientService = new ClientService()
EOF

# Create UI components
echo "🎨 Creating UI components..."

# Button component
cat > src/components/ui/Button.tsx << 'EOF'
import React from 'react'
import { cn } from '@/utils/cn'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      className={cn(
        'btn',
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
          'btn-outline': variant === 'outline',
          'btn-ghost': variant === 'ghost',
          'bg-error-500 text-white hover:bg-error-600': variant === 'danger',
          'btn-sm': size === 'sm',
          'btn-md': size === 'md',
          'btn-lg': size === 'lg',
        },
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && <Icon className="mr-2 h-4 w-4" />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="ml-2 h-4 w-4" />}
    </button>
  )
}
EOF

# Input component
cat > src/components/ui/Input.tsx << 'EOF'
import React from 'react'
import { cn } from '@/utils/cn'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        )}
        <input
          id={inputId}
          className={cn(
            'input',
            {
              'pl-10': Icon && iconPosition === 'left',
              'pr-10': Icon && iconPosition === 'right',
              'border-error-500 focus:border-error-500 focus:ring-error-500': error,
            },
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
EOF

# Card component
cat > src/components/ui/Card.tsx << 'EOF'
import React from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200', className)} {...props}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200', className)} {...props}>
      {children}
    </div>
  )
}
EOF

# Badge component
cat > src/components/ui/Badge.tsx << 'EOF'
import React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray'
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'badge',
        {
          'badge-primary': variant === 'primary',
          'badge-secondary': variant === 'secondary',
          'badge-success': variant === 'success',
          'badge-warning': variant === 'warning',
          'badge-error': variant === 'error',
          'bg-gray-100 text-gray-800': variant === 'gray',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
EOF

# Table component
cat > src/components/ui/Table.tsx << 'EOF'
import React from 'react'
import { cn } from '@/utils/cn'

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export const Table: React.FC<TableProps> = ({ className, children, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn('table', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export const TableHeader: React.FC<TableHeaderProps> = ({ className, children, ...props }) => {
  return (
    <thead className={cn('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  )
}

export const TableBody: React.FC<TableBodyProps> = ({ className, children, ...props }) => {
  return (
    <tbody className={cn('bg-white', className)} {...props}>
      {children}
    </tbody>
  )
}

export const TableRow: React.FC<TableRowProps> = ({ className, children, ...props }) => {
  return (
    <tr className={cn('hover:bg-gray-50', className)} {...props}>
      {children}
    </tr>
  )
}

export const TableHead: React.FC<TableHeadProps> = ({ className, children, ...props }) => {
  return (
    <th className={cn('table th', className)} {...props}>
      {children}
    </th>
  )
}

export const TableCell: React.FC<TableCellProps> = ({ className, children, ...props }) => {
  return (
    <td className={cn('table td', className)} {...props}>
      {children}
    </td>
  )
}
EOF

# Loading component
cat > src/components/ui/Loading.tsx << 'EOF'
import React from 'react'
import { cn } from '@/utils/cn'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  className,
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <svg
        className={cn('animate-spin text-primary-500', sizeClasses[size])}
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}
EOF

# Create layout components
echo "📱 Creating layout components..."

cat > src/components/layout/Sidebar.tsx << 'EOF'
import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Car,
  UserCheck,
  ClipboardList,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Wrench
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/constants'

const menuItems = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'Clients',
    href: ROUTES.CLIENTS,
    icon: Users,
  },
  {
    title: 'Vehicles',
    href: ROUTES.VEHICLES,
    icon: Car,
  },
  {
    title: 'Employees',
    href: ROUTES.EMPLOYEES,
    icon: UserCheck,
  },
  {
    title: 'Job Cards',
    href: ROUTES.JOBCARDS,
    icon: ClipboardList,
  },
  {
    title: 'Appointments',
    href: ROUTES.APPOINTMENTS,
    icon: Calendar,
  },
  {
    title: 'Invoices',
    href: ROUTES.INVOICES,
    icon: FileText,
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS,
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]

export const Sidebar: React.FC = () => {
  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">JobKeep</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'sidebar-link',
                isActive && 'active'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
EOF

cat > src/components/layout/Header.tsx << 'EOF'
import React from 'react'
import { Bell, Search, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/api/auth'
import { useNavigate } from 'react-router-dom'

export const Header: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <Input
          placeholder="Search clients, vehicles, job cards..."
          icon={Search}
          className="w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
EOF

cat > src/components/layout/Layout.tsx << 'EOF'
import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
EOF

# Create auth pages
echo "🔐 Creating authentication pages..."

cat > src/pages/auth/Login.tsx << 'EOF'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Wrench, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { authService } from '@/services/api/auth'
import toast from 'react-hot-toast'

interface LoginForm {
  username: string
  password: string
}

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authService.login(data)
      localStorage.setItem('accessToken', response.accessToken)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 mb-4">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JobKeep</h1>
          <p className="text-gray-600">Vehicle Garage Management System</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Sign In</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Username"
                {...register('username', { required: 'Username is required' })}
                error={errors.username?.message}
                autoComplete="username"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  error={errors.password?.message}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          © 2024 JobKeep. All rights reserved.
        </p>
      </div>
    </div>
  )
}
EOF

# Create dashboard page
echo "📊 Creating dashboard page..."

cat > src/pages/dashboard/Dashboard.tsx << 'EOF'
import React from 'react'
import {
  Users,
  Car,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const stats = [
  {
    title: 'Total Clients',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'text-primary-500',
    bgColor: 'bg-primary-100',
  },
  {
    title: 'Active Job Cards',
    value: '45',
    change: '+8%',
    icon: ClipboardList,
    color: 'text-secondary-500',
    bgColor: 'bg-secondary-100',
  },
  {
    title: 'Vehicles Serviced',
    value: '892',
    change: '+15%',
    icon: Car,
    color: 'text-success-500',
    bgColor: 'bg-success-100',
  },
  {
    title: 'Monthly Revenue',
    value: '$24,500',
    change: '+22%',
    icon: DollarSign,
    color: 'text-warning-500',
    bgColor: 'bg-warning-100',
  },
]

const recentJobCards = [
  {
    id: 'JC-001',
    client: 'John Doe',
    vehicle: '2020 Toyota Camry',
    status: 'in_progress',
    priority: true,
    dueDate: '2024-03-15',
  },
  {
    id: 'JC-002',
    client: 'Jane Smith',
    vehicle: '2019 Honda Civic',
    status: 'completed',
    priority: false,
    dueDate: '2024-03-14',
  },
  {
    id: 'JC-003',
    client: 'Mike Johnson',
    vehicle: '2021 Ford F-150',
    status: 'frozen',
    priority: true,
    dueDate: '2024-03-16',
  },
]

const upcomingAppointments = [
  {
    id: '1',
    client: 'Sarah Wilson',
    vehicle: '2022 BMW X3',
    time: '09:00 AM',
    service: 'Oil Change',
  },
  {
    id: '2',
    client: 'David Brown',
    vehicle: '2020 Audi A4',
    time: '11:00 AM',
    service: 'Brake Service',
  },
  {
    id: '3',
    client: 'Lisa Davis',
    vehicle: '2021 Mercedes C-Class',
    time: '02:00 PM',
    service: 'Annual Service',
  },
]

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening in your garage.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Cards */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Job Cards</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobCards.map((jobCard) => (
                <div key={jobCard.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{jobCard.id}</span>
                      {jobCard.priority && (
                        <AlertTriangle className="h-4 w-4 text-warning-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{jobCard.client}</p>
                    <p className="text-sm text-gray-500">{jobCard.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        jobCard.status === 'completed'
                          ? 'success'
                          : jobCard.status === 'in_progress'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {jobCard.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">Due: {jobCard.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Today's Appointments</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-100">
                      <Calendar className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-gray-600">{appointment.vehicle}</p>
                      <p className="text-sm text-gray-500">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary-600">{appointment.time}</p>
                    <CheckCircle className="h-4 w-4 text-success-500 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
EOF

echo