import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'


export const Route = createFileRoute('/auth/login/')({
  component: CareerAILogin,
})




const brandColor = '#00a676'

function CareerAILogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  navigate({ to: '/dashboard' })
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

      <main
        style={{ maxWidth: 1200 }}
        className="w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* LEFT SIDE */}
        <section
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
              Welcome to <br />
              <span style={{ color: brandColor }}>Your Career Journey</span>
            </h1>
            <p className="text-gray-600 max-w-sm leading-relaxed mb-12">
              Log in to get personalized career guidance, track your progress and unlock endless opportunities.
            </p>
          </div>

          {/* Illustration */}
          <div className="relative mt-auto flex justify-center items-end">
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

          {/* Trust Badge */}
          <div className="mt-8 flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(0,166,118,0.1)' }}
            >
              <svg className="w-6 h-6" style={{ color: brandColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Your data is safe with us</p>
              <p className="text-gray-500" style={{ fontSize: 10 }}>We use advanced security to protect your information.</p>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-20 bg-white">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back 👋</h2>
              <p className="text-gray-500">Glad to see you again! Please login to continue.</p>
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
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="focus-brand block w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl transition-all placeholder-gray-300 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                    style={{ accentColor: brandColor }}
                  />
                  <span className="text-sm text-gray-700">Remember Me</span>
                </label>
                <a href="#" className="text-sm font-medium" style={{ color: brandColor }}>
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors"
                style={{ backgroundColor: brandColor, boxShadow: '0 10px 15px -3px rgba(0,166,118,0.2)' }}
              >
                Login
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
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3.5 px-4 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH54fyTBhPJ8w2Jft1-NyTqqa7isdfKl53xOvSOjXdzCfBiCW6e6m0ZhKTeaRKRPsfRz-5w7BQ_ZhwoAYSrkTyLU-NTOxOmdEzW2V5Liz-nL6Yydu6zYzTY79A-BaHsDoNugdTEkzPD1PP6PEbtcW6ZF7vU9z-Ej-bMRp0PQR6mhr3L-fGXbnecbBTNwpyOaliy6nCDIK-o2HiDc8RsfVI32HhJ5v1GbQ_UzXtvIk8NnyyfX8P8QWy4sNDGm8ZGjcwwKNvEawnotKY"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              {/* Create Account */}
              <div className="text-center mt-10">
                <p className="text-sm font-semibold text-gray-900 mb-2">Don't have an account?</p>
                <a href="#" className="inline-flex items-center gap-2 font-bold" style={{ color: brandColor }}>
                  Create Account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </a>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}