// src/utils/quotationExpiry.ts
import { Quotation, QuotationStatus } from '@/types/quotation'
import { quotationService } from '@/services/api/quotations'

/**
 * Check if a quotation is expired
 */
export const isQuotationExpired = (quotation: Quotation): boolean => {
    if (!quotation.validUntil || quotation.status !== QuotationStatus.PENDING) {
        return false
    }

    const validUntilDate = new Date(quotation.validUntil)
    const today = new Date()

    // Set time to end of day for validUntil and start of day for today for accurate comparison
    validUntilDate.setHours(23, 59, 59, 999)
    today.setHours(0, 0, 0, 0)

    return validUntilDate < today
}

/**
 * Check if a quotation is expiring soon (within next 3 days)
 */
export const isQuotationExpiringSoon = (quotation: Quotation): boolean => {
    if (!quotation.validUntil || quotation.status !== QuotationStatus.PENDING) {
        return false
    }

    const validUntilDate = new Date(quotation.validUntil)
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    return validUntilDate <= threeDaysFromNow && validUntilDate >= new Date()
}

/**
 * Get days until expiry
 */
export const getDaysUntilExpiry = (quotation: Quotation): number | null => {
    if (!quotation.validUntil) {
        return null
    }

    const validUntilDate = new Date(quotation.validUntil)
    const today = new Date()

    // Set time to start of day for accurate day calculation
    validUntilDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = validUntilDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
}

/**
 * Batch update expired quotations
 * This function would typically be called by a background job or cron task
 */
export const updateExpiredQuotations = async (quotations: Quotation[]): Promise<void> => {
    const expiredQuotations = quotations.filter(isQuotationExpired)

    const updatePromises = expiredQuotations.map(quotation =>
        quotationService.updateStatus(quotation.quotationId, QuotationStatus.EXPIRED)
    )

    try {
        await Promise.all(updatePromises)
        console.log(`Updated ${expiredQuotations.length} expired quotations`)
    } catch (error) {
        console.error('Failed to update expired quotations:', error)
        throw error
    }
}

/**
 * Auto-create job card from approved quotation
 * This would be triggered when a quotation status changes to APPROVED
 */
export const createJobCardFromQuotation = async (quotation: Quotation): Promise<string | null> => {
    try {
        // This would integrate with the job card service
        // For now, we'll return a mock job card ID
        const jobCardId = `jc-${Date.now()}`

        // Convert quotation to job card via API
        await quotationService.convertToJobCard(quotation.quotationId, jobCardId)

        return jobCardId
    } catch (error) {
        console.error('Failed to create job card from quotation:', error)
        throw error
    }
}

/**
 * Get expiry status information for display
 */
export const getExpiryStatusInfo = (quotation: Quotation): {
    status: 'expired' | 'expiring-soon' | 'valid' | 'no-expiry'
    message: string
    color: 'red' | 'yellow' | 'green' | 'gray'
} => {
    if (!quotation.validUntil) {
        return {
            status: 'no-expiry',
            message: 'No expiry date',
            color: 'gray'
        }
    }

    if (isQuotationExpired(quotation)) {
        return {
            status: 'expired',
            message: 'Expired',
            color: 'red'
        }
    }

    if (isQuotationExpiringSoon(quotation)) {
        const days = getDaysUntilExpiry(quotation)
        return {
            status: 'expiring-soon',
            message: `Expires in ${days} day${days !== 1 ? 's' : ''}`,
            color: 'yellow'
        }
    }

    const days = getDaysUntilExpiry(quotation)
    return {
        status: 'valid',
        message: days ? `Valid for ${days} more day${days !== 1 ? 's' : ''}` : 'Valid',
        color: 'green'
    }
}

/**
 * Calculate quotation metrics for dashboard/reporting
 */
export const calculateQuotationMetrics = (quotations: Quotation[]) => {
    const expired = quotations.filter(isQuotationExpired)
    const expiringSoon = quotations.filter(isQuotationExpiringSoon)
    const approved = quotations.filter(q => q.status === QuotationStatus.APPROVED)
    const converted = quotations.filter(q => q.convertedToJobCard)

    const totalValue = quotations.reduce((sum, q) => sum + q.totalAmount, 0)
    const approvedValue = approved.reduce((sum, q) => sum + q.totalAmount, 0)
    const convertedValue = converted.reduce((sum, q) => sum + q.totalAmount, 0)

    const conversionRate = quotations.length > 0 ? (converted.length / quotations.length) * 100 : 0
    const approvalRate = quotations.length > 0 ? (approved.length / quotations.length) * 100 : 0

    return {
        total: quotations.length,
        expired: expired.length,
        expiringSoon: expiringSoon.length,
        approved: approved.length,
        converted: converted.length,
        totalValue,
        approvedValue,
        convertedValue,
        conversionRate,
        approvalRate
    }
}