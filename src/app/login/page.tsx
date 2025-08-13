'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login response:', { data, error })

      if (error) {
        setError(error.message)
      } else {
        console.log('Login successful, redirecting...')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 flex">
      {/* Split screen container */}
      <div className="flex w-full max-w-6xl mx-auto bg-white rounded-none lg:rounded-3xl shadow-2xl overflow-hidden my-0 lg:my-8">
        
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello Again!</h1>
            <p className="text-gray-600 mb-8">Let's get started with your 30 days trial</p>
            
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-6">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              
              <div className="text-right">
                <a href="#" className="text-sm text-gray-600 hover:text-gray-800">Recovery Password</a>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-4">Or continue with</p>
                <div className="flex justify-center space-x-4">
                  <button type="button" className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                  <button type="button" className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </button>
                  <button type="button" className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </form>
            
            <p className="text-center text-sm text-gray-600 mt-8">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        {/* Right side - Illustration */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-orange-300 via-pink-300 to-purple-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 via-pink-200/50 to-purple-300/50"></div>
          
          {/* Sun */}
          <div className="absolute top-16 right-16 w-20 h-20 bg-yellow-200 rounded-full opacity-80"></div>
          
          {/* Mountains */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {/* Background mountains */}
              <path d="M0,200 Q100,120 200,160 T400,140 L400,300 L0,300 Z" fill="rgba(139, 69, 19, 0.3)" />
              <path d="M0,220 Q150,140 300,180 T400,160 L400,300 L0,300 Z" fill="rgba(139, 69, 19, 0.4)" />
              
              {/* Foreground mountains */}
              <path d="M0,240 Q100,180 200,200 T400,190 L400,300 L0,300 Z" fill="rgba(139, 69, 19, 0.6)" />
              
              {/* Trees */}
              <g fill="rgba(0, 0, 0, 0.7)">
                <rect x="80" y="220" width="3" height="25" />
                <polygon points="81.5,210 75,225 88,225" />
                
                <rect x="120" y="215" width="3" height="30" />
                <polygon points="121.5,205 115,220 128,220" />
                
                <rect x="160" y="225" width="3" height="20" />
                <polygon points="161.5,215 155,230 168,230" />
                
                <rect x="200" y="210" width="3" height="35" />
                <polygon points="201.5,200 195,215 208,215" />
                
                <rect x="240" y="220" width="3" height="25" />
                <polygon points="241.5,210 235,225 248,225" />
              </g>
              
              {/* Water/lake */}
              <ellipse cx="200" cy="260" rx="80" ry="15" fill="rgba(173, 216, 230, 0.6)" />
            </svg>
          </div>
          
          {/* Floating text */}
          <div className="absolute bottom-20 left-8 text-white/90">
            <p className="text-lg font-medium">Finally,</p>
          </div>
          
          {/* Navigation dots */}
          <div className="absolute bottom-8 left-8 flex space-x-2">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
