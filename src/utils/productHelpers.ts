// src/utils/productHelpers.ts - Helper functions for product operations
import { Product, ProductCategory } from '@/types'

/**
 * Determine stock status based on current, minimum, and maximum stock levels
 */
export function getStockStatus(product: Product): 'out-of-stock' | 'low-stock' | 'in-stock' | 'overstocked' {
    if (!product) {
        return 'out-of-stock'
    }

    const { currentStock, minimumStock, maximumStock } = product

    // Handle null/undefined values
    const current = currentStock ?? 0
    const minimum = minimumStock ?? 0
    const maximum = maximumStock ?? 1000

    if (current <= 0) {
        return 'out-of-stock'
    }

    if (current <= minimum) {
        return 'low-stock'
    }

    if (maximum > 0 && current > maximum) {
        return 'overstocked'
    }

    return 'in-stock'
}

/**
 * Get stock status display information
 */
export function getStockStatusInfo(product: Product) {
    const status = getStockStatus(product)

    const statusMap = {
        'out-of-stock': {
            label: 'Out of Stock',
            color: 'destructive' as const,
            icon: '❌',
            description: 'This product is currently out of stock'
        },
        'low-stock': {
            label: 'Low Stock',
            color: 'warning' as const,
            icon: '⚠️',
            description: 'Stock level is below minimum threshold'
        },
        'in-stock': {
            label: 'In Stock',
            color: 'success' as const,
            icon: '✅',
            description: 'Stock level is adequate'
        },
        'overstocked': {
            label: 'Overstocked',
            color: 'secondary' as const,
            icon: '📦',
            description: 'Stock level is above maximum threshold'
        }
    }

    return statusMap[status]
}

/**
 * Calculate stock percentage based on min/max thresholds
 */
export function getStockPercentage(product: Product): number {
    if (!product) return 0

    const { currentStock, minimumStock, maximumStock } = product
    const current = currentStock ?? 0
    const minimum = minimumStock ?? 0
    const maximum = maximumStock ?? 100

    if (maximum <= minimum) return 0

    const range = maximum - minimum
    const currentInRange = Math.max(0, current - minimum)

    return Math.min(100, (currentInRange / range) * 100)
}

/**
 * Get formatted stock display text
 */
export function getStockDisplayText(product: Product): string {
    if (!product) return 'N/A'

    const { currentStock, unitOfMeasure, minimumStock } = product
    const current = currentStock ?? 0
    const unit = unitOfMeasure || 'units'
    const min = minimumStock ?? 0

    return `${current} ${unit}${min > 0 ? ` (min: ${min})` : ''}`
}

/**
 * Check if product needs reordering
 */
export function needsReordering(product: Product): boolean {
    if (!product) return false

    const status = getStockStatus(product)
    return status === 'out-of-stock' || status === 'low-stock'
}

/**
 * Get suggested reorder quantity
 */
export function getSuggestedReorderQuantity(product: Product): number {
    if (!product) return 0

    const { currentStock, minimumStock, maximumStock } = product
    const current = currentStock ?? 0
    const minimum = minimumStock ?? 0
    const maximum = maximumStock ?? minimum * 2

    if (current >= minimum) return 0

    // Suggest reordering to reach the maximum level
    return Math.max(0, maximum - current)
}

/**
 * Filter products by category
 */
export function getProductsByCategory(products: Product[], categoryId: string): Product[] {
    if (!Array.isArray(products)) return []
    if (!categoryId) return products

    return products.filter(product => product.categoryId === categoryId)
}

/**
 * Get unique product categories from a list of products
 */
export function getProductCategories(products: Product[]): ProductCategory[] {
    if (!Array.isArray(products)) return []

    const categoriesMap = new Map<string, ProductCategory>()

    products.forEach(product => {
        if (product.categoryId && product.categoryName && !categoriesMap.has(product.categoryId)) {
            categoriesMap.set(product.categoryId, {
                categoryId: product.categoryId,
                categoryName: product.categoryName,
                description: '', // Not available in product data
                createdAt: '' // Not available in product data
            })
        }
    })

    return Array.from(categoriesMap.values())
}

/**
 * Search products by term
 */
export function searchProducts(products: Product[], searchTerm: string): Product[] {
    if (!Array.isArray(products)) return []
    if (!searchTerm?.trim()) return products

    const term = searchTerm.toLowerCase().trim()

    return products.filter(product => {
        return (
            product.productName?.toLowerCase().includes(term) ||
            product.productCode?.toLowerCase().includes(term) ||
            product.description?.toLowerCase().includes(term) ||
            product.brand?.toLowerCase().includes(term) ||
            product.categoryName?.toLowerCase().includes(term) ||
            product.supplierName?.toLowerCase().includes(term)
        )
    })
}

/**
 * Sort products by various criteria
 */
export function sortProducts(products: Product[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Product[] {
    if (!Array.isArray(products)) return []

    const sorted = [...products].sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortBy) {
            case 'name':
                aValue = a.productName?.toLowerCase() || ''
                bValue = b.productName?.toLowerCase() || ''
                break
            case 'code':
                aValue = a.productCode?.toLowerCase() || ''
                bValue = b.productCode?.toLowerCase() || ''
                break
            case 'stock':
                aValue = a.currentStock ?? 0
                bValue = b.currentStock ?? 0
                break
            case 'price':
                aValue = a.sellingPrice ?? 0
                bValue = b.sellingPrice ?? 0
                break
            case 'category':
                aValue = a.categoryName?.toLowerCase() || ''
                bValue = b.categoryName?.toLowerCase() || ''
                break
            case 'supplier':
                aValue = a.supplierName?.toLowerCase() || ''
                bValue = b.supplierName?.toLowerCase() || ''
                break
            case 'status':
                aValue = getStockStatus(a)
                bValue = getStockStatus(b)
                break
            default:
                return 0
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
    })

    return sorted
}

/**
 * Calculate inventory metrics
 */
export function calculateInventoryMetrics(products: Product[]) {
    if (!Array.isArray(products)) {
        return {
            totalProducts: 0,
            totalValue: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            inStockCount: 0,
            averageStockLevel: 0
        }
    }

    let totalValue = 0
    let lowStockCount = 0
    let outOfStockCount = 0
    let inStockCount = 0
    let totalStockLevels = 0

    products.forEach(product => {
        // Calculate total value
        totalValue += (product.currentStock ?? 0) * (product.costPrice ?? 0)

        // Count stock statuses
        const status = getStockStatus(product)
        switch (status) {
            case 'out-of-stock':
                outOfStockCount++
                break
            case 'low-stock':
                lowStockCount++
                break
            case 'in-stock':
            case 'overstocked':
                inStockCount++
                break
        }

        // Add to total stock levels for average calculation
        totalStockLevels += product.currentStock ?? 0
    })

    return {
        totalProducts: products.length,
        totalValue,
        lowStockCount,
        outOfStockCount,
        inStockCount,
        averageStockLevel: products.length > 0 ? totalStockLevels / products.length : 0
    }
}

/**
 * Validate product data
 */
export function validateProduct(product: Partial<Product>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!product.productName?.trim()) {
        errors.push('Product name is required')
    }

    if (!product.productCode?.trim()) {
        errors.push('Product code is required')
    }

    if (!product.categoryId) {
        errors.push('Category is required')
    }

    if (!product.supplierId) {
        errors.push('Supplier is required')
    }

    if (product.costPrice !== undefined && product.costPrice < 0) {
        errors.push('Cost price cannot be negative')
    }

    if (product.sellingPrice !== undefined && product.sellingPrice < 0) {
        errors.push('Selling price cannot be negative')
    }

    if (product.currentStock !== undefined && product.currentStock < 0) {
        errors.push('Current stock cannot be negative')
    }

    if (product.minimumStock !== undefined && product.minimumStock < 0) {
        errors.push('Minimum stock cannot be negative')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Format product for display
 */
export function formatProductForDisplay(product: Product) {
    return {
        ...product,
        stockStatus: getStockStatus(product),
        stockStatusInfo: getStockStatusInfo(product),
        stockPercentage: getStockPercentage(product),
        stockDisplayText: getStockDisplayText(product),
        needsReordering: needsReordering(product),
        suggestedReorderQuantity: getSuggestedReorderQuantity(product)
    }
}

/**
 * Group products by category
 */
export function groupProductsByCategory(products: Product[]) {
    if (!Array.isArray(products)) return {}

    return products.reduce((groups, product) => {
        const categoryName = product.categoryName || 'Uncategorized'
        if (!groups[categoryName]) {
            groups[categoryName] = []
        }
        groups[categoryName].push(product)
        return groups
    }, {} as Record<string, Product[]>)
}

/**
 * Get products that need reordering
 */
export function getProductsNeedingReorder(products: Product[]): Product[] {
    if (!Array.isArray(products)) return []

    return products.filter(needsReordering)
}

/**
 * Calculate markup percentage
 */
export function calculateMarkupPercentage(costPrice: number, sellingPrice: number): number {
    if (costPrice <= 0) return 0
    return ((sellingPrice - costPrice) / costPrice) * 100
}

/**
 * Calculate selling price from cost and markup
 */
export function calculateSellingPrice(costPrice: number, markupPercentage: number): number {
    return costPrice * (1 + markupPercentage / 100)
}