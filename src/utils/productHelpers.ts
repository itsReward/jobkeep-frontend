// src/utils/productHelpers.ts
// Safe accessor functions for product properties

export const getProductCategories = (product: any): string[] => {
    console.log('🔧 Product categories debug:', product?.categories, typeof product?.categories)

    // Handle different possible structures
    if (Array.isArray(product?.categories)) {
        return product.categories
    }

    // If categories is undefined or null, return empty array
    if (!product?.categories) {
        return []
    }

    // If categories is a single string, wrap it in an array
    if (typeof product.categories === 'string') {
        return [product.categories]
    }

    // Default fallback
    return []
}

export const getCompatibleVehicles = (product: any): string[] => {
    console.log('🔧 Product vehicles debug:', product?.compatibleVehicles, typeof product?.compatibleVehicles)

    if (Array.isArray(product?.compatibleVehicles)) {
        return product.compatibleVehicles
    }

    if (!product?.compatibleVehicles) {
        return []
    }

    if (typeof product.compatibleVehicles === 'string') {
        return [product.compatibleVehicles]
    }

    return []
}

export const getStockStatus = (product: any) => {
    const stockLevel = product?.stockLevel || 0
    const minStockLevel = product?.minStockLevel || 0

    if (stockLevel === 0) {
        return { label: 'Out of Stock', variant: 'error' as const }
    } else if (stockLevel <= minStockLevel) {
        return { label: 'Low Stock', variant: 'warning' as const }
    } else {
        return { label: 'In Stock', variant: 'success' as const }
    }
}