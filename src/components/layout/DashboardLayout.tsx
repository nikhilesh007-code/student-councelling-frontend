import { Link, useNavigate, useRouteContext } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { ChatWidget } from '../chat/ChatWidget'
import { SupportWidget } from '../support/SupportWidget'
import { notificationApi } from '../../lib/notification-api'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'person', label: 'Profile', to: '/profile' },
  { icon: 'explore', label: 'Career Guidance', to: '/recommendation' },
  { icon: 'analytics', label: 'Skill Gap Analysis', to: '/assessment' },
  { icon: 'map', label: 'Career Roadmap', to: '/roadmap' },
  { icon: 'menu_book', label: 'Learning Resources', to: '/resources' },
  { icon: 'work', label: 'Opportunities', to: '/opportunities' },
  { icon: 'description', label: 'Resume Analysis', to: '/resume' },
  { icon: 'school', label: 'Placement Preparation', to: '/placement' },
  { icon: 'trending_up', label: 'Progress Tracking', to: '/progress' },
  { icon: 'calendar_today', label: 'Study Planner', to: '/planner' },
]

interface DashboardLayoutProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function DashboardLayout({ children, searchPlaceholder, searchValue, onSearchChange }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const context = useRouteContext({ strict: false }) as any;
  const userName = context?.sessionUser?.name || 'Student'
  const userId = context?.sessionUser?.id;
  const completionPercentage = context?.completionPercentage || 0;

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupportWidget, setShowSupportWidget] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const getIconForModule = (module: string) => {
    switch (module) {
      case 'PROFILE': return 'person';
      case 'RESUME': return 'description';
      case 'ROADMAP': return 'map';
      case 'STUDY': return 'calendar_today';
      case 'RESOURCES': return 'menu_book';
      case 'PLACEMENT': return 'school';
      case 'OPPORTUNITIES': return 'work';
      default: return 'notifications';
    }
  };

  const getColorForPriority = (priority: string) => {
    switch (priority) {
      case 'SUCCESS': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-amber-600 bg-amber-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      case 'ACHIEVEMENT': return 'text-purple-600 bg-purple-100';
      default: return 'text-[#00a878] bg-[#00a878]/10'; // INFO
    }
  };
  
  // Global Search State
  const [internalSearch, setInternalSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allModules = [
    ...navItems,
    { icon: 'settings', label: 'Settings', to: '/settings' }
  ];

  const currentSearch = searchValue !== undefined ? searchValue : internalSearch;
  
  const filteredModules = allModules.filter(m => 
    m.label.toLowerCase().includes(currentSearch.toLowerCase())
  ).slice(0, 8);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchDropdown(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev < filteredModules.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredModules[searchSelectedIndex]) {
        navigate({ to: filteredModules[searchSelectedIndex].to as any });
        setShowSearchDropdown(false);
        setInternalSearch('');
        onSearchChange?.('');
        searchInputRef.current?.blur();
      }
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalSearch(val);
    onSearchChange?.(val);
    setShowSearchDropdown(true);
    setSearchSelectedIndex(0);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Request browser notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      try {
        const [countRes, res] = await Promise.all([
          notificationApi.getUnreadCount(userId),
          notificationApi.getUnreadNotifications(userId)
        ]);

        if (countRes.success) {
          setUnreadCount(countRes.count);
        }

        if (res.success) {
          const newNotifications = res.notifications;
          setNotifications(prev => {
            const prevIds = new Set(prev.map(n => n.id));
            newNotifications.forEach((n: any) => {
              if (!prevIds.has(n.id) && (n.type === 'STUDY_REMINDER' || n.priority === 'ACHIEVEMENT' || n.priority === 'SUCCESS')) {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(n.title, { body: n.message });
                }
              }
            });
            return newNotifications;
          });
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();

    let interval: any;
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchNotifications();
        interval = setInterval(fetchNotifications, 30000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    interval = setInterval(fetchNotifications, 30000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const sidebarWidth = isCollapsed ? 72 : 260;

  const handleLogout = async () => {
    navigate({ to: '/auth/login' })
  }

  const handleMarkAllRead = async () => {
    try {
      if (!userId) return;
      await notificationApi.markAllRead(userId);
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (n: any) => {
    try {
      if (!userId) return;
      await notificationApi.markRead(userId, n.id);
      setNotifications(prev => prev.filter(x => x.id !== n.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (n.actionUrl) {
        navigate({ to: n.actionUrl });
      }
      setShowNotifications(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#f8fafd' }} className="text-[#1c1b1b] min-w-0 flex flex-col min-h-screen">
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
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to as any}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 text-left rounded-lg transition-colors text-[#50606f] hover:text-[#006c4c] hover:bg-[#f6f3f2]`}
              activeProps={{ className: `text-[#006c4c] font-bold ${isCollapsed ? 'bg-[#00a878]/10' : 'border-l-4 border-[#006c4c] bg-[#00a878]/10 rounded-r-lg'}`, style: { fontVariationSettings: "'FILL' 1" } }}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </div>
            </Link>
          ))}
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
          <div className="relative w-full max-w-md hidden sm:block" ref={searchContainerRef}>
            <input
              ref={searchInputRef}
              className="w-full bg-[#f6f3f2] border-none rounded-full py-2 pl-10 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-[#00a878]"
              placeholder={searchPlaceholder || "Search modules..."}
              type="text"
              value={currentSearch}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={handleSearchKeyDown}
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#50606f] text-[20px] pointer-events-none">search</span>
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {currentSearch && (
                <button 
                  onClick={() => {
                    setInternalSearch('');
                    onSearchChange?.('');
                    searchInputRef.current?.focus();
                  }} 
                  className="text-slate-400 hover:text-slate-600 flex items-center justify-center mr-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50 py-2">
                {filteredModules.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">
                    No modules found
                  </div>
                ) : (
                  filteredModules.map((m, idx) => (
                    <button
                      key={m.label}
                      onClick={() => {
                        navigate({ to: m.to as any });
                        setShowSearchDropdown(false);
                        setInternalSearch('');
                        onSearchChange?.('');
                      }}
                      onMouseEnter={() => setSearchSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors
                        ${idx === searchSelectedIndex ? 'bg-[#00a878]/10 text-[#006c4c] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                      {m.label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-[3px] bg-red-500 border border-white text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-50">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-extrabold text-sm text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#00a878] hover:underline">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      <span className="material-symbols-outlined text-4xl mb-2 text-slate-200">notifications_off</span>
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3 items-start transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getColorForPriority(n.priority)}`}>
                          <span className="material-symbols-outlined text-[16px]">{getIconForModule(n.module) || n.icon || 'notifications'}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-extrabold text-slate-800 mb-0.5 truncate">{n.title}</h4>
                          <p className="text-[12px] text-slate-500 line-clamp-2 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <Link 
                    to="/notifications" 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-[#00a878] hover:underline"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setShowSupportWidget(true)} className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all" title="Support & Feedback">
            <span className="material-symbols-outlined">headset_mic</span>
          </button>
          <div className="relative" ref={userDropdownRef}>
            <div 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 pl-4 border-l border-[#bccac0]/30 max-w-[200px] cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="font-bold text-sm truncate">{userName}</span>
              <span className="material-symbols-outlined text-[#50606f] text-[18px] shrink-0">keyboard_arrow_down</span>
            </div>

            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-3 w-[180px] bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden z-50">
                <div className="py-1">
                  <Link 
                    to="/settings" 
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Settings
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <button 
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowLogoutDialog(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ marginLeft: sidebarWidth }} className="mt-16 flex flex-col transition-all duration-300 ease-in-out ml-0 md:ml-auto flex-1">
        {completionPercentage < 100 && (
          <div className="bg-[#fff8e1] border-b border-[#ffe082] px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#50606f] text-sm font-medium">
              <span className="material-symbols-outlined text-[#ff8f00] text-[20px]">info</span>
              Complete your profile to receive better recommendations.
            </div>
            <Link to="/profile" className="text-[#006c4c] font-bold text-sm hover:underline">
              Complete Profile
            </Link>
          </div>
        )}
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
      <SupportWidget userId={userId} isOpen={showSupportWidget} onClose={() => setShowSupportWidget(false)} />
      <ChatWidget />

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setShowLogoutDialog(false)} className="px-4 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-medium">Cancel</button>
            <button onClick={() => { setShowLogoutDialog(false); handleLogout(); }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Logout</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
