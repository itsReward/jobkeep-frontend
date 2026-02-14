// src/services/api/logger.ts
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

export interface APILogEntry {
    id: string
    timestamp: string
    method: string
    url: string
    status?: number
    duration?: number
    requestHeaders?: Record<string, string>
    requestData?: any
    responseData?: any
    responseHeaders?: Record<string, string>
    error?: string
    type: 'request' | 'response' | 'error'
}

class APILogger {
    private logs: APILogEntry[] = []
    private maxLogs = 100
    private enableConsoleLogging = true
    private enableDetailedLogging = true

    constructor() {
        // Check if we're in development mode
        this.enableConsoleLogging = true // Force enable for debugging
        this.enableDetailedLogging = true // Force enable for debugging
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9)
    }

    private sanitizeHeaders(headers: any): Record<string, string> {
        const sanitized: Record<string, string> = {}
        Object.keys(headers || {}).forEach(key => {
            // Hide sensitive information
            if (key.toLowerCase() === 'authorization') {
                sanitized[key] = headers[key] ? 'Bearer ***' : undefined
            } else {
                sanitized[key] = headers[key]
            }
        })
        return sanitized
    }

    private sanitizeData(data: any): any {
        if (!data) return data

        // If it's a FormData, convert to a readable object
        if (data instanceof FormData) {
            const formDataObj: Record<string, any> = {}
            for (const [key, value] of data.entries()) {
                formDataObj[key] = value instanceof File ? `[File: ${value.name}]` : value
            }
            return formDataObj
        }

        // Clone and sanitize passwords
        try {
            const cloned = JSON.parse(JSON.stringify(data))
            if (cloned.password) cloned.password = '***'
            return cloned
        } catch {
            return '[Non-serializable data]'
        }
    }

    logRequest(config: AxiosRequestConfig & { metadata?: { startTime: number } }): string {
        const id = this.generateId()
        const startTime = Date.now()

        // Add metadata to track request timing
        config.metadata = { startTime }

        const logEntry: APILogEntry = {
            id,
            timestamp: new Date().toISOString(),
            method: (config.method || 'GET').toUpperCase(),
            url: `${config.baseURL || ''}${config.url || ''}`,
            requestHeaders: this.enableDetailedLogging ? this.sanitizeHeaders(config.headers) : undefined,
            requestData: this.enableDetailedLogging ? this.sanitizeData(config.data) : undefined,
            type: 'request'
        }

        this.addLog(logEntry)

        if (this.enableConsoleLogging) {
            console.group(`🚀 API REQUEST [${id}]`)
            console.log(`${logEntry.method} ${logEntry.url}`)
            if (this.enableDetailedLogging && logEntry.requestData) {
                console.log('📤 Request Data:', logEntry.requestData)
            }
            if (this.enableDetailedLogging && logEntry.requestHeaders) {
                console.log('📋 Request Headers:', logEntry.requestHeaders)
            }
            console.groupEnd()
        }

        return id
    }

    logResponse(response: AxiosResponse): void {
        const config = response.config as any
        const requestId = this.findRequestId(config)
        const duration = config.metadata?.startTime ? Date.now() - config.metadata.startTime : undefined

        const logEntry: APILogEntry = {
            id: requestId || this.generateId(),
            timestamp: new Date().toISOString(),
            method: (config.method || 'GET').toUpperCase(),
            url: `${config.baseURL || ''}${config.url || ''}`,
            status: response.status,
            duration,
            responseHeaders: this.enableDetailedLogging ? this.sanitizeHeaders(response.headers) : undefined,
            responseData: this.enableDetailedLogging ? this.sanitizeData(response.data) : undefined,
            type: 'response'
        }

        this.updateLog(requestId, logEntry)

        if (this.enableConsoleLogging) {
            const statusEmoji = response.status < 300 ? '✅' : response.status < 400 ? '⚠️' : '❌'
            console.group(`${statusEmoji} API RESPONSE [${requestId}] - ${response.status} ${response.statusText}`)
            console.log(`${logEntry.method} ${logEntry.url}`)
            if (duration) console.log(`⏱️ Duration: ${duration}ms`)
            if (this.enableDetailedLogging && logEntry.responseData) {
                console.log('📥 Response Data:', logEntry.responseData)
            }
            if (this.enableDetailedLogging && logEntry.responseHeaders) {
                console.log('📋 Response Headers:', logEntry.responseHeaders)
            }
            console.groupEnd()
        }
    }

    logError(error: AxiosError): void {
        const config = error.config as any
        const requestId = this.findRequestId(config)
        const duration = config?.metadata?.startTime ? Date.now() - config.metadata.startTime : undefined

        const logEntry: APILogEntry = {
            id: requestId || this.generateId(),
            timestamp: new Date().toISOString(),
            method: (config?.method || 'UNKNOWN').toUpperCase(),
            url: config ? `${config.baseURL || ''}${config.url || ''}` : 'Unknown URL',
            status: error.response?.status,
            duration,
            error: error.message,
            responseData: this.enableDetailedLogging ? this.sanitizeData(error.response?.data) : undefined,
            type: 'error'
        }

        this.updateLog(requestId, logEntry)

        if (this.enableConsoleLogging) {
            console.group(`❌ API ERROR [${requestId}] - ${error.response?.status || 'Network Error'}`)
            console.log(`${logEntry.method} ${logEntry.url}`)
            console.error('💥 Error:', error.message)
            if (duration) console.log(`⏱️ Duration: ${duration}ms`)
            if (this.enableDetailedLogging && error.response?.data) {
                console.log('📥 Error Response:', error.response.data)
            }
            if (error.stack) {
                //console.log('📚 Stack Trace:', error.stack)
            }
            console.groupEnd()
        }
    }

    private findRequestId(config: any): string | undefined {
        // Try to find existing request log by matching URL and method
        const url = `${config.baseURL || ''}${config.url || ''}`
        const method = (config.method || 'GET').toUpperCase()

        // Find the most recent request that matches
        for (let i = this.logs.length - 1; i >= 0; i--) {
            const log = this.logs[i]
            if (log.type === 'request' && log.url === url && log.method === method) {
                return log.id
            }
        }
        return undefined
    }

    private addLog(entry: APILogEntry): void {
        this.logs.push(entry)
        if (this.logs.length > this.maxLogs) {
            this.logs.shift()
        }
    }

    private updateLog(id: string | undefined, entry: APILogEntry): void {
        if (!id) {
            this.addLog(entry)
            return
        }

        const existingIndex = this.logs.findIndex(log => log.id === id)
        if (existingIndex !== -1) {
            // Merge with existing log
            this.logs[existingIndex] = { ...this.logs[existingIndex], ...entry }
        } else {
            this.addLog(entry)
        }
    }

    // Public methods for debugging
    getLogs(): APILogEntry[] {
        return [...this.logs]
    }

    getErrorLogs(): APILogEntry[] {
        return this.logs.filter(log => log.type === 'error' || (log.status && log.status >= 400))
    }

    getSlowRequests(thresholdMs = 2000): APILogEntry[] {
        return this.logs.filter(log => log.duration && log.duration > thresholdMs)
    }

    clearLogs(): void {
        this.logs = []
        console.log('🧹 API logs cleared')
    }

    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2)
    }

    // Filter logs by URL pattern (useful for debugging specific endpoints)
    getLogsByPattern(pattern: string): APILogEntry[] {
        const regex = new RegExp(pattern, 'i')
        return this.logs.filter(log => regex.test(log.url))
    }

    // Product-specific debugging methods
    getProductLogs(): APILogEntry[] {
        return this.getLogsByPattern('/products')
    }

    getVehicleCompatibilityLogs(): APILogEntry[] {
        return this.getLogsByPattern('vehicle-compatibility|vehicles')
    }

    // Enable/disable logging
    setConsoleLogging(enabled: boolean): void {
        this.enableConsoleLogging = enabled
        localStorage.setItem('api-debug', enabled.toString())
    }

    setDetailedLogging(enabled: boolean): void {
        this.enableDetailedLogging = enabled
        localStorage.setItem('api-detailed-debug', enabled.toString())
    }

    // Print summary
    printSummary(): void {
        const total = this.logs.length
        const errors = this.getErrorLogs().length
        const slow = this.getSlowRequests().length

        console.group('📊 API Logger Summary')
        console.log(`Total Requests: ${total}`)
        console.log(`Errors: ${errors}`)
        console.log(`Slow Requests (>2s): ${slow}`)
        console.log(`Success Rate: ${total > 0 ? Math.round(((total - errors) / total) * 100) : 0}%`)
        console.groupEnd()
    }
}

// Create singleton instance
export const apiLogger = new APILogger()

// Debugging utilities to be used in browser console
declare global {
    interface Window {
        apiDebug: {
            getLogs: () => APILogEntry[]
            getErrors: () => APILogEntry[]
            getSlow: () => APILogEntry[]
            getProducts: () => APILogEntry[]
            getVehicles: () => APILogEntry[]
            clear: () => void
            export: () => string
            summary: () => void
            enableConsole: (enabled: boolean) => void
            enableDetailed: (enabled: boolean) => void
        }
    }
}

// Add debugging utilities to window object
if (typeof window !== 'undefined') {
    window.apiDebug = {
        getLogs: () => apiLogger.getLogs(),
        getErrors: () => apiLogger.getErrorLogs(),
        getSlow: () => apiLogger.getSlowRequests(),
        getProducts: () => apiLogger.getProductLogs(),
        getVehicles: () => apiLogger.getVehicleCompatibilityLogs(),
        clear: () => apiLogger.clearLogs(),
        export: () => apiLogger.exportLogs(),
        summary: () => apiLogger.printSummary(),
        enableConsole: (enabled: boolean) => apiLogger.setConsoleLogging(enabled),
        enableDetailed: (enabled: boolean) => apiLogger.setDetailedLogging(enabled)
    }
}