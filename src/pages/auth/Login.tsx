import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Wrench, Eye, EyeOff, ArrowRight, Sparkles, Car, Users, BarChart3 } from 'lucide-react'
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
      toast.success('Welcome back! Login successful!', {
        icon: '🎉',
        style: {
          borderRadius: '16px',
          background: '#E3F2FD',
          color: '#2962FF',
          border: '1px solid #5D88FF'
        }
      })
      navigate('/dashboard')
    } catch (error) {
      toast.error('Invalid credentials. Please try again.', {
        icon: '🔒',
        style: {
          borderRadius: '16px',
          background: '#FFEBEE',
          color: '#C62828'
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="h-screen w-screen flex overflow-hidden">
        {/* Left Side - Branding */}
        <div
            className="flex-1 relative overflow-hidden flex flex-col justify-center items-start"
            style={{
              background: 'linear-gradient(135deg, #2962FF 0%, #5D88FF 50%, #6E8BD8 100%)',
              minHeight: '100vh'
            }}
        >

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-10 animate-pulse"
                 style={{ background: 'radial-gradient(circle, #E3F2FD 0%, transparent 70%)' }}></div>
            <div className="absolute top-1/3 -right-16 w-80 h-80 rounded-full opacity-15 animate-pulse"
                 style={{ background: 'radial-gradient(circle, #B3B3F3 0%, transparent 70%)', animationDelay: '1s' }}></div>
            <div className="absolute -bottom-16 left-1/4 w-72 h-72 rounded-full opacity-10 animate-pulse"
                 style={{ background: 'radial-gradient(circle, #5D88FF 0%, transparent 70%)', animationDelay: '2s' }}></div>
          </div>

          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-20 animate-bounce opacity-20" style={{ animationDelay: '0.5s' }}>
            <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm"></div>
          </div>
          <div className="absolute top-40 right-32 animate-bounce opacity-15" style={{ animationDelay: '1.5s' }}>
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm rotate-12"></div>
          </div>
          <div className="absolute bottom-32 left-32 animate-bounce opacity-25" style={{ animationDelay: '2.5s' }}>
            <div className="w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 md:px-12 lg:px-16 xl:px-20 max-w-2xl">

            {/* Logo Section */}
            <div className="mb-12 animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl relative"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                       backdropFilter: 'blur(20px)',
                       border: '1px solid rgba(255, 255, 255, 0.2)'
                     }}>
                  <Wrench className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    JobKeep
                  </h1>
                  <div className="w-20 h-1 bg-white/30 rounded-full mt-2"></div>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-white/90 mb-4 max-w-md">
                The most comprehensive vehicle garage management system
              </h2>

              <p className="text-base md:text-lg text-white/70 max-w-lg leading-relaxed">
                Streamline your operations, manage clients efficiently, and boost your garage's productivity with our modern solution.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-4 text-white/80">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                     style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Client Management</h3>
                  <p className="text-sm text-white/60">Comprehensive customer database</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/80">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                     style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Vehicle Tracking</h3>
                  <p className="text-sm text-white/60">Complete service history</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/80">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                     style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Analytics & Reports</h3>
                  <p className="text-sm text-white/60">Data-driven insights</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div
            className="w-full bg-white flex flex-col justify-center relative"
            style={{
              maxWidth: '480px',
              minWidth: '400px',
              minHeight: '100vh'
            }}
        >

          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0"
                 style={{
                   backgroundImage: `radial-gradient(circle at 25% 25%, #E3F2FD 0%, transparent 50%),
                                 radial-gradient(circle at 75% 75%, #B3B3F3 0%, transparent 50%)`
                 }}></div>
          </div>

          <div className="relative z-10 w-full max-w-sm mx-auto px-8">

            {/* Header */}
            <div className="mb-10 animate-fade-in">
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
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <Input
                      label=""
                      placeholder="Email Address"
                      {...register('username', { required: 'Username is required' })}
                      error={errors.username?.message}
                      autoComplete="username"
                      className="h-14 text-base rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 transition-all duration-300"
                  />
                </div>

                <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <Input
                      label=""
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { required: 'Password is required' })}
                      error={errors.password?.message}
                      autoComplete="current-password"
                      className="h-14 text-base rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 transition-all duration-300 pr-14"
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

              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Button
                    type="submit"
                    className="w-full h-14 text-base font-semibold rounded-2xl relative overflow-hidden group transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    loading={isLoading}
                    disabled={isLoading}
                    style={{
                      background: 'linear-gradient(135deg, #2962FF 0%, #5D88FF 100%)',
                      border: 'none',
                    }}
                >
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </>
                  ) : (
                      <>
                        Login
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                  )}
                </span>
                </Button>
              </div>

              {/* Forgot Password */}
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <button type="button" className="text-gray-500 hover:text-primary-600 text-sm transition-colors duration-200">
                  Forgot Password
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-xs text-gray-400">
                © 2024 JobKeep. All rights reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Powered by Innovation
              </p>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }
        `
        }} />
      </div>
  )
}

export default Login