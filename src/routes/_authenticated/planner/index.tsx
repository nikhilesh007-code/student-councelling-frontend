import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/planner/')({
  component: StudyPlannerPage,
})

const MOCK_STUDY_PLANNER_DATA = {
  productivity: {
    studyHours: 24.5,
    streak: 12,
    completionRate: 88
  },
  todaysSchedule: [
    { id: 1, title: 'Complete React Context API module', duration: '90 mins', priority: 'High', status: 'In Progress' },
    { id: 2, title: 'Practice DP coding problems', duration: '60 mins', priority: 'High', status: 'Pending' },
    { id: 3, title: 'Review System Design notes', duration: '45 mins', priority: 'Medium', status: 'Completed' }
  ],
  weeklyPlanner: [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 3 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 2 },
    { day: 'Fri', hours: 4 },
    { day: 'Sat', hours: 6 },
    { day: 'Sun', hours: 1.5 }
  ],
  upcomingTasks: [
    { id: 1, title: 'Submit Portfolio Project', dueDate: 'Tomorrow', priority: 'High', progress: 80 },
    { id: 2, title: 'Take Mock Aptitude Test', dueDate: 'Oct 25', priority: 'Medium', progress: 0 },
    { id: 3, title: 'Finish AWS Cloud Practitioner course', dueDate: 'Oct 28', priority: 'Low', progress: 45 }
  ],
  learningGoals: {
    daily: { target: 3, current: 2 },
    weekly: { target: 15, current: 8 },
    monthly: { target: 60, current: 24 }
  },
  roadmapIntegration: {
    currentMilestone: 'Advanced React Patterns',
    suggestedTasks: ['Implement a custom hook', 'Read docs on React.memo']
  },
  skillPlan: [
    { skill: 'React', estCompletion: 'Oct 30', progress: 85 },
    { skill: 'Node.js', estCompletion: 'Nov 15', progress: 40 },
    { skill: 'System Design', estCompletion: 'Dec 01', progress: 20 }
  ],
  aiRecommendations: [
    'Your productivity peaks at 10 AM. Try scheduling high-priority coding tasks then.',
    'You are ahead of schedule on React! Consider starting Node.js early.',
    'Take a mock test this weekend to gauge your aptitude readiness.'
  ],
  calendar: {
    month: 'October 2025',
    days: [
      { date: 20, active: false, hasTask: true },
      { date: 21, active: false, hasTask: true },
      { date: 22, active: true, hasTask: true },
      { date: 23, active: false, hasTask: true },
      { date: 24, active: false, hasTask: false },
      { date: 25, active: false, hasTask: true },
      { date: 26, active: false, hasTask: false }
    ]
  }
}

function StudyPlannerPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading your study plan...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
       <DashboardLayout>
         <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">error</span>
           </div>
           <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load</h3>
           <p className="text-slate-500 mb-6">{error}</p>
           <button onClick={() => window.location.reload()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
         </div>
       </DashboardLayout>
    )
  }

  const maxWeeklyHours = Math.max(...MOCK_STUDY_PLANNER_DATA.weeklyPlanner.map(d => d.hours))

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Study Planner <span className="material-symbols-outlined text-[#00a878]">calendar_today</span>
            </h2>
            <p className="text-[14px] text-slate-500">Organize your learning schedule, track tasks, and hit your milestones faster.</p>
          </div>
          <button className="bg-[#00a878] text-white px-6 py-3 rounded-xl text-[13px] font-extrabold hover:bg-[#008b63] transition-colors shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[18px]">add_task</span> Create Plan
          </button>
        </div>

        {/* Productivity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 min-w-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Study Hours</p>
              <p className="text-[20px] font-black text-slate-900">{MOCK_STUDY_PLANNER_DATA.productivity.studyHours}h</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Current Streak</p>
              <p className="text-[20px] font-black text-slate-900">{MOCK_STUDY_PLANNER_DATA.productivity.streak} Days</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00a878] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Completion Rate</p>
              <p className="text-[20px] font-black text-slate-900">{MOCK_STUDY_PLANNER_DATA.productivity.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500">today</span> Today's Schedule
                </h3>
              </div>
              <div className="space-y-3">
                {MOCK_STUDY_PLANNER_DATA.todaysSchedule.map((task) => (
                  <div key={task.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0 group">
                    <div className="flex items-start gap-3 min-w-0">
                      <button className={`mt-0.5 shrink-0 material-symbols-outlined text-[22px] transition-colors
                        ${task.status === 'Completed' ? 'text-[#00a878]' : 'text-slate-300 group-hover:text-[#00a878]'}`}
                        style={{ fontVariationSettings: task.status === 'Completed' ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        check_circle
                      </button>
                      <div className="min-w-0">
                        <h4 className={`text-[14px] font-extrabold truncate ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> {task.duration}
                          </span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase
                            ${task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center sm:block">
                      <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md border
                        ${task.status === 'Completed' ? 'bg-emerald-50 text-[#00a878] border-emerald-100' : 
                          task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Planner Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">date_range</span> Weekly Planner
              </h3>
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-slate-100 pb-2 px-2">
                {MOCK_STUDY_PLANNER_DATA.weeklyPlanner.map((day, idx) => {
                  const heightPercent = (day.hours / maxWeeklyHours) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-full max-w-[40px] bg-blue-50 rounded-t-md relative flex items-end justify-center group-hover:bg-blue-100 transition-colors" style={{ height: '100%' }}>
                        <div 
                          className="w-full max-w-[40px] bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600"
                          style={{ height: `${heightPercent}%` }}
                        >
                           <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded transition-opacity whitespace-nowrap">
                             {day.hours}h
                           </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">{day.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Split Grid: Roadmap & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              
              {/* Roadmap Integration */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex flex-col">
                <h3 className="text-[16px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00a878]">map</span> Current Milestone
                </h3>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-4">
                  <p className="text-[13px] font-extrabold text-[#00a878] mb-1">{MOCK_STUDY_PLANNER_DATA.roadmapIntegration.currentMilestone}</p>
                </div>
                <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-3">Suggested Tasks</h4>
                <div className="space-y-3 flex-1">
                  {MOCK_STUDY_PLANNER_DATA.roadmapIntegration.suggestedTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                      <span className="material-symbols-outlined text-[18px] text-slate-300">radio_button_unchecked</span>
                      {task}
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-[12px] font-extrabold text-[#00a878] hover:underline flex items-center justify-center gap-1 w-full pt-3 border-t border-slate-100">
                  View Full Roadmap <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              {/* Skill Plan */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex flex-col">
                <h3 className="text-[16px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">analytics</span> Skill Development
                </h3>
                <div className="space-y-5 flex-1">
                  {MOCK_STUDY_PLANNER_DATA.skillPlan.map((skill, idx) => (
                    <div key={idx} className="min-w-0">
                      <div className="flex justify-between items-center text-[12px] font-bold mb-1">
                        <span className="text-slate-800 truncate">{skill.skill}</span>
                        <span className="text-purple-600">{skill.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${skill.progress}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400">Est. {skill.estCompletion}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* Calendar Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-extrabold text-slate-900">{MOCK_STUDY_PLANNER_DATA.calendar.month}</h3>
                <div className="flex gap-2">
                  <button className="text-slate-400 hover:text-slate-700"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                  <button className="text-slate-400 hover:text-slate-700"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div key={idx} className="text-[10px] font-bold text-slate-400">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {MOCK_STUDY_PLANNER_DATA.calendar.days.map((day, idx) => (
                  <div key={idx} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-[12px] font-bold cursor-pointer transition-colors relative
                    ${day.active ? 'bg-[#00a878] text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'}`}>
                    {day.date}
                    {day.hasTask && !day.active && (
                      <span className="w-1 h-1 rounded-full bg-amber-500 absolute bottom-1"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-500">flag</span> Learning Goals
              </h3>
              <div className="space-y-4">
                <div className="min-w-0">
                  <div className="flex justify-between text-[12px] font-bold mb-1">
                    <span className="text-slate-600">Daily Goal (Hours)</span>
                    <span className="text-amber-600">{MOCK_STUDY_PLANNER_DATA.learningGoals.daily.current} / {MOCK_STUDY_PLANNER_DATA.learningGoals.daily.target}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(MOCK_STUDY_PLANNER_DATA.learningGoals.daily.current / MOCK_STUDY_PLANNER_DATA.learningGoals.daily.target) * 100}%` }}></div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between text-[12px] font-bold mb-1">
                    <span className="text-slate-600">Weekly Goal (Hours)</span>
                    <span className="text-amber-600">{MOCK_STUDY_PLANNER_DATA.learningGoals.weekly.current} / {MOCK_STUDY_PLANNER_DATA.learningGoals.weekly.target}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(MOCK_STUDY_PLANNER_DATA.learningGoals.weekly.current / MOCK_STUDY_PLANNER_DATA.learningGoals.weekly.target) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">upcoming</span> Upcoming
                </h3>
                <a className="text-[12px] font-bold text-[#00a878] hover:underline" href="#">View All</a>
              </div>
              <div className="space-y-4">
                {MOCK_STUDY_PLANNER_DATA.upcomingTasks.map(task => (
                  <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <h4 className="text-[13px] font-extrabold text-slate-900 mb-1 leading-snug">{task.title}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-red-500">Due {task.dueDate}</span>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">{task.progress}% Done</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-emerald-50/50 rounded-2xl p-6 shadow-sm border border-emerald-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> 
                Smart Schedule
              </h3>
              <ul className="space-y-4">
                {MOCK_STUDY_PLANNER_DATA.aiRecommendations.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00a878] mt-1.5 shrink-0"></div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-0">
              <h3 className="text-[13px] font-extrabold text-slate-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[11px] font-bold hover:border-[#00a878] hover:text-[#00a878] transition-colors text-center flex flex-col items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">add</span> Add Task
                </button>
                <button className="bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[11px] font-bold hover:border-[#00a878] hover:text-[#00a878] transition-colors text-center flex flex-col items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span> Start Session
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
