import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { studyPlannerApi } from '../../../lib/study-planner-api'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, format, addMonths, subMonths, setMonth, setYear } from 'date-fns'
import { toast } from 'sonner'

const toLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const Route = createFileRoute('/_authenticated/planner/')({
  component: StudyPlannerPage,
})

function StudyPlannerPage() {
  const context = useRouteContext({ strict: false }) as any;
  const userId = context?.sessionUser?.id;
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activePlan, setActivePlan] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false);
  const [pendingGenerateArgs, setPendingGenerateArgs] = useState<{e?: any, isDaily: boolean, isWeekly: boolean} | null>(null);

  const [successPlan, setSuccessPlan] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Calendar Navigation State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [prefs, setPrefs] = useState({
    planType: 'Weekly',
    startDate: toLocalDateString(new Date()),
    hoursPerDay: 2,
    preferredStartTime: '09:00',
    studyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    difficulty: 'Intermediate',
    focusArea: 'General'
  });

  const fetchData = async () => {
    try {
      if (!userId) return;
      const [tasksRes, statsRes] = await Promise.all([
        studyPlannerApi.getTasks(userId),
        studyPlannerApi.getStatistics(userId)
      ]);
      setActivePlan(tasksRes.tasks?.plan || null);
      setTasks(tasksRes.tasks?.tasks || []);
      setStats(statsRes.stats || {
        studyHours: 0, completedTasks: 0, completionRate: 0, todayRemaining: 0
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load planner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const initiateGenerate = (e?: React.FormEvent, isDailyMode = false, isWeeklyMode = false) => {
    if (e) e.preventDefault();
    if (activePlan) {
      setPendingGenerateArgs({ e, isDaily: isDailyMode, isWeekly: isWeeklyMode });
      setShowRegeneratePrompt(true);
    } else {
      handleGenerate(e, isDailyMode, isWeeklyMode, false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent, isDailyMode = false, isWeeklyMode = false, replaceExisting = false) => {
    if (e) e.preventDefault();
    setGenerating(true);
    setShowCreateModal(false);
    setShowRegeneratePrompt(false);

    let submitPrefs = { ...prefs, replaceExisting };
    if (isDailyMode) submitPrefs.planType = 'Daily';
    if (isWeeklyMode) submitPrefs.planType = 'Weekly';

    try {
      if (!userId) return;
      const res = await studyPlannerApi.generatePlan(userId, submitPrefs);
      
      const newTasks = res.tasks?.tasks || [];
      const totalMinutes = newTasks.reduce((acc: number, t: any) => acc + (t.estimatedMinutes || 0), 0);

      setSuccessPlan({
        planType: submitPrefs.planType,
        taskCount: newTasks.length,
        hours: (totalMinutes / 60).toFixed(1),
        startDate: submitPrefs.startDate,
        startTime: submitPrefs.preferredStartTime,
        focusArea: submitPrefs.focusArea
      });

      await fetchData();
    } catch (e: any) {
      setError(e.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!userId || !activePlan) return;
    try {
      await studyPlannerApi.archivePlan(userId, activePlan.id);
      setShowDeleteModal(false);
      toast.success('Study plan archived successfully');
      setSelectedDate(null);
      await fetchData();
    } catch (e: any) {
      setError(e.message || 'Failed to delete plan');
    }
  };

  const getDaysArray = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({
      start: startDate,
      end: endDate
    });
  };

  const calendarDays = getDaysArray();
  
  let filteredTasks = selectedDate 
    ? tasks.filter(t => toLocalDateString(new Date(t.scheduledAt)) === selectedDate)
    : tasks;

  if (debouncedSearch.trim()) {
    const q = debouncedSearch.trim().toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
      t.title?.toLowerCase().includes(q) ||
      t.skill?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  }

  const handleAction = async (taskId: string, action: string) => {
    try {
      let status = 'PENDING';
      if (action === 'Complete') status = 'COMPLETED';
      if (action === 'Start' || action === 'Resume') status = 'IN_PROGRESS';
      if (action === 'Pause') status = 'PENDING';
      if (action === 'Skip') status = 'SKIPPED';
      
      if (action !== 'Reschedule') {
        if (!userId) return;
        await studyPlannerApi.updateTaskStatus(userId, taskId, status);
        fetchData(); // refresh
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calendar Controls Helpers
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(toLocalDateString(now));
  };
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 8}, (_, i) => currentYear - 2 + i);
  const monthOptions = Array.from({length: 12}, (_, i) => {
    const d = new Date();
    d.setMonth(i);
    return format(d, 'MMMM');
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-[#00a878]/30 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading your study plan...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      searchPlaceholder="Search study modules..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10 relative">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Study Planner <span className="material-symbols-outlined text-[#00a878]">calendar_today</span>
            </h2>
            <p className="text-[14px] text-slate-500">Organize your learning schedule with AI-generated actionable tasks.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            {!activePlan ? (
              <>
                <button 
                  onClick={() => initiateGenerate()}
                  disabled={generating}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-[13px] font-bold hover:border-[#00a878] hover:text-[#00a878] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span> Quick Generate
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  disabled={generating}
                  className="bg-[#00a878] text-white px-5 py-2.5 rounded-xl text-[13px] font-extrabold hover:bg-[#008b63] transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Create Plan
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={generating}
                  className="bg-white border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span> Delete Plan
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  disabled={generating}
                  className="bg-[#00a878] text-white px-5 py-2.5 rounded-xl text-[13px] font-extrabold hover:bg-[#008b63] transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">sync</span> Regenerate Plan
                </button>
              </>
            )}
          </div>
        </div>

        {generating && (
          <div className="mb-8 bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined animate-spin">sync</span>
            <span className="text-sm font-bold">AI is generating your highly personalized study plan...</span>
          </div>
        )}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-bold">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="material-symbols-outlined text-sm hover:text-red-800">close</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Study Hours</p>
              <p className="text-[20px] font-black text-slate-900">{stats?.studyHours || 0}h</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Completed Tasks</p>
              <p className="text-[20px] font-black text-slate-900">{stats?.completedTasks || 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00a878] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Completion Rate</p>
              <p className="text-[20px] font-black text-slate-900">{stats?.completionRate || 0}%</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">target</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Today Remaining</p>
              <p className="text-[20px] font-black text-slate-900">{stats?.todayRemaining || 0}</p>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* Left Column: Tasks List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 min-w-0">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">list_alt</span> Study Schedule
            </h3>
          </div>
          <div className="p-6">
            {!activePlan || tasks.length === 0 ? (
              <div className="text-center py-12 px-4">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">event_note</span>
                <h4 className="text-lg font-bold text-slate-700 mb-2">No Study Plan Active</h4>
                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Generate a Daily Plan for today's learning goals or a Weekly Plan for a complete 7-day schedule.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button 
                    onClick={() => initiateGenerate(undefined, true, false)}
                    className="bg-white border border-[#00a878] text-[#00a878] px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-50 transition-colors"
                  >
                    Generate Daily Plan
                  </button>
                  <button 
                    onClick={() => initiateGenerate(undefined, false, true)}
                    className="bg-[#00a878] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#008b63] transition-colors"
                  >
                    Generate Weekly Plan
                  </button>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              debouncedSearch.trim() ? (
                <div className="text-center py-12 px-4">
                  <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">search_off</span>
                  <h4 className="text-md font-bold text-slate-700 mb-2">No matching study modules found.</h4>
                  <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Try adjusting your search terms or clearing the filter.</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">free_cancellation</span>
                  <h4 className="text-md font-bold text-slate-700 mb-2">No tasks scheduled for this day</h4>
                  <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Select a different date from the calendar to view your schedule.</p>
                  <button 
                    onClick={() => setSelectedDate(null)}
                    className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    View All Tasks
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {filteredTasks.map(task => {
                  const dateObj = new Date(task.scheduledAt);
                  const isCompleted = task.status === 'COMPLETED';
                  const isSkipped = task.status === 'SKIPPED';
                  const isMissed = task.status === 'MISSED';
                  
                  return (
                    <div key={task.id} className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all
                      ${isCompleted ? 'bg-slate-50/50 border-slate-200 opacity-70' : 
                        isMissed ? 'bg-red-50/30 border-red-100' :
                        isSkipped ? 'bg-slate-100 border-slate-200 opacity-50' :
                        'bg-white border-slate-200 hover:border-[#00a878]/30 shadow-sm'}`}>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                            ${task.priority === 'URGENT' || task.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 
                              task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                            {task.priority}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                            ${task.status === 'COMPLETED' ? 'bg-emerald-50 text-[#00a878]' : 
                              task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' : 
                              task.status === 'MISSED' ? 'bg-red-50 text-red-600' :
                              'bg-slate-100 text-slate-600'}`}>
                            {task.status}
                          </span>
                        </div>
                        <h4 className={`text-[15px] font-extrabold mb-1 truncate ${isCompleted || isSkipped ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </h4>
                        <p className="text-[13px] text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-[12px] font-medium text-slate-500">
                          <span>{dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({task.estimatedMinutes}m)</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-2 flex-wrap">
                        {!isCompleted && !isSkipped && task.status !== 'IN_PROGRESS' && (
                           <button onClick={() => handleAction(task.id, 'Start')} className="bg-[#00a878] text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:bg-[#008b63] flex items-center gap-1 shadow-sm">
                             <span className="material-symbols-outlined text-[16px]">play_arrow</span> Start
                           </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                           <>
                             <button onClick={() => handleAction(task.id, 'Complete')} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-sm">
                               <span className="material-symbols-outlined text-[16px]">check</span> Finish
                             </button>
                             <button onClick={() => handleAction(task.id, 'Pause')} className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:bg-amber-600 flex items-center gap-1 shadow-sm">
                               <span className="material-symbols-outlined text-[16px]">pause</span> Pause
                             </button>
                           </>
                        )}
                        {!isCompleted && (
                           <button onClick={() => handleAction(task.id, 'Skip')} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-slate-50 flex items-center gap-1">
                             Skip
                           </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calendar Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-24">
            
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00a878] text-[18px]">calendar_month</span> Schedule
                </h3>
                <button onClick={handleToday} className="text-[11px] font-bold text-slate-500 hover:text-[#00a878] border border-slate-200 px-2 py-1 rounded-md transition-colors">
                  Today
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button onClick={handlePrevMonth} className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                
                <div className="flex items-center gap-1">
                  <select 
                    value={currentMonth.getMonth()} 
                    onChange={e => setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)))}
                    className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer appearance-none px-1"
                  >
                    {monthOptions.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                  <select 
                    value={currentMonth.getFullYear()} 
                    onChange={e => setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)))}
                    className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer appearance-none px-1"
                  >
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <button onClick={handleNextMonth} className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S','M','T','W','T','F','S'].map((day, i) => (
                <div key={i} className="text-[10px] font-bold text-slate-400">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d, i) => {
                const dateStr = toLocalDateString(d);
                const isToday = toLocalDateString(new Date()) === dateStr;
                const isSelected = selectedDate === dateStr;
                const hasTasks = tasks.some(t => toLocalDateString(new Date(t.scheduledAt)) === dateStr);
                const isCurrentMonth = isSameMonth(d, currentMonth);
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium relative transition-all
                      ${isSelected ? 'bg-[#00a878] text-white shadow-sm' : 
                        isToday ? 'bg-emerald-50 text-[#00a878] font-bold border border-emerald-200' : 
                        !isCurrentMonth ? 'text-slate-300 hover:bg-slate-50' :
                        'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {d.getDate()}
                    {hasTasks && (
                      <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-white' : 'bg-[#00a878]'}`}></span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedDate && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Viewing: {new Date(selectedDate).toLocaleDateString()}</span>
                <button onClick={() => setSelectedDate(null)} className="text-[10px] font-bold text-[#00a878] hover:underline">Clear Filter</button>
              </div>
            )}
          </div>
        </div>

        </div>

        {/* Regenerate Prompt Modal */}
        {showRegeneratePrompt && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 p-6">
              <h3 className="font-extrabold text-lg text-slate-900 mb-2">A study plan already exists</h3>
              <p className="text-sm text-slate-600 mb-6">Generating a new plan can either replace your current active plan or keep both active concurrently.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleGenerate(pendingGenerateArgs?.e, pendingGenerateArgs?.isDaily, pendingGenerateArgs?.isWeekly, true)}
                  className="bg-[#00a878] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#008b63] transition-colors"
                >
                  Replace current plan
                </button>
                <button 
                  onClick={() => handleGenerate(pendingGenerateArgs?.e, pendingGenerateArgs?.isDaily, pendingGenerateArgs?.isWeekly, false)}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Keep current plan
                </button>
                <button 
                  onClick={() => setShowRegeneratePrompt(false)}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 mt-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 p-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-2">Delete your AI Study Plan?</h3>
              <p className="text-sm text-slate-600 mb-6">
                This will archive all scheduled study tasks and remove pending notifications. Completed statistics will be preserved for analytics.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900">
                  Cancel
                </button>
                <button onClick={handleDeletePlan} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Plan Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00a878]">auto_awesome</span> Create AI Study Plan
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={e => initiateGenerate(e)} className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Plan Type</label>
                    <select value={prefs.planType} onChange={e => setPrefs({...prefs, planType: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a878] text-sm bg-white">
                      <option value="Weekly">Weekly Plan</option>
                      <option value="Daily">Daily Plan</option>
                    </select>
                  </div>
                  {prefs.planType === 'Weekly' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                      <input type="date" value={prefs.startDate} onChange={e => setPrefs({...prefs, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a878] text-sm bg-white" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Study Hours per Day</label>
                    <input type="number" min="1" max="12" value={prefs.hoursPerDay} onChange={e => setPrefs({...prefs, hoursPerDay: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a878] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Preferred Start Time</label>
                    <input type="time" value={prefs.preferredStartTime} onChange={e => setPrefs({...prefs, preferredStartTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a878] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Difficulty Level</label>
                    <select value={prefs.difficulty} onChange={e => setPrefs({...prefs, difficulty: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a878] text-sm bg-white">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Focus Area</label>
                    <select value={prefs.focusArea} onChange={e => setPrefs({...prefs, focusArea: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a878] text-sm bg-white">
                      <option>General Balance</option>
                      <option>Heavy on Missing Skills</option>
                      <option>Interview Preparation</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#00a878] text-white px-6 py-2 rounded-xl text-sm font-extrabold hover:bg-[#008b63] transition-colors shadow-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">magic_button</span> Generate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successPlan && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 p-6 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-[#00a878] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-1">AI Study Plan Created</h3>
              <p className="text-sm font-bold text-slate-500 mb-6 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">task_alt</span> {successPlan.planType} Plan
              </p>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-3">
                 <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Tasks Generated:</span>
                    <span className="text-sm font-bold text-slate-800">{successPlan.taskCount}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Estimated Study Hours:</span>
                    <span className="text-sm font-bold text-slate-800">{successPlan.hours} hours</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Starts:</span>
                    <span className="text-sm font-bold text-slate-800">{successPlan.startDate} {successPlan.startTime}</span>
                 </div>
                 <div>
                    <span className="text-sm text-slate-500 block mb-1">Focus Area:</span>
                    <span className="text-sm font-bold text-slate-800 block">• {successPlan.focusArea}</span>
                 </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSuccessPlan(null)} className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                  Close
                </button>
                <button onClick={() => setSuccessPlan(null)} className="flex-1 bg-[#00a878] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#008b63] transition-colors shadow-sm">
                  View Plan
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
