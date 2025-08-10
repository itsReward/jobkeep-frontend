// src/services/api/base.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants'
import { apiLogger } from './logger'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and logging
apiClient.interceptors.request.use(
    (config) => {
      // Add auth token
      const isAuthEndpoint = config.url === '/auth' || config.url?.endsWith('/auth')

      if (!isAuthEndpoint) {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }

      // Log the request
      apiLogger.logRequest(config)

      return config
    },
    (error) => {
      apiLogger.logError(error)
      return Promise.reject(error)
    }
)

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful response
      apiLogger.logResponse(response)
      return response
    },
    (error) => {
      // Log error
      apiLogger.logError(error)

      // Handle 401 unauthorized
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
    try {
      const response = await apiClient.get(`${this.basePath}${endpoint}`, config)
      return response.data
    } catch (error: any) {
      // Additional logging for specific product/vehicle errors
      if (this.basePath.includes('product') || endpoint.includes('vehicle')) {
        console.error(`🔍 Product/Vehicle API Error in ${this.basePath}${endpoint}:`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          config: {
            url: `${this.basePath}${endpoint}`,
            method: 'GET',
            headers: error.config?.headers
          }
        })
      }
      throw error
    }
  }

  protected async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.post(`${this.basePath}${endpoint}`, data, config)
      return response.data
    } catch (error: any) {
      if (this.basePath.includes('product') || endpoint.includes('vehicle')) {
        console.error(`🔍 Product/Vehicle API Error in ${this.basePath}${endpoint}:`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          requestData: data,
          config: {
            url: `${this.basePath}${endpoint}`,
            method: 'POST',
            headers: error.config?.headers
          }
        })
      }
      throw error
    }
  }

  protected async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.put(`${this.basePath}${endpoint}`, data, config)
      return response.data
    } catch (error: any) {
      if (this.basePath.includes('product') || endpoint.includes('vehicle')) {
        console.error(`🔍 Product/Vehicle API Error in ${this.basePath}${endpoint}:`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          requestData: data,
          config: {
            url: `${this.basePath}${endpoint}`,
            method: 'PUT',
            headers: error.config?.headers
          }
        })
      }
      throw error
    }
  }

  protected async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.delete(`${this.basePath}${endpoint}`, config)
      return response.data
    } catch (error: any) {
      if (this.basePath.includes('product') || endpoint.includes('vehicle')) {
        console.error(`🔍 Product/Vehicle API Error in ${this.basePath}${endpoint}:`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          config: {
            url: `${this.basePath}${endpoint}`,
            method: 'DELETE',
            headers: error.config?.headers
          }
        })
      }
      throw error
    }
  }
}

// Debug utilities specifically for product/vehicle issues
export const productDebugUtils = {
  // Test product endpoints
  async testProductEndpoints() {
    console.group('🧪 Testing Product Endpoints')

    try {
      console.log('Testing /api/products/all...')
      const response = await apiClient.get('/api/products/all')
      console.log('✅ Products loaded successfully:', response.data?.length || 0, 'items')
    } catch (error: any) {
      console.error('❌ Failed to load products:', error.response?.status, error.message)
    }

    try {
      console.log('Testing /api/products/vehicles...')
      const response = await apiClient.get('/api/products/vehicles')
      console.log('✅ Product vehicles loaded successfully:', response.data?.length || 0, 'items')
    } catch (error: any) {
      console.error('❌ Failed to load product vehicles:', error.response?.status, error.message)
    }

    try {
      console.log('Testing /api/products/vehicle-compatibility...')
      const response = await apiClient.get('/api/products/vehicle-compatibility?make=Toyota')
      console.log('✅ Vehicle compatibility loaded successfully:', response.data?.length || 0, 'items')
    } catch (error: any) {
      console.error('❌ Failed to load vehicle compatibility:', error.response?.status, error.message)
    }

    console.groupEnd()
  },

  // Check API connection
  async checkApiConnection() {
    console.group('🔌 API Connection Check')

    try {
      console.log('Testing base API connection...')
      const response = await apiClient.get('/auth')
      console.log('❌ Unexpected success on /auth without credentials')
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        console.log('✅ API is reachable (expected auth error)')
      } else {
        console.error('❌ API connection issue:', error.message)
      }
    }

    console.groupEnd()
  },

  // Analyze recent product errors
  analyzeProductErrors() {
    console.group('📊 Product API Error Analysis')

    const productLogs = apiLogger.getProductLogs()
    const vehicleLogs = apiLogger.getVehicleCompatibilityLogs()
    const errorLogs = apiLogger.getErrorLogs().filter(log =>
        log.url.includes('product') || log.url.includes('vehicle')
    )

    console.log(`Total product requests: ${productLogs.length}`)
    console.log(`Total vehicle requests: ${vehicleLogs.length}`)
    console.log(`Total errors: ${errorLogs.length}`)

    if (errorLogs.length > 0) {
      console.log('\n❌ Recent errors:')
      errorLogs.forEach(log => {
        console.log(`- ${log.method} ${log.url} (${log.status}) - ${log.error}`)
      })
    }

    const slowRequests = [...productLogs, ...vehicleLogs].filter(log =>
        log.duration && log.duration > 1000
    )

    if (slowRequests.length > 0) {
      console.log('\n⏱️ Slow requests (>1s):')
      slowRequests.forEach(log => {
        console.log(`- ${log.method} ${log.url} - ${log.duration}ms`)
      })
    }

    console.groupEnd()
  }
}

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  window.productDebug = productDebugUtils
}

declare global {
  interface Window {
    productDebug: typeof productDebugUtils
  }
}