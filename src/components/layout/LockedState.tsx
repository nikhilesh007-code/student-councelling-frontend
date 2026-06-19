import { Link } from '@tanstack/react-router'

export function LockedState({ message = "Complete your profile to unlock personalized recommendations." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
      </div>
      <h2 className="text-2xl font-bold mb-3">Profile Incomplete</h2>
      <p className="text-[#50606f] mb-8 max-w-md leading-relaxed">{message}</p>
      <Link to="/profile" className="text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-[1.02] shadow-lg" style={{ backgroundColor: '#00a878', boxShadow: '0 10px 15px -3px rgba(0,168,120,0.2)' }}>
        Complete Profile
      </Link>
    </div>
  )
}
