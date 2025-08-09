// src/pages/auth/Login.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Wrench, Eye, EyeOff, ArrowRight, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/components/providers/AuthProvider'

interface LoginForm {
  username: string
  password: string
}

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data)
    } catch (error) {
      // Error handling is done in the useAuth hook
      console.error('Login failed:', error)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 shadow-lg">
                  <Wrench className="h-7 w-7 text-white" />
                </div>
              </div>
              <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                Welcome to JobKeep
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Input
                      id="username"
                      type="text"
                      placeholder="Username"
                      {...register('username', {
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Username must be at least 3 characters' }
                      })}
                      error={errors.username?.message}
                  />
                </div>

                <div className="relative">
                  <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 3, message: 'Password must be at least 6 characters' }
                      })}
                      error={errors.password?.message}
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Button
                    type="submit"
                    className="w-full group"
                    disabled={isLoading}
                    size="lg"
                >
                  {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                  ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="text-center text-xs text-gray-500">
                Secure automotive service management platform
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Feature Showcase */}
        <div className="hidden lg:block lg:flex-1 bg-white">
          <div className="h-full flex flex-col justify-center px-12">
            <div className="max-w-lg">
              <h1 className="text-4xl font-bold text-gray-900 mb-8">
                Streamline Your Auto Service Operations
              </h1>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-100">
                    <BarChart3 className="h-6 w-6 text-success-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics & Reporting</h3>
                    <p className="text-gray-600">
                      Comprehensive business insights, performance metrics, and financial reporting
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Trusted by automotive service centers across Zimbabwe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Login