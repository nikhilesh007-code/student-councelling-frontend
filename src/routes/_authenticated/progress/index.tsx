import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/progress/')({
  component: ProgressTrackingPage,
})

const MOCK_PROGRESS_DATA = {
  overall: [
    { label: 'Profile Completion', value: 100, color: 'bg-blue-500', icon: 'person' },
    { label: 'Career Readiness', value: 85, color: 'bg-[#00a878]', icon: 'target' },
    { label: 'Placement Readiness', value: 78, color: 'bg-purple-500', icon: 'school' },
    { label: 'Learning Progress', value: 60, color: 'bg-amber-500', icon: 'menu_book' }
  ],
  skills: {
    learned: ['React', 'TypeScript', 'Node.js', 'Tailwind', 'Git'],
    inProgress: ['Next.js', 'PostgreSQL', 'GraphQL'],
    missing: ['Docker', 'AWS', 'System Design']
  },
  roadmap: {
    completed: 5,
    total: 12,
    currentMilestone: 'Advanced React Patterns',
    upcomingMilestones: ['Full Stack Integration', 'Cloud Deployment Basics']
  },
  learning: {
    coursesCompleted: 3,
    hoursLearned: 45,
    certificationsEarned: 2
  },
  careerDevelopment: [
    { metric: 'Resume Score', current: 82, trend: '+15%', isPositive: true },
    { metric: 'Skill Gap', current: '15%', trend: '-10%', isPositive: true },
    { metric: 'Career Match', current: '85%', trend: '+5%', isPositive: true }
  ],
  applications: {
    applied: 12,
    interviews: 3,
    offers: 1
  },
  weeklyActivity: [
    { day: 'Mon', hours: 2 },
    { day: 'Tue', hours: 3.5 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4 },
    { day: 'Fri', hours: 2.5 },
    { day: 'Sat', hours: 5 },
    { day: 'Sun', hours: 1 }
  ],
  achievements: [
    { title: 'Profile Completed', icon: 'verified_user', color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'First Milestone', icon: 'flag', color: 'text-[#00a878]', bg: 'bg-emerald-50' },
    { title: 'Resume Uploaded', icon: 'description', color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'First Application', icon: 'work', color: 'text-amber-500', bg: 'bg-amber-50' }
  ],
  insights: [
    "You're making excellent progress! Your Career Readiness is up by 5% this month.",
    "You have 3 missing skills for your target role. Consider prioritizing the 'Docker' course.",
    "Your resume is scoring well, but your 'System Design' section could use more keywords."
  ]
}

function ProgressTrackingPage() {
  const context = useRouteContext({ strict: false }) as any;
  const completionPercentage = context?.completionPercentage || 0;

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading your progress...</p>
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

  const maxHours = Math.max(...MOCK_PROGRESS_DATA.weeklyActivity.map(d => d.hours))

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
            Progress Tracking <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
          </h2>
          <p className="text-[14px] text-slate-500">A unified view of your learning, skills, career readiness, and applications.</p>
        </div>

        {/* Overall Progress Dashboard (Top Row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 min-w-0">
          {MOCK_PROGRESS_DATA.overall.map((metric, idx) => {
            const actualValue = metric.label === 'Profile Completion' ? completionPercentage : metric.value;
            return (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${metric.color}`}>
                  <span className="material-symbols-outlined">{metric.icon}</span>
                </div>
                <span className="text-[18px] font-black text-slate-900">{actualValue}%</span>
              </div>
              <h3 className="text-[13px] font-extrabold text-slate-600 truncate">{metric.label}</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div className={`h-full ${metric.color}`} style={{ width: `${actualValue}%` }}></div>
              </div>
            </div>
          )})}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
              
              {/* Learning Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex flex-col justify-center items-center text-center">
                <span className="material-symbols-outlined text-[32px] text-amber-500 mb-2">local_library</span>
                <h4 className="text-[14px] font-extrabold text-slate-900 mb-1">Learning Activity</h4>
                <p className="text-[12px] font-medium text-slate-500 mb-4">{MOCK_PROGRESS_DATA.learning.hoursLearned} Hrs Total</p>
                <div className="flex gap-4 w-full justify-center">
                  <div className="text-center">
                    <p className="text-[18px] font-black text-slate-800">{MOCK_PROGRESS_DATA.learning.coursesCompleted}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Courses</p>
                  </div>
                  <div className="w-px bg-slate-200"></div>
                  <div className="text-center">
                    <p className="text-[18px] font-black text-slate-800">{MOCK_PROGRESS_DATA.learning.certificationsEarned}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Certs</p>
                  </div>
                </div>
              </div>

              {/* Roadmap Progress */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 md:col-span-2">
                <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#00a878]">map</span> Roadmap Progress
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center shrink-0">
                    <p className="text-[24px] font-black text-[#00a878]">{MOCK_PROGRESS_DATA.roadmap.completed}<span className="text-[14px] text-slate-400">/{MOCK_PROGRESS_DATA.roadmap.total}</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Milestones</p>
                  </div>
                  <div className="min-w-0 flex-1 border-l pl-4 border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Current Milestone</p>
                    <p className="text-[14px] font-extrabold text-slate-800 truncate">{MOCK_PROGRESS_DATA.roadmap.currentMilestone}</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00a878]" style={{ width: `${(MOCK_PROGRESS_DATA.roadmap.completed / MOCK_PROGRESS_DATA.roadmap.total) * 100}%` }}></div>
                </div>
              </div>

            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">bar_chart</span> Weekly Activity
              </h3>
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-slate-100 pb-2 px-2">
                {MOCK_PROGRESS_DATA.weeklyActivity.map((day, idx) => {
                  const heightPercent = (day.hours / maxHours) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-full max-w-[40px] bg-indigo-50 rounded-t-md relative flex items-end justify-center group-hover:bg-indigo-100 transition-colors" style={{ height: '100%' }}>
                        <div 
                          className="w-full max-w-[40px] bg-indigo-500 rounded-t-md transition-all duration-500 group-hover:bg-indigo-600"
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

            {/* Skills & Applications Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              
              {/* Skill Progress */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
                <h3 className="text-[16px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">psychology</span> Skill Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Learned ({MOCK_PROGRESS_DATA.skills.learned.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_PROGRESS_DATA.skills.learned.slice(0, 5).map(skill => (
                        <span key={skill} className="bg-emerald-50 text-[#00a878] border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-extrabold">{skill}</span>
                      ))}
                      {MOCK_PROGRESS_DATA.skills.learned.length > 5 && <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5">+{MOCK_PROGRESS_DATA.skills.learned.length - 5}</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">In Progress ({MOCK_PROGRESS_DATA.skills.inProgress.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_PROGRESS_DATA.skills.inProgress.map(skill => (
                        <span key={skill} className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-extrabold">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Missing ({MOCK_PROGRESS_DATA.skills.missing.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_PROGRESS_DATA.skills.missing.map(skill => (
                        <span key={skill} className="bg-amber-50 text-amber-600 border border-amber-100 border-dashed px-2 py-0.5 rounded text-[10px] font-extrabold">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications Progress */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex flex-col">
                <h3 className="text-[16px] font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">work</span> Applications
                </h3>
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Applied</span>
                    </div>
                    <span className="text-[16px] font-black text-slate-900">{MOCK_PROGRESS_DATA.applications.applied}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                        <span className="material-symbols-outlined text-[18px]">forum</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Interviews</span>
                    </div>
                    <span className="text-[16px] font-black text-slate-900">{MOCK_PROGRESS_DATA.applications.interviews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#00a878] border border-emerald-100">
                        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Offers</span>
                    </div>
                    <span className="text-[16px] font-black text-slate-900">{MOCK_PROGRESS_DATA.applications.offers}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* Career Development Progress */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 text-white min-w-0">
              <h3 className="text-[16px] font-extrabold flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#00a878]">rocket_launch</span> Career Trends
              </h3>
              <div className="space-y-5">
                {MOCK_PROGRESS_DATA.careerDevelopment.map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                    <span className="text-[13px] font-bold text-slate-300">{metric.metric}</span>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-[15px] font-black text-white">{metric.current}</span>
                      <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5
                        ${metric.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        <span className="material-symbols-outlined text-[12px]">{metric.isPositive ? 'trending_up' : 'trending_down'}</span>
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-emerald-50/50 rounded-2xl p-6 shadow-sm border border-emerald-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> 
                Progress Insights
              </h3>
              <ul className="space-y-4">
                {MOCK_PROGRESS_DATA.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00a878] mt-1.5 shrink-0"></div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements & Badges */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span> Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3 min-w-0">
                {MOCK_PROGRESS_DATA.achievements.map((badge, idx) => (
                  <div key={idx} className={`${badge.bg} border border-slate-100/50 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 hover:shadow-sm transition-shadow`}>
                    <span className={`material-symbols-outlined text-[28px] ${badge.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{badge.icon}</span>
                    <span className="text-[10px] font-extrabold text-slate-700 leading-tight">{badge.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-0">
              <h3 className="text-[13px] font-extrabold text-slate-900 mb-3">Next Steps</h3>
              <div className="space-y-2">
                <button className="w-full bg-white border border-slate-200 text-slate-700 p-3 rounded-xl text-[12px] font-extrabold hover:border-[#00a878] hover:text-[#00a878] transition-colors flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">play_circle</span> Continue Learning
                </button>
                <button className="w-full bg-white border border-slate-200 text-slate-700 p-3 rounded-xl text-[12px] font-extrabold hover:border-[#00a878] hover:text-[#00a878] transition-colors flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">map</span> View Roadmap
                </button>
                <button className="w-full bg-white border border-slate-200 text-slate-700 p-3 rounded-xl text-[12px] font-extrabold hover:border-[#00a878] hover:text-[#00a878] transition-colors flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">school</span> Practice Placement Prep
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
