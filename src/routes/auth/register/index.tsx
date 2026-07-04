import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { authClient } from '../../../lib/auth-client'

export const Route = createFileRoute('/auth/register/')({
  component: CareerAIRegister,
})

const brandColor = '#00a676'

function CareerAIRegister() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const { data, error: signUpError } = await authClient.signUp.email({ 
        email, 
        password, 
        name 
      })
      
      if (signUpError) {
        setError(signUpError.message || 'Registration failed')
      } else {
        navigate({ to: '/dashboard' })
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || 'Network error. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/dashboard`
    })
    setIsLoading(false)
  }

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc' }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .illustration-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .focus-brand:focus {
          outline: none;
          border-color: #00a676;
          box-shadow: 0 0 0 3px rgba(0,166,118,0.15);
        }
      `}</style>

      <motion.main
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ maxWidth: 1200 }}
        className="w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* LEFT SIDE */}
        <motion.section
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-between relative"
          style={{ backgroundColor: '#fafafa' }}
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: brandColor }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Career<span style={{ color: brandColor }}>AI</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">Your Future, Our Guidance</p>
          </div>

          {/* Headline */}
          <div className="z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Start <br />
              <span style={{ color: brandColor }}>Your Journey</span>
            </h1>
            <p className="text-gray-600 max-w-sm leading-relaxed mb-12">
              Create an account to get personalized career guidance and unlock endless opportunities.
            </p>
          </div>

          {/* Illustration */}
          <div className="relative mt-auto flex justify-center items-end hidden md:flex">
            <div className="absolute -top-16 right-0 opacity-40">
              <svg
                className="w-24 h-24"
                style={{ color: brandColor }}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                viewBox="0 0 24 24"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPYslXWr3ylt6wT6VuDWpV4gauXQE9GvlsO6Hd3ijq7g7SlXFMZGEvQjGsnxCdyXk3YhAPo_IoqWeyX7Nm6UFnZmJ1-DN_igioOZUy7YQpnfO0gnVQIPUod_4aZcPkgmpPc7OKjkJwgmg5RaeaWzP5bx_THYA7fWREbqdrcWDMqcwHh1v0ld5ob4yA8-EtNRngeZHLzt2WVIlYbnwFNyx9apAusISqO1ypfhiDRTgkvcOsxHUBRjD6Sb2h2K8zNrEPnlK-dFG13xxy"
              alt="CareerAI Illustration"
              className="w-full max-w-lg object-contain illustration-float"
            />
          </div>
        </motion.section>

        {/* RIGHT SIDE */}
        <motion.section
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
          className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-20 bg-white">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account ✨</h2>
              <p className="text-gray-500">Join us to start your career journey!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="focus-brand block w-full px-4 py-3 border border-gray-200 rounded-xl transition-all placeholder-gray-300 text-gray-900"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="focus-brand block w-full px-4 py-3 border border-gray-200 rounded-xl transition-all placeholder-gray-300 text-gray-900"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="focus-brand block w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl transition-all placeholder-gray-300 text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="focus-brand block w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl transition-all placeholder-gray-300 text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
                )}
              </div>

              {/* Error Message */}
              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

              {/* Register Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors mt-4"
                style={{ backgroundColor: brandColor, boxShadow: '0 10px 15px -3px rgba(0,166,118,0.2)' }}
                disabled={!!(password && confirmPassword && password !== confirmPassword) || isLoading}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-400 font-medium">OR</span>
                </div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3.5 px-4 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH54fyTBhPJ8w2Jft1-NyTqqa7isdfKl53xOvSOjXdzCfBiCW6e6m0ZhKTeaRKRPsfRz-5w7BQ_ZhwoAYSrkTyLU-NTOxOmdEzW2V5Liz-nL6Yydu6zYzTY79A-BaHsDoNugdTEkzPD1PP6PEbtcW6ZF7vU9z-Ej-bMRp0PQR6mhr3L-fGXbnecbBTNwpyOaliy6nCDIK-o2HiDc8RsfVI32HhJ5v1GbQ_UzXtvIk8NnyyfX8P8QWy4sNDGm8ZGjcwwKNvEawnotKY"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">Already have an account?</p>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/auth/login' })}
                  className="inline-flex items-center gap-2 font-bold"
                  style={{ color: brandColor }}
                >
                  Log In instead
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </motion.section>
      </motion.main>
    </div>
  )
}
