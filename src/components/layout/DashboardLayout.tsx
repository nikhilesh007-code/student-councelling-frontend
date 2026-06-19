import { Link, useNavigate, useRouteContext } from '@tanstack/react-router'
import { authClient } from '../../lib/auth-client'
import { useState, useEffect } from 'react'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'person', label: 'Profile', to: '/profile' },
  { icon: 'explore', label: 'Career Guidance', to: '/recommendation' },
  { icon: 'analytics', label: 'Skill Gap Analysis', to: '/assessment' },
  { icon: 'map', label: 'Career Roadmap', to: '/roadmap' },
  { icon: 'menu_book', label: 'Learning Resources', to: '/resources' },
  { icon: 'work', label: 'Opportunities', to: '/opportunities' },
  { icon: 'description', label: 'Resume Analysis', to: '/resume' },
  { icon: 'groups', label: 'Mentorship', to: '/mentorship' },
  { icon: 'psychology', label: 'AI Chat Assistant', to: '/assistant' },
  { icon: 'school', label: 'Placement Preparation', to: '/placement' },
  { icon: 'trending_up', label: 'Progress Tracking', to: '/progress' },
  { icon: 'calendar_today', label: 'Study Planner', to: '/planner' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { data: sessionData } = authClient.useSession()
  const context = useRouteContext({ strict: false }) as any;
  const userName = sessionData?.user?.name || context?.sessionUser?.name || 'Student'
  const completionPercentage = context?.completionPercentage || 0;
  const isLocked = completionPercentage < 60;

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const sidebarWidth = isCollapsed ? 72 : 260;

  const restrictedPaths = ['/dashboard', '/recommendation', '/assessment', '/roadmap', '/assistant'];

  const handleLogout = async () => {
    await authClient.signOut()
    navigate({ to: '/auth/login' })
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#f8fafd' }} className="text-[#1c1b1b] min-w-0">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-style: normal;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .hover-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Sidebar */}
      <aside
        style={{ backgroundColor: '#fcf9f8', width: sidebarWidth }}
        className="h-screen fixed left-0 top-0 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col py-6 px-3 z-20 transition-all duration-300 ease-in-out overflow-hidden hidden md:flex"
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} mb-8 transition-all duration-300`}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#00a878' }}>
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div className={`flex-1 min-w-0 flex items-center transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            <h1 className="text-xl font-bold whitespace-nowrap">Career<span style={{ color: '#00a878' }}>AI</span></h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto sidebar-scroll space-y-2 overflow-x-hidden">
          {navItems.map((item) => {
            const isItemLocked = isLocked && restrictedPaths.includes(item.to);
            const Component = item.to && !isItemLocked ? Link : 'button';
            
            return (
            <Component
              key={item.label}
              to={item.to as any}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 text-left rounded-lg transition-colors ${isItemLocked ? 'text-gray-400 cursor-not-allowed' : 'text-[#50606f] hover:text-[#006c4c] hover:bg-[#f6f3f2]'}`}
              activeProps={!isItemLocked ? { className: `text-[#006c4c] font-bold ${isCollapsed ? 'bg-[#00a878]/10' : 'border-l-4 border-[#006c4c] bg-[#00a878]/10 rounded-r-lg'}`, style: { fontVariationSettings: "'FILL' 1" } } : undefined}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </div>
              {!isCollapsed && isItemLocked && (
                <span className="material-symbols-outlined text-[16px] text-gray-300">lock</span>
              )}
            </Component>
          )})}
        </nav>

        <div className="mt-auto pt-4 border-t border-[#bccac0]/20 space-y-2">
          <Link to="/settings" title={isCollapsed ? "Settings" : undefined} className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 text-[#50606f] hover:text-[#006c4c] hover:bg-[#f6f3f2] rounded-lg transition-colors`} activeProps={{ className: `text-[#006c4c] font-bold ${isCollapsed ? 'bg-[#00a878]/10' : 'border-l-4 border-[#006c4c] bg-[#00a878]/10 rounded-r-lg'}`, style: { fontVariationSettings: "'FILL' 1" } }}>
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {!isCollapsed && <span className="text-sm capitalize whitespace-nowrap">settings</span>}
          </Link>
          <button onClick={handleLogout} title={isCollapsed ? "Logout" : undefined} className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 text-[#50606f] hover:text-[#006c4c] hover:bg-[#f6f3f2] rounded-lg transition-colors`}>
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!isCollapsed && <span className="text-sm capitalize whitespace-nowrap">logout</span>}
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header
        style={{ left: sidebarWidth, backgroundColor: '#fcf9f8' }}
        className="h-16 fixed top-0 right-0 z-10 flex justify-between items-center px-6 border-b border-[#bccac0]/30 transition-all duration-300 ease-in-out left-0 md:left-auto"
      >
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all hidden md:block">
            <span className="material-symbols-outlined">{isCollapsed ? 'menu' : 'menu_open'}</span>
          </button>
          <button className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all block md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="relative w-full max-w-md hidden sm:block">
            <input
              className="w-full bg-[#f6f3f2] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#00a878]"
              placeholder="Search careers, skills, internships..."
              type="text"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#50606f] text-[20px]">search</span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00a878] border-2 border-white rounded-full"></span>
          </button>
          <button className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all">
            <span className="material-symbols-outlined">mail</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-[#bccac0]/30 max-w-[200px]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgWym7DldXnEhbwrZfOC_NtONNlu4wbur2YuUXlTYUj6VmxMEZO2HJWwSPYYQTXzRX7-PmkDBpwV_75e7fNpjESS8isWeROPalBEFI9HiCOwn-e2oZilJQCE3Kzbce13jlDDGk1vo1w5E7QIsPvJA687oWsXRDVYT-EUbDZWp4665oxoMeLY4aY6nJI_yrC_P5JnSo2qzObHk6mAqNTs8B3J8zJxzOZD4k7SgXV-Uty1g0yAf_Yq8cTiLkyqdOxyB7xfFEzPzlT_bp"
              alt="User Profile"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <span className="font-bold text-sm truncate">{userName}</span>
            <span className="material-symbols-outlined text-[#50606f] text-[18px] shrink-0">keyboard_arrow_down</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ marginLeft: sidebarWidth }} className="mt-16 p-8 min-h-screen transition-all duration-300 ease-in-out ml-0 md:ml-auto">
        {children}
      </main>
    </div>
  )
}
