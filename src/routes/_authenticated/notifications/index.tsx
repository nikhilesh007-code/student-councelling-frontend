import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { notificationApi } from '../../../lib/notification-api'
import { useRouteContext } from '@tanstack/react-router'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: NotificationsPage,
})

function getIconForModule(module: string) {
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
}

function getColorForPriority(priority: string) {
  switch (priority) {
    case 'SUCCESS': return 'text-green-600 bg-green-100';
    case 'WARNING': return 'text-amber-600 bg-amber-100';
    case 'ERROR': return 'text-red-600 bg-red-100';
    case 'ACHIEVEMENT': return 'text-purple-600 bg-purple-100';
    default: return 'text-[#00a878] bg-[#00a878]/10'; // INFO
  }
}

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

function groupNotifications(notifications: any[]) {
  const groups: { [key: string]: any[] } = {
    'Today': [],
    'Yesterday': [],
    'Last 7 Days': [],
    'Older': []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const last7Days = today - (86400000 * 7);

  notifications.forEach(n => {
    const d = new Date(n.createdAt).getTime();
    if (d >= today) {
      groups['Today'].push(n);
    } else if (d >= yesterday) {
      groups['Yesterday'].push(n);
    } else if (d >= last7Days) {
      groups['Last 7 Days'].push(n);
    } else {
      groups['Older'].push(n);
    }
  });

  return groups;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const context = useRouteContext({ strict: false }) as any;
  const userId = context?.sessionUser?.id;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  const [filterModule, setFilterModule] = useState('ALL');
  const [filterRead, setFilterRead] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [search, setSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async (currentPage = page) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const readParam = filterRead === 'ALL' ? undefined : filterRead === 'READ';
      const res = await notificationApi.getNotifications(userId, {
        page: currentPage,
        limit,
        module: filterModule,
        read: readParam,
        search
      });
      if (res.success) {
        setNotifications(res.notifications);
        setTotal(res.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
    setPage(1);
  }, [filterModule, filterRead, search, userId]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchNotifications(newPage);
  };

  const handleMarkAsRead = async (id: string, actionUrl?: string) => {
    if (!userId) return;
    try {
      await notificationApi.markRead(userId, id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      if (actionUrl) {
        navigate({ to: actionUrl });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    try {
      await notificationApi.markAllRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await notificationApi.deleteById(userId, id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAll = async () => {
    if (!userId) return;
    if (confirm("Are you sure you want to delete all non-system notifications?")) {
      try {
        await notificationApi.deleteAll(userId);
        fetchNotifications(1);
        setPage(1);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const clearFilters = () => {
    setFilterModule('ALL');
    setFilterRead('ALL');
    setSearch('');
  };

  const totalPages = Math.ceil(total / limit);
  const grouped = groupNotifications(notifications);

  const modules = ['ALL', 'PROFILE', 'RESUME', 'ROADMAP', 'STUDY', 'RESOURCES', 'PLACEMENT', 'OPPORTUNITIES'];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto flex flex-col h-full bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Header & Filters */}
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Notification Center</h1>
              <p className="text-sm text-slate-500 mt-1">Stay updated on your career progress and tasks</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleMarkAllRead}
                className="px-4 py-2 bg-[#00a878]/10 text-[#006c4c] hover:bg-[#00a878]/20 font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                Mark All Read
              </button>
              <button 
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                Clear All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-xl">
            <div className="flex-1 min-w-[200px] relative">
              <input 
                type="text" 
                placeholder="Search notifications..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00a878] text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            </div>
            
            <div className="flex gap-2 min-w-max">
              <select 
                value={filterModule} 
                onChange={(e) => setFilterModule(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a878] bg-white cursor-pointer"
              >
                {modules.map(m => (
                  <option key={m} value={m}>{m === 'ALL' ? 'All Modules' : m.charAt(0) + m.slice(1).toLowerCase()}</option>
                ))}
              </select>

              <select 
                value={filterRead} 
                onChange={(e) => setFilterRead(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a878] bg-white cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="UNREAD">Unread Only</option>
                <option value="READ">Read Only</option>
              </select>

              {(filterModule !== 'ALL' || filterRead !== 'ALL' || search) && (
                <button 
                  onClick={clearFilters}
                  className="px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-[#00a878]/30 border-t-[#00a878] rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">notifications_paused</span>
              <p className="text-lg font-medium text-slate-500">No notifications found</p>
              <p className="text-sm">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {['Today', 'Yesterday', 'Last 7 Days', 'Older'].map((group) => {
                if (grouped[group].length === 0) return null;
                return (
                  <div key={group} className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2">{group}</h3>
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                      {grouped[group].map((n, idx) => (
                        <div 
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id, n.actionUrl)}
                          className={`flex items-start gap-4 p-4 transition-all cursor-pointer group
                            ${!n.isRead ? 'bg-[#00a878]/5 hover:bg-[#00a878]/10' : 'hover:bg-slate-50'}
                            ${idx !== grouped[group].length - 1 ? 'border-b border-slate-50' : ''}
                          `}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${getColorForPriority(n.priority)}`}>
                            <span className="material-symbols-outlined text-[20px]">{getIconForModule(n.module)}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className={`text-[15px] font-bold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                {n.title}
                              </h4>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-xs font-medium ${!n.isRead ? 'text-[#00a878]' : 'text-slate-400'}`}>
                                  {formatRelativeTime(new Date(n.createdAt))}
                                </span>
                                <button 
                                  onClick={(e) => handleDelete(n.id, e)}
                                  className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete notification"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </div>
                            <p className={`text-sm ${!n.isRead ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                              {n.message}
                            </p>
                            {!n.isRead && (
                              <div className="mt-3">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006c4c] bg-[#00a878]/10 px-2 py-1 rounded-md">
                                  New
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <span className="text-sm text-slate-500 font-medium">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors
                    ${page === i + 1 ? 'bg-[#00a878] text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
