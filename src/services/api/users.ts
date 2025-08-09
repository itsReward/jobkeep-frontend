// src/services/api/users.ts
import { ApiService } from './base'
import { apiClient } from './base'

export interface User {
    id: string
    username: string
    email: string
    userRole: string
    employeeId: string
    employeeName: string
    employeeSurname: string
}

export interface CreateUserRequest {
    username: string
    password: string
    email: string
    userRole: string
    employeeId: string
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

export class UserService extends ApiService {
    constructor() {
        super('/users')
    }

    async getAll(): Promise<User[]> {
        return this.get<User[]>('/all')
    }

    async getCurrentUser(): Promise<User> {
        return this.get<User>('/me')
    }

    async getById(id: string): Promise<User> {
        return this.get<User>(`/get/${id}`)
    }

    async findByUsername(username: string): Promise<User> {
        return this.get<User>(`/find/${username}`)
    }

    async findByEmail(email: string): Promise<User> {
        return this.get<User>(`/find/${email}`)
    }

    async findByEmployeeId(employeeId: string): Promise<User> {
        return this.get<User>(`/find/${employeeId}`)
    }

    async create(user: CreateUserRequest): Promise<User> {
        return this.post<User>('/new', user)
    }

    async update(id: string, user: UpdateUserRequest): Promise<User> {
        return this.put<User>(`/update/${id}`, user)
    }

    async delete(id: string): Promise<{ message: string }> {
        return super.delete<{ message: string }>(`/delete/${id}`)
    }
}

export const userService = new UserService()

// Updated AuthService to use the existing apiClient
export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    accessToken: string
}

export class AuthService {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            // Use the existing apiClient which handles the proxy correctly
            const response = await apiClient.post('/auth', credentials)
            return response.data
        } catch (error: any) {
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const message = error.response.data?.message || error.response.data?.error || 'Authentication failed'
                throw new Error(message)
            } else if (error.request) {
                // Network error
                throw new Error('Unable to connect to server. Please check your connection.')
            } else {
                // Other error
                throw new Error('An unexpected error occurred during login')
            }
        }
    }

    async logout(): Promise<void> {
        localStorage.removeItem('accessToken')
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken')
    }
}

export const authService = new AuthService()