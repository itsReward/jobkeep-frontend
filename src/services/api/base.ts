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
