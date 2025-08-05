import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Wrench, Eye, EyeOff, ArrowRight, Car, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/api/auth'
import toast from 'react-hot-toast'

interface LoginForm {
  username: string
  password: string
}

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authService.login(data)
      localStorage.setItem('accessToken', response.accessToken)
      toast.success('Welcome back! Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding - Hidden on mobile, visible on md+ */}
        <div className="hidden md:flex md:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute top-40 right-32 w-20 h-20 bg-white bg-opacity-5 rounded-lg rotate-12"></div>
            <div className="absolute bottom-32 left-32 w-16 h-16 bg-white bg-opacity-15 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-20 max-w-2xl">
            {/* Logo Section */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    JobKeep
                  </h1>
                  <div className="w-20 h-1 bg-white bg-opacity-30 rounded-full mt-2"></div>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-white text-opacity-90 mb-4 max-w-md">
                The most comprehensive vehicle garage management system
              </h2>

              <p className="text-base md:text-lg text-white text-opacity-70 max-w-lg leading-relaxed">
                Streamline your operations, manage clients efficiently, and boost your garage's productivity with our modern solution.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white text-opacity-80">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white bg-opacity-10 backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Client Management</h3>
                  <p className="text-sm text-white text-opacity-60">Comprehensive customer database</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white text-opacity-80">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white bg-opacity-10 backdrop-blur-sm">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Vehicle Tracking</h3>
                  <p className="text-sm text-white text-opacity-60">Complete service history</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white text-opacity-80">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white bg-opacity-10 backdrop-blur-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Analytics & Reports</h3>
                  <p className="text-sm text-white text-opacity-60">Data-driven insights</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-opacity-80 hover:text-white transition-all duration-300 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20">
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 max-w-md mx-auto md:max-w-lg flex flex-col justify-center px-8 py-12 bg-white">
          {/* Header */}
          <div className="mb-10">
            {/* Mobile logo - only visible on small screens */}
            <div className="md:hidden flex items-center justify-center mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">JobKeep</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Hello Again!
            </h2>
            <p className="text-gray-600 text-lg">
              Welcome Back
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              <div>
                <Input
                    label=""
                    placeholder="Email Address"
                    {...register('username', { required: 'Username is required' })}
                    error={errors.username?.message}
                    autoComplete="username"
                    className="h-14 text-base rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
              </div>

              <div className="relative">
                <Input
                    label=""
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    error={errors.password?.message}
                    autoComplete="current-password"
                    className="h-14 text-base rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 pr-14"
                />
                <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  loading={isLoading}
                  disabled={isLoading}
              >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                      Login
                      <ArrowRight className="h-5 w-5" />
                    </div>
                )}
              </Button>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <button type="button" className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-200">
                Forgot Password?
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400">
              © 2024 JobKeep. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by Innovation
            </p>
          </div>
        </div>
      </div>
  )
}

export default Login