// src/services/api/inventory.ts
import { ApiService } from './base'
import {
    Product,
    CreateProductDto,
    ProductCategory,
    CreateProductCategoryDto,
    ProductCategoryWithProducts,
    Supplier,
    CreateSupplierDto,
    ProductVehicle,
    CreateProductVehicle,
    ProductVehicleWithProducts,
    StockAdjustment,
    InventoryMetrics,
    InventoryFilter,
    BulkImportResult
} from '@/types'

// Products Service
export class ProductService extends ApiService {
    constructor() {
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

    async create(product: CreateProductDto): Promise<Product> {
        return this.post<Product>('/new', product)
    }

    async update(id: string, product: CreateProductDto): Promise<Product> {
        return this.put<Product>(`/update/${id}`, product)
    }

    async delete(id: string): Promise<string> {
        return this.delete<string>(`/delete/${id}`)
    }

    async getLowStock(): Promise<Product[]> {
        return this.get<Product[]>('/low-stock')
    }

    async getByVehicleCompatibility(make: string, model?: string): Promise<Product[]> {
        const params = new URLSearchParams({ make })
        if (model) params.append('model', model)
        return this.get<Product[]>(`/vehicle-compatibility?${params}`)
    }

    async getByCategory(categoryId: string): Promise<Product[]> {
        return this.get<Product[]>(`/by-category/${categoryId}`)
    }

    async addCategory(productId: string, categoryId: string): Promise<void> {
        return this.post<void>(`/${productId}/categories/${categoryId}`)
    }

    async removeCategory(productId: string, categoryId: string): Promise<void> {
        return this.delete<void>(`/${productId}/categories/${categoryId}`)
    }

    async addVehicle(productId: string, vehicleId: string): Promise<void> {
        return this.post<void>(`/${productId}/vehicles/${vehicleId}`)
    }

    async removeVehicle(productId: string, vehicleId: string): Promise<void> {
        return this.delete<void>(`/${productId}/vehicles/${vehicleId}`)
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

// Product Categories Service
export class ProductCategoryService extends ApiService {
    constructor() {
        super('/product-categories')
    }

    async getAll(): Promise<ProductCategory[]> {
        return this.get<ProductCategory[]>('/all')
    }

    async getById(id: string): Promise<ProductCategory> {
        return this.get<ProductCategory>(`/${id}`)
    }

    async getAllWithProducts(): Promise<ProductCategoryWithProducts[]> {
        return this.get<ProductCategoryWithProducts[]>('/with-products')
    }

    async getByIdWithProducts(id: string): Promise<ProductCategoryWithProducts> {
        return this.get<ProductCategoryWithProducts>(`/${id}/with-products`)
    }

    async create(category: CreateProductCategoryDto): Promise<ProductCategory> {
        return this.post<ProductCategory>('/new', category)
    }

    async update(id: string, category: CreateProductCategoryDto): Promise<ProductCategory> {
        return this.put<ProductCategory>(`/update/${id}`, category)
    }

    async delete(id: string): Promise<string> {
        return this.delete<string>(`/delete/${id}`)
    }
}

// Suppliers Service
export class SupplierService extends ApiService {
    constructor() {
        super('/suppliers')
    }

    async getAll(): Promise<Supplier[]> {
        return this.get<Supplier[]>('/all')
    }

    async getById(id: string): Promise<Supplier> {
        return this.get<Supplier>(`/${id}`)
    }

    async create(supplier: CreateSupplierDto): Promise<Supplier> {
        return this.post<Supplier>('/new', supplier)
    }

    async update(id: string, supplier: CreateSupplierDto): Promise<Supplier> {
        return this.put<Supplier>(`/update/${id}`, supplier)
    }

    async delete(id: string): Promise<string> {
        return this.delete<string>(`/delete/${id}`)
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

// Product Vehicles Service
export class ProductVehicleService extends ApiService {
    constructor() {
        super('/products/vehicles')
    }

    async getAll(): Promise<ProductVehicle[]> {
        return this.get<ProductVehicle[]>('')
    }

    async getByIdWithProducts(id: string): Promise<ProductVehicleWithProducts> {
        return this.get<ProductVehicleWithProducts>(`/${id}/with-products`)
    }

    async getAllWithProducts(): Promise<ProductVehicleWithProducts[]> {
        return this.get<ProductVehicleWithProducts[]>('/with-products')
    }

    async create(vehicle: CreateProductVehicle): Promise<ProductVehicle> {
        return this.post<ProductVehicle>('/new-vehicle', vehicle)
    }

    async update(id: string, vehicle: ProductVehicle): Promise<ProductVehicle> {
        return this.put<ProductVehicle>(`/update/${id}`, vehicle)
    }

    async delete(id: string): Promise<void> {
        return this.delete<void>(`/${id}`)
    }
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
export const productVehicleService = new ProductVehicleService()
export const inventoryMetricsService = new InventoryMetricsService()