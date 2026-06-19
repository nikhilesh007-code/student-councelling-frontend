import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/placement/')({
  component: PlacementPage,
})

const MOCK_PLACEMENT_DATA = {
  readinessScore: 78,
  readinessLabel: 'Interview Ready',
  tracks: [
    { id: 'aptitude', name: 'Aptitude Prep', progress: 85, total: 100, icon: 'calculate', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'coding', name: 'Coding Prep', progress: 65, total: 100, icon: 'code', color: 'text-[#00a878]', bg: 'bg-emerald-50' },
    { id: 'tech', name: 'Tech Interview', progress: 40, total: 100, icon: 'terminal', color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'hr', name: 'HR Interview', progress: 90, total: 100, icon: 'handshake', color: 'text-amber-500', bg: 'bg-amber-50' }
  ],
  companies: [
    { id: 1, name: 'Google', role: 'Software Engineer', logo: 'google', color: 'text-[#4285F4]', match: '82%', difficulty: 'Hard' },
    { id: 2, name: 'Amazon', role: 'SDE-1', logo: 'shopping_cart', color: 'text-[#FF9900]', match: '88%', difficulty: 'Medium-Hard' },
    { id: 3, name: 'Microsoft', role: 'Frontend Dev', logo: 'window', color: 'text-[#00A4EF]', match: '94%', difficulty: 'Medium' }
  ],
  mockTests: [
    { id: 1, title: 'TCS NQT Full Mock Test', duration: '180 mins', type: 'Aptitude + Coding', difficulty: 'Medium' },
    { id: 2, title: 'Data Structures Sprint', duration: '90 mins', type: 'Coding', difficulty: 'Hard' },
    { id: 3, title: 'Behavioral Questions', duration: '45 mins', type: 'HR', difficulty: 'Easy' }
  ],
  recentPerformance: [
    { topic: 'Quantitative Aptitude', score: 85 },
    { topic: 'Dynamic Programming', score: 45 },
    { topic: 'OS & DBMS', score: 70 },
    { topic: 'Verbal Reasoning', score: 92 }
  ],
  recommendedTopics: [
    { topic: 'Dynamic Programming', priority: 'High', type: 'Coding' },
    { topic: 'System Design Basics', priority: 'Medium', type: 'Tech' },
    { topic: 'Logical Reasoning', priority: 'Low', type: 'Aptitude' }
  ],
  insights: [
    'Your aptitude scores are in the top 10% of users.',
    'You are struggling with Dynamic Programming. We suggest taking the DP crash course.',
    'Your profile is highly aligned with Microsoft Frontend Dev roles. Focus on React system design.'
  ]
}

function PlacementPage() {
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
           <p className="mt-4 text-slate-500 font-medium">Loading your preparation dashboard...</p>
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

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
            Placement Preparation <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </h2>
          <p className="text-[14px] text-slate-500">Track your progress across aptitude, coding, and interview prep to get placement-ready.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Readiness Score Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#00a878] drop-shadow-sm" strokeDasharray={`${MOCK_PLACEMENT_DATA.readinessScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">{MOCK_PLACEMENT_DATA.readinessScore}%</span>
                </div>
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h3 className="text-[18px] font-extrabold text-slate-900 mb-1">Placement Readiness Score</h3>
                <p className="text-[13px] font-medium text-slate-500 mb-3">Your overall profile, skills, and mock test scores place you in the <strong className="text-slate-800">Top 20%</strong> of candidates.</p>
                <span className="bg-emerald-50 text-[#00a878] px-3 py-1 rounded-md text-[12px] font-extrabold border border-emerald-100">
                  Status: {MOCK_PLACEMENT_DATA.readinessLabel}
                </span>
              </div>
            </div>

            {/* Preparation Tracks */}
            <div className="min-w-0">
              <h3 className="text-[17px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">route</span> Core Preparation Tracks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                {MOCK_PLACEMENT_DATA.tracks.map(track => (
                  <div key={track.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-slate-200 transition-all min-w-0 group cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${track.bg} ${track.color}`}>
                        <span className="material-symbols-outlined">{track.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-extrabold text-slate-900 truncate group-hover:text-[#00a878] transition-colors">{track.name}</h4>
                        <p className="text-[11px] font-bold text-slate-400">{track.progress} / {track.total} Completed</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${track.bg.replace('50', '500')}`} style={{ width: `${(track.progress / track.total) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company-wise Preparation */}
            <div className="min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500">domain</span> Company-Specific Tracks
                </h3>
                <a className="text-[12px] font-bold text-[#00a878] hover:underline" href="#">View All Companies</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
                {MOCK_PLACEMENT_DATA.companies.map(company => (
                  <div key={company.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-all min-w-0">
                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-3 overflow-hidden">
                       <span className={`material-symbols-outlined text-[28px] ${company.color}`}>{company.logo}</span>
                    </div>
                    <h4 className="text-[15px] font-extrabold text-slate-900 truncate w-full">{company.name}</h4>
                    <p className="text-[12px] font-medium text-slate-500 truncate w-full mb-3">{company.role}</p>
                    <div className="flex justify-between w-full text-[11px] font-bold mb-4">
                      <span className="text-[#00a878] bg-emerald-50 px-2 py-0.5 rounded">{company.match} Match</span>
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{company.difficulty}</span>
                    </div>
                    <button className="w-full mt-auto bg-slate-50 text-slate-700 py-2 rounded-xl text-[12px] font-extrabold hover:bg-[#00a878] hover:text-white transition-colors">
                      Start Track
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Tests */}
            <div className="min-w-0">
              <h3 className="text-[17px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">quiz</span> Upcoming Mock Tests
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-w-0">
                {MOCK_PLACEMENT_DATA.mockTests.map((test, idx) => (
                  <div key={test.id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors ${idx !== MOCK_PLACEMENT_DATA.mockTests.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[15px] font-extrabold text-slate-900 mb-1 truncate">{test.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> {test.duration}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">category</span> {test.type}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bar_chart</span> {test.difficulty}</span>
                      </div>
                    </div>
                    <button className="bg-white border border-[#00a878] text-[#00a878] px-5 py-2 rounded-xl text-[13px] font-extrabold hover:bg-emerald-50 transition-colors shrink-0">
                      Start Test
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* Recent Performance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-blue-500">monitoring</span> Recent Performance
              </h3>
              <div className="space-y-4">
                {MOCK_PLACEMENT_DATA.recentPerformance.map((perf, idx) => (
                  <div key={idx} className="min-w-0">
                    <div className="flex justify-between text-[12px] font-bold mb-1">
                      <span className="text-slate-700 truncate mr-2">{perf.topic}</span>
                      <span className={`${perf.score < 50 ? 'text-red-500' : perf.score < 75 ? 'text-amber-500' : 'text-[#00a878]'}`}>{perf.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${perf.score < 50 ? 'bg-red-500' : perf.score < 75 ? 'bg-amber-500' : 'bg-[#00a878]'}`} 
                        style={{ width: `${perf.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Topics */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-500">lightbulb</span> Practice Recommendations
              </h3>
              <div className="space-y-3">
                {MOCK_PLACEMENT_DATA.recommendedTopics.map((rec, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-start gap-3 min-w-0">
                    <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0
                      ${rec.priority === 'High' ? 'text-red-500' : rec.priority === 'Medium' ? 'text-amber-500' : 'text-[#00a878]'}`}>
                      {rec.priority === 'High' ? 'priority_high' : rec.priority === 'Medium' ? 'keyboard_double_arrow_up' : 'check_circle'}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-extrabold text-slate-800 truncate">{rec.topic}</h4>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">{rec.type} • {rec.priority} Priority</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-emerald-50/50 rounded-2xl p-6 shadow-sm border border-emerald-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> 
                Preparation Insights
              </h3>
              <ul className="space-y-4">
                {MOCK_PLACEMENT_DATA.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00a878] mt-1.5 shrink-0"></div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 min-w-0">
              <button className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm hover:bg-slate-800 transition-all text-center group flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-white text-[24px] group-hover:scale-110 transition-transform">description</span>
                <span className="text-[12px] font-extrabold text-white">Resume Sync</span>
              </button>
              <button className="bg-[#00a878] border border-[#008b63] p-4 rounded-2xl shadow-sm hover:bg-[#008b63] transition-all text-center group flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-white text-[24px] group-hover:scale-110 transition-transform">event_available</span>
                <span className="text-[12px] font-extrabold text-white">Book Mock HR</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
