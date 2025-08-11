// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import JobCardList from './pages/jobcards/JobCardList'
import { Layout } from './components/layout/Layout'
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'
import ClientList from "@/pages/clients/ClientList"
import VehicleList from '@/pages/vehicles/VehicleList'
import {
    EmployeeList,
} from '@/pages/employees/EmployeeList'
import AppointmentList from "@/pages/appointments/AppointmentList.tsx";
import {ProductList} from "@/pages/inventory/ProductList.tsx";
import {ApiDebugTrigger} from "@/components/debug/ApiDebugPanel.tsx";
import InvoiceList from "@/pages/invoices/InvoiceList.tsx";

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
                // Don't retry on 401 (unauthorized) errors
                if (error?.response?.status === 401) {
                    return false
                }
                return failureCount < 3
            },
        },
        mutations: {
            retry: (failureCount, error: any) => {
                // Don't retry on 4xx errors
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    return false
                }
                return failureCount < 2
            },
        },
    },
})

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
                                                                                              children,
                                                                                              allowedRoles
                                                                                          }) => {
    const { isAuthenticated, userRole, isLoading } = useAuth()

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Check role-based access if allowedRoles is specified
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        return (
            <Layout>
                <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-gray-500">
                        Your role: <span className="font-medium">{userRole}</span>
                    </p>
                </div>
            </Layout>
        )
    }

    return <Layout>{children}</Layout>
}

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <div className="App">
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AuthProvider>
                        <div className="h-screen bg-gray-50 overflow-hidden">
                            <Routes>
                                {/* Public Routes */}
                                <Route
                                    path="/login"
                                    element={
                                        <PublicRoute>
                                            <Login />
                                        </PublicRoute>
                                    }
                                />

                                {/* Protected Routes */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/jobcards"
                                    element={
                                        <ProtectedRoute>
                                            <JobCardList />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Role-based protected routes */}
                                <Route
                                    path="/clients"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN', 'Service Advisor']}>
                                            <ClientList/>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/vehicles"
                                    element={
                                        <ProtectedRoute>
                                            <VehicleList/>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/employees"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN', 'Manager']}>
                                            <EmployeeList/>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/appointments"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN', 'Manager', 'Service Advisor']}>
                                            <div className="p-6">
                                                <AppointmentList/>
                                            </div>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/invoices"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN', 'Service Advisor']}>
                                            <InvoiceList/>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/inventory"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN', 'Service Advisor']}>
                                            <ProductList/>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/reports"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN', 'Manager']}>
                                            <div className="p-6">
                                                <h1 className="text-2xl font-bold">Reports</h1>
                                                <p className="text-gray-600">Coming soon...</p>
                                            </div>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/settings"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN']}>
                                            <div className="p-6">
                                                <h1 className="text-2xl font-bold">Settings</h1>
                                                <p className="text-gray-600">Coming soon...</p>
                                            </div>
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Default redirect */}
                                <Route path="/" element={<Navigate to="/login" replace />} />

                                {/* 404 Route */}
                                <Route
                                    path="*"
                                    element={
                                        <ProtectedRoute>
                                            <div className="p-6 text-center">
                                                <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                                                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                                                <button
                                                    onClick={() => window.history.back()}
                                                    className="text-primary-600 hover:text-primary-500"
                                                >
                                                    Go back
                                                </button>
                                            </div>
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>

                            {/* Toast notifications */}
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#fff',
                                        color: '#374151',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                    },
                                    success: {
                                        style: {
                                            border: '1px solid #10b981',
                                        },
                                    },
                                    error: {
                                        style: {
                                            border: '1px solid #ef4444',
                                        },
                                    },
                                }}
                            />
                        </div>

                        {/* React Query DevTools (only in development) */}
                        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
                    </AuthProvider>
                </Router>
            </QueryClientProvider>
            <ApiDebugTrigger/>
        </div>
    )
}

export default App