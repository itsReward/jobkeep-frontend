import { ApiService } from './base'
import {User} from "@/types";

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export class AuthService extends ApiService {
  constructor() {
    super('')
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth', credentials)
  }

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken')
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/users/me')
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  }
}

export const authService = new AuthService()
