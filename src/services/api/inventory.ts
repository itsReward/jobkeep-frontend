// src/services/api/inventory.ts - FIXED VERSION
import { ApiService } from './base'

// Enhanced types with better validation
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

export interface ProductCategory {
    categoryId: string
    categoryName: string
    description: string
    createdAt: string
}

export interface Supplier {
    supplierId: string
    supplierName: string
    companyName: string
    contactPerson: string
    email: string
    phone: string
    address: string
    paymentTerms: string
    taxNumber: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateProductRequest {
    productCode: string
    productName: string
    description: string
    categoryId: string
    brand: string
    unitOfMeasure: string
    currentStock: number
    minimumStock: number
    maximumStock: number
    costPrice: number
    sellingPrice: number
    markupPercentage: number
    supplierId: string
}

export interface CreateSupplierRequest {
    supplierName: string
    companyName: string
    contactPerson: string
    email: string
    phone: string
    address: string
    paymentTerms: string
    taxNumber: string
}

export interface StockAdjustment {
    productId: string
    adjustmentQuantity: number
    reason: string
    notes?: string
}

export interface BulkImportResult {
    success: boolean
    importedCount: number
    errorCount: number
    errors?: string[]
}

// Enhanced Product Service with better error handling
export class ProductService extends ApiService {
    constructor() {
        super('/products')
    }

    async getAll(): Promise<Product[]> {
        try {
            console.log('🚀 ProductService.getAll() - Making API call to /products/all')
            const result = await this.get<Product[]>('/all')

            // Validate response
            if (!Array.isArray(result)) {
                console.warn('⚠️ ProductService.getAll() - Response is not an array:', typeof result)
                return []
            }

            console.log('✅ ProductService.getAll() - Success:', result.length, 'products')
            return result
        } catch (error: any) {
            console.error('❌ ProductService.getAll() - Error:', {
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                message: error?.message,
                url: error?.config?.url,
                data: error?.response?.data
            })

            // For debugging - provide more context
            if (error?.response?.status === 404) {
                console.error('💡 Hint: Check if the backend server is running and the /products/all endpoint exists')
            } else if (error?.response?.status === 401) {
                console.error('💡 Hint: Authentication issue - token may be expired or invalid')
            } else if (error?.response?.status === 500) {
                console.error('💡 Hint: Server error - check backend logs for more details')
            }

            throw error
        }
    }

    async getById(id: string): Promise<Product> {
        try {
            console.log(`🚀 ProductService.getById(${id})`)
            const result = await this.get<Product>(`/${id}`)
            console.log('✅ ProductService.getById() - Success')
            return result
        } catch (error: any) {
            console.error('❌ ProductService.getById() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async getByIdFull(id: string): Promise<Product> {
        try {
            console.log(`🚀 ProductService.getByIdFull(${id})`)
            const result = await this.get<Product>(`/${id}/full`)
            console.log('✅ ProductService.getByIdFull() - Success')
            return result
        } catch (error: any) {
            console.error('❌ ProductService.getByIdFull() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async create(product: CreateProductRequest): Promise<Product> {
        try {
            console.log('🚀 ProductService.create()')
            const result = await this.post<Product>('/new', product)
            console.log('✅ ProductService.create() - Success')
            return result
        } catch (error: any) {
            console.error('❌ ProductService.create() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async update(id: string, product: Partial<CreateProductRequest>): Promise<Product> {
        try {
            console.log(`🚀 ProductService.update(${id})`)
            const result = await this.put<Product>(`/update/${id}`, product)
            console.log('✅ ProductService.update() - Success')
            return result
        } catch (error: any) {
            console.error('❌ ProductService.update() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async delete(id: string): Promise<void> {
        try {
            console.log(`🚀 ProductService.delete(${id})`)
            await this.delete<void>(`/delete/${id}`)
            console.log('✅ ProductService.delete() - Success')
        } catch (error: any) {
            console.error('❌ ProductService.delete() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async getLowStock(): Promise<Product[]> {
        try {
            console.log('🚀 ProductService.getLowStock()')
            const result = await this.get<Product[]>('/low-stock')
            console.log('✅ ProductService.getLowStock() - Success:', result?.length || 0, 'products')
            return result || []
        } catch (error: any) {
            console.error('❌ ProductService.getLowStock() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async adjustStock(adjustment: StockAdjustment): Promise<Product> {
        try {
            console.log('🚀 ProductService.adjustStock()')
            const result = await this.put<Product>(`/${adjustment.productId}/stock`, adjustment)
            console.log('✅ ProductService.adjustStock() - Success')
            return result
        } catch (error: any) {
            console.error('❌ ProductService.adjustStock() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }
}

// Enhanced Product Category Service
export class ProductCategoryService extends ApiService {
    constructor() {
        super('/product-categories')
    }

    async getAll(): Promise<ProductCategory[]> {
        try {
            console.log('🚀 ProductCategoryService.getAll() - Making API call to /product-categories/all')
            const result = await this.get<ProductCategory[]>('/all')

            // Validate response
            if (!Array.isArray(result)) {
                console.warn('⚠️ ProductCategoryService.getAll() - Response is not an array:', typeof result)
                return []
            }

            console.log('✅ ProductCategoryService.getAll() - Success:', result.length, 'categories')
            return result
        } catch (error: any) {
            console.error('❌ ProductCategoryService.getAll() - Error:', {
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                message: error?.message,
                url: error?.config?.url,
                data: error?.response?.data
            })

            // Provide helpful debugging hints
            if (error?.response?.status === 404) {
                console.error('💡 Hint: Check if the /product-categories/all endpoint exists on the backend')
            }

            throw error
        }
    }

    async getById(id: string): Promise<ProductCategory> {
        try {
            console.log(`🚀 ProductCategoryService.getById(${id})`)
            const result = await this.get<ProductCategory>(`/${id}`)
            console.log('✅ ProductCategoryService.getById() - Success')
            return result
        } catch (error: any) {
            console.error('❌ ProductCategoryService.getById() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async create(category: Omit<ProductCategory, 'categoryId' | 'createdAt'>): Promise<ProductCategory> {
        try {
            console.log('🚀 ProductCategoryService.create()')
            const result = await this.post<ProductCategory>('/new', category)
            console.log('✅ ProductCategoryService.create() - Success')
            return result
        } catch (error: any) {
            console.error('❌ ProductCategoryService.create() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async update(id: string, category: Partial<ProductCategory>): Promise<ProductCategory> {
        try {
            console.log(`🚀 ProductCategoryService.update(${id})`)
            const result = await this.put<ProductCategory>(`/update/${id}`, category)
            console.log('✅ ProductCategoryService.update() - Success')
            return result
        } catch (error: any) {
            console.error('❌ ProductCategoryService.update() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async delete(id: string): Promise<void> {
        try {
            console.log(`🚀 ProductCategoryService.delete(${id})`)
            await this.delete<void>(`/delete/${id}`)
            console.log('✅ ProductCategoryService.delete() - Success')
        } catch (error: any) {
            console.error('❌ ProductCategoryService.delete() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }
}

// Enhanced Supplier Service
export class SupplierService extends ApiService {
    constructor() {
        super('/suppliers')
    }

    async getAll(): Promise<Supplier[]> {
        try {
            console.log('🚀 SupplierService.getAll() - Making API call to /suppliers/all')
            const result = await this.get<Supplier[]>('/all')

            // Validate response
            if (!Array.isArray(result)) {
                console.warn('⚠️ SupplierService.getAll() - Response is not an array:', typeof result)
                return []
            }

            console.log('✅ SupplierService.getAll() - Success:', result.length, 'suppliers')
            return result
        } catch (error: any) {
            console.error('❌ SupplierService.getAll() - Error:', {
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                message: error?.message,
                url: error?.config?.url,
                data: error?.response?.data
            })

            // Provide helpful debugging hints
            if (error?.response?.status === 404) {
                console.error('💡 Hint: Check if the /suppliers/all endpoint exists on the backend')
            }

            throw error
        }
    }

    async getById(id: string): Promise<Supplier> {
        try {
            console.log(`🚀 SupplierService.getById(${id})`)
            const result = await this.get<Supplier>(`/${id}`)
            console.log('✅ SupplierService.getById() - Success')
            return result
        } catch (error: any) {
            console.error('❌ SupplierService.getById() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async create(supplier: CreateSupplierRequest): Promise<Supplier> {
        try {
            console.log('🚀 SupplierService.create()')
            const result = await this.post<Supplier>('/new', supplier)
            console.log('✅ SupplierService.create() - Success')
            return result
        } catch (error: any) {
            console.error('❌ SupplierService.create() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async update(id: string, supplier: Partial<CreateSupplierRequest>): Promise<Supplier> {
        try {
            console.log(`🚀 SupplierService.update(${id})`)
            const result = await this.put<Supplier>(`/update/${id}`, supplier)
            console.log('✅ SupplierService.update() - Success')
            return result
        } catch (error: any) {
            console.error('❌ SupplierService.update() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async delete(id: string): Promise<void> {
        try {
            console.log(`🚀 SupplierService.delete(${id})`)
            await this.delete<void>(`/delete/${id}`)
            console.log('✅ SupplierService.delete() - Success')
        } catch (error: any) {
            console.error('❌ SupplierService.delete() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }

    async search(searchTerm: string): Promise<Supplier[]> {
        try {
            console.log(`🚀 SupplierService.search(${searchTerm})`)
            const result = await this.get<Supplier[]>(`/search?searchTerm=${encodeURIComponent(searchTerm)}`)
            console.log('✅ SupplierService.search() - Success:', result?.length || 0, 'suppliers')
            return result || []
        } catch (error: any) {
            console.error('❌ SupplierService.search() - Error:', error?.response?.status, error?.message)
            throw error
        }
    }
}

// Export service instances
export const productService = new ProductService()
export const productCategoryService = new ProductCategoryService()
export const supplierService = new SupplierService()

// Enhanced debugging utilities
export const inventoryDebugUtils = {
    // Test all inventory endpoints individually
    async testAllEndpoints() {
        console.group('🔍 Testing All Inventory Endpoints')

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
        const token = localStorage.getItem('accessToken')

        if (!token) {
            console.error('❌ No auth token found in localStorage')
            console.groupEnd()
            return
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        // Test each endpoint
        const endpoints = [
            { path: '/products/all', name: 'Products' },
            { path: '/product-categories/all', name: 'Categories' },
            { path: '/suppliers/all', name: 'Suppliers' },
            { path: '/users/me', name: 'User Info (control)' }
        ]

        for (const endpoint of endpoints) {
            try {
                console.log(`\n🧪 Testing ${endpoint.name} (${endpoint.path})...`)
                const url = `${baseUrl}${endpoint.path}`
                console.log(`   Full URL: ${url}`)

                const response = await fetch(url, { headers })
                console.log(`   Status: ${response.status} ${response.statusText}`)

                if (response.ok) {
                    const data = await response.json()
                    const itemCount = Array.isArray(data) ? data.length : 'N/A'
                    console.log(`   ✅ SUCCESS: ${endpoint.name} - ${itemCount} items`)
                } else {
                    const errorText = await response.text()
                    console.error(`   ❌ FAILED: ${endpoint.name} - ${errorText}`)
                }
            } catch (error: any) {
                console.error(`   ❌ ERROR: ${endpoint.name} -`, error.message)
            }
        }

        console.groupEnd()
    },

    // Test React Query service calls directly
    async testServiceCalls() {
        console.group('🧪 Testing Service Calls Directly')

        try {
            console.log('Testing productService.getAll()...')
            const products = await productService.getAll()
            console.log('✅ Products:', products?.length || 0, 'items')
        } catch (error: any) {
            console.error('❌ Products failed:', error.message)
        }

        try {
            console.log('Testing productCategoryService.getAll()...')
            const categories = await productCategoryService.getAll()
            console.log('✅ Categories:', categories?.length || 0, 'items')
        } catch (error: any) {
            console.error('❌ Categories failed:', error.message)
        }

        try {
            console.log('Testing supplierService.getAll()...')
            const suppliers = await supplierService.getAll()
            console.log('✅ Suppliers:', suppliers?.length || 0, 'items')
        } catch (error: any) {
            console.error('❌ Suppliers failed:', error.message)
        }

        console.groupEnd()
    },

    // Check environment and configuration
    checkConfiguration() {
        console.group('⚙️ Configuration Check')

        console.log('Environment Variables:')
        console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
        console.log('  VITE_API_TIMEOUT:', import.meta.env.VITE_API_TIMEOUT)

        console.log('\nRuntime Configuration:')
        console.log('  API_BASE_URL:', baseUrl)
        console.log('  Has Auth Token:', !!localStorage.getItem('accessToken'))
        console.log('  Token Preview:', localStorage.getItem('accessToken')?.substring(0, 20) + '...')

        console.log('\nBrowser Info:')
        console.log('  User Agent:', navigator.userAgent)
        console.log('  URL:', window.location.href)

        console.groupEnd()
    },

    // Run full diagnostic
    async runFullDiagnostic() {
        console.log('🔧 Running Full Inventory Diagnostic...')

        this.checkConfiguration()
        await this.testAllEndpoints()
        await this.testServiceCalls()

        console.log('🏁 Diagnostic Complete')
    }
}

// Add to window for debugging
if (typeof window !== 'undefined') {
    window.inventoryDebug = inventoryDebugUtils
}

declare global {
    interface Window {
        inventoryDebug: typeof inventoryDebugUtils
    }
}