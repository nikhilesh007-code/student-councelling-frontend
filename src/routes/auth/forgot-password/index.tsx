import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '../../../lib/auth-client'

export const Route = createFileRoute('/auth/forgot-password/')({
  component: ForgotPassword,
})

const brandColor = '#00a676'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      setIsLoading(false);
      
      if (!res.ok) {
        setError(data.error || 'Failed to send reset link');
      } else {
        setSuccess(data.message || 'If an account exists, a password reset link has been sent to your email.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  }

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc' }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .focus-brand:focus {
          outline: none;
          border-color: #00a676;
          box-shadow: 0 0 0 3px rgba(0,166,118,0.15);
        }
      `}</style>

      <main
        style={{ maxWidth: 500 }}
        className="w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col"
      >
        <section className="w-full p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
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
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
            <p className="text-gray-500">Enter your email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="focus-brand block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl transition-all placeholder-gray-300 text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Messages */}
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-2 text-center bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors"
              style={{ backgroundColor: brandColor, boxShadow: '0 10px 15px -3px rgba(0,166,118,0.2)' }}
              disabled={isLoading || !!success}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <Link to="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                &larr; Back to Login
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
