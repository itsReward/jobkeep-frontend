// src/services/api/inventory.ts - FINAL CORRECTED VERSION
import { ApiService } from './base'

// Product types based on your actual API response
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

export interface ProductVehicleReference {
    productId: string
    vehicleId: string
}

export interface Vehicle {
    id: string
    model: string
    regNumber: string
    make: string
    color: string
    chassisNumber: string
    clientId: string
    clientName: string
    clientSurname: string
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

// Products Service - Using CORRECT endpoints from your documentation
export class ProductService extends ApiService {
    constructor() {
        // Based on your API documentation: /products/* )
        super('/products')
    }

    async getAll(): Promise<Product[]> {
        return this.get<Product[]>('/all')
    }

    async getById(id: string): Promise<Product> {
        return this.get<Product>(`/${id}`)
    }

    async getByIdFull(id: string): Promise<Product> {
        return this.get<Product>(`/${id}/full`)
    }

    async create(product: CreateProductRequest): Promise<Product> {
        return this.post<Product>('/new', product)
    }

    async update(id: string, product: Partial<CreateProductRequest>): Promise<Product> {
        return this.put<Product>(`/update/${id}`, product)
    }

    async delete(id: string): Promise<void> {
        return this.delete<void>(`/delete/${id}`)
    }

    async getLowStock(): Promise<Product[]> {
        return this.get<Product[]>('/low-stock')
    }

    // Vehicle compatibility using CORRECT endpoint from your documentation
    async getByVehicleCompatibility(make: string, model?: string): Promise<Product[]> {
        const params = new URLSearchParams({ make })
        if (model) params.append('model', model)
        return this.get<Product[]>(`/vehicle-compatibility?${params}`)
    }

    async searchProducts(searchTerm: string): Promise<Product[]> {
        const products = await this.getAll()
        const term = searchTerm.toLowerCase()

        return products.filter(product =>
            product.productName.toLowerCase().includes(term) ||
            product.productCode.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.brand.toLowerCase().includes(term) ||
            product.categoryName.toLowerCase().includes(term)
        )
    }

    async getByCategory(categoryId: string): Promise<Product[]> {
        const products = await this.getAll()
        return products.filter(product => product.categoryId === categoryId)
    }

    async adjustStock(adjustment: StockAdjustment): Promise<Product> {
        return this.post<Product>('/adjust-stock', adjustment)
    }

    async bulkImport(file: File): Promise<BulkImportResult> {
        const formData = new FormData()
        formData.append('file', file)
        return this.post<BulkImportResult>('/bulk-import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    async exportProducts(): Promise<Blob> {
        const response = await this.get<Blob>('/export', { responseType: 'blob' })
        return response
    }
}

// Product Categories Service - Using CORRECT endpoint from your documentation
export class ProductCategoryService extends ApiService {
    constructor() {
        // Based on your API documentation: /product-categories/* ( prefix)
        super('/product-categories')
    }

    async getAll(): Promise<ProductCategory[]> {
        return this.get<ProductCategory[]>('/all')
    }

    async getById(id: string): Promise<ProductCategory> {
        return this.get<ProductCategory>(`/${id}`)
    }

    async create(category: Omit<ProductCategory, 'categoryId' | 'createdAt'>): Promise<ProductCategory> {
        return this.post<ProductCategory>('/new', category)
    }

    async update(id: string, category: Partial<ProductCategory>): Promise<ProductCategory> {
        return this.put<ProductCategory>(`/update/${id}`, category)
    }

    async delete(id: string): Promise<void> {
        return this.delete<void>(`/delete/${id}`)
    }
}

// Product Vehicle Reference Service - Using CORRECT endpoints from your documentation
export class ProductVehicleReferenceService extends ApiService {
    constructor() {
        // Based on your API documentation: /product-vehicle-reference/* (NO /api prefix)
        super('/product-vehicle-reference')
    }

    // Get vehicles compatible with a specific product
    async getVehiclesForProduct(productId: string): Promise<ProductVehicleReference[]> {
        return this.get<ProductVehicleReference[]>(`/product/${productId}/vehicles`)
    }

    // Get vehicles for multiple products (bulk query)
    async getVehiclesForProducts(productIds: string[]): Promise<ProductVehicleReference[]> {
        return this.post<ProductVehicleReference[]>('/products/vehicles', productIds)
    }

    // Get products compatible with a specific vehicle
    async getProductsForVehicle(vehicleId: string): Promise<ProductVehicleReference[]> {
        return this.get<ProductVehicleReference[]>(`/vehicle/${vehicleId}/products`)
    }

    // Get products for multiple vehicles (bulk query)
    async getProductsForVehicles(vehicleIds: string[]): Promise<ProductVehicleReference[]> {
        return this.post<ProductVehicleReference[]>('/vehicles/products', vehicleIds)
    }
}

// Vehicles Service - Using CORRECT endpoint from your documentation
export class VehicleService extends ApiService {
    constructor() {
        // Based on your API documentation: /vehicles/* (NO /api prefix)
        super('/vehicles')
    }

    async getAll(): Promise<Vehicle[]> {
        return this.get<Vehicle[]>('/all')
    }

    async getById(id: string): Promise<Vehicle> {
        return this.get<Vehicle>(`/get/${id}`)
    }

    async create(vehicle: Omit<Vehicle, 'id' | 'clientName' | 'clientSurname'>): Promise<Vehicle> {
        return this.post<Vehicle>('/new', vehicle)
    }

    async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
        return this.put<Vehicle>(`/update/${id}`, vehicle)
    }

    async delete(id: string): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`/delete/${id}`)
    }

    // Utility methods for filtering
    async getVehiclesByMake(make: string): Promise<Vehicle[]> {
        const vehicles = await this.getAll()
        return vehicles.filter(vehicle => vehicle.make.toLowerCase() === make.toLowerCase())
    }

    async getVehiclesByClient(clientId: string): Promise<Vehicle[]> {
        const vehicles = await this.getAll()
        return vehicles.filter(vehicle => vehicle.clientId === clientId)
    }
}

// Supplier types and service
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

// Suppliers Service - Using CORRECT endpoint from your documentation
export class SupplierService extends ApiService {
    constructor() {
        // Based on your API documentation: /suppliers/* (HAS  prefix)
        super('/suppliers')
    }

    async getAll(): Promise<Supplier[]> {
        return this.get<Supplier[]>('/all')
    }

    async getById(id: string): Promise<Supplier> {
        return this.get<Supplier>(`/${id}`)
    }

    async create(supplier: CreateSupplierRequest): Promise<Supplier> {
        return this.post<Supplier>('/new', supplier)
    }

    async update(id: string, supplier: Partial<CreateSupplierRequest>): Promise<Supplier> {
        return this.put<Supplier>(`/update/${id}`, supplier)
    }

    async delete(id: string): Promise<void> {
        return this.delete<void>(`/delete/${id}`)
    }

    async search(searchTerm: string): Promise<Supplier[]> {
        return this.get<Supplier[]>(`/search?searchTerm=${encodeURIComponent(searchTerm)}`)
    }

    async bulkImport(file: File): Promise<BulkImportResult> {
        const formData = new FormData()
        formData.append('file', file)
        return this.post<BulkImportResult>('/bulk-import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    async exportSuppliers(): Promise<Blob> {
        const response = await this.get<Blob>('/export', { responseType: 'blob' })
        return response
    }
}

// Inventory Metrics types and service
export interface InventoryMetrics {
    totalProducts: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    totalCategories: number
    averageStockLevel: number
}

// Inventory Metrics Service
export class InventoryMetricsService extends ApiService {
    constructor() {
        super('/inventory')
    }

    async getMetrics(): Promise<InventoryMetrics> {
        return this.get<InventoryMetrics>('/metrics')
    }

    async getStockAdjustments(productId?: string): Promise<StockAdjustment[]> {
        const endpoint = productId ? `/adjustments/${productId}` : '/adjustments'
        return this.get<StockAdjustment[]>(endpoint)
    }
}

// Export service instances
export const productService = new ProductService()
export const productCategoryService = new ProductCategoryService()
export const supplierService = new SupplierService()
export const productVehicleReferenceService = new ProductVehicleReferenceService()
export const vehicleService = new VehicleService()
export const inventoryMetricsService = new InventoryMetricsService()

// Enhanced debugging utilities
export const correctedProductDebugUtils = {
    // Test endpoints one by one to identify the problem
    async testIndividualEndpoints() {
        console.group('🎯 Testing Individual Endpoints')

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
        const token = localStorage.getItem('accessToken')

        if (!token) {
            console.error('❌ No auth token found')
            console.groupEnd()
            return
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        // Test each endpoint individually
        const endpoints = [
            '/products/all',
            '/vehicles/all',
            '/product-categories/all',
            '/suppliers/all',
            '/products/vehicle-compatibility?make=Toyota',
            '/product-vehicle-reference/products/vehicles'
        ]

        for (const endpoint of endpoints) {
            try {
                console.log(`Testing ${endpoint}...`)
                const url = `${baseUrl}${endpoint}`
                console.log(`Full URL: ${url}`)

                const response = await fetch(url, { headers })

                if (response.ok) {
                    const data = await response.json()
                    console.log(`✅ ${endpoint} SUCCESS:`, Array.isArray(data) ? `${data.length} items` : 'Data received')
                } else {
                    const errorText = await response.text()
                    console.error(`❌ ${endpoint} FAILED: ${response.status} - ${errorText}`)
                }
            } catch (error) {
                console.error(`❌ ${endpoint} ERROR:`, error)
            }
        }

        console.groupEnd()
    },

    // Check for 500 errors specifically
    async investigate500Errors() {
        console.group('🔍 Investigating 500 Errors')

        console.log('Base URL:', import.meta.env.VITE_API_BASE_URL)
        console.log('Auth token present:', !!localStorage.getItem('accessToken'))

        // Test a working endpoint first
        try {
            console.log('Testing known working endpoint /users/me...')
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                console.log('✅ /users/me works - API is reachable and auth is valid')
            } else {
                console.error('❌ /users/me failed:', response.status)
            }
        } catch (error) {
            console.error('❌ /users/me error:', error)
        }

        // Now test the problematic endpoints
        const problematicEndpoints = [
            '/products/all',
            '/products/vehicle-compatibility?make=Toyota'
        ]

        for (const endpoint of problematicEndpoints) {
            try {
                console.log(`\nTesting problematic endpoint ${endpoint}...`)
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                })

                console.log(`Response status: ${response.status}`)
                console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

                const responseText = await response.text()
                console.log(`Response body:`, responseText)

            } catch (error) {
                console.error(`Error testing ${endpoint}:`, error)
            }
        }

        console.groupEnd()
    }
}

// Add to window for debugging
if (typeof window !== 'undefined') {
    window.correctedProductDebug = correctedProductDebugUtils
}

declare global {
    interface Window {
        correctedProductDebug: typeof correctedProductDebugUtils
    }
}
