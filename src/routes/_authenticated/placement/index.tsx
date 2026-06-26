import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../../../lib/auth-client'

export const Route = createFileRoute('/_authenticated/placement/')({
  component: PlacementPage,
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function fetchPlacementDashboard() {
  const session = await authClient.getSession();
  const userId = session?.data?.user?.id;
  if (!userId) return null;

  const res = await fetch(`${API_URL}/placement/dashboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch placement dashboard')
  }
  return res.json()
}

function PlacementPage() {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['placementDashboard', 'v2', userId],
    queryFn: fetchPlacementDashboard,
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-16 h-16 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878] mb-6"></div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Your Profile</h3>
           <p className="text-slate-500 font-medium max-w-md text-center">
             Our AI is currently synthesizing your resume, skill gaps, and career goals to build a personalized placement readiness plan...
           </p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !dashboard) {
    return (
       <DashboardLayout>
         <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">error</span>
           </div>
           <h3 className="text-lg font-bold text-slate-900 mb-2">AI Generation Failed</h3>
           <p className="text-slate-500 mb-6">{error?.message || 'Dashboard data not found'}</p>
           <button onClick={() => window.location.reload()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#008b63] transition-colors">
              Try Again
           </button>
         </div>
       </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 mb-2">
            AI Placement Intelligence 
            <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </h2>
          <p className="text-[14px] text-slate-500">Your dynamically generated, personalized placement readiness assessment and roadmap.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Hero: AI Readiness Assessment */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-w-0 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a878] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#00a878] drop-shadow-sm" strokeDasharray={`${dashboard.readinessScore}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900">{dashboard.readinessScore}%</span>
                </div>
              </div>
              
              <div className="min-w-0 text-center md:text-left z-10">
                <h3 className="text-[20px] font-extrabold text-slate-900 mb-3">AI Placement Assessment</h3>
                {dashboard.placementAssessment ? (
                  <p className="text-[14px] font-medium text-slate-600 leading-relaxed">
                    {dashboard.placementAssessment}
                  </p>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">info</span>
                    <p className="text-sm text-slate-500 font-medium">Assessment data not available. Please complete your profile.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4-Week Roadmap */}
            <div className="min-w-0">
              <h3 className="text-[18px] font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">route</span> 
                Your 4-Week Action Plan
              </h3>
              {Array.isArray(dashboard.roadmap) && dashboard.roadmap.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.roadmap.map((weekData: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-6 hover:border-indigo-100 transition-colors group">
                      <div className="flex flex-col items-center">
                         <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-sm border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
                           W{weekData.week}
                         </div>
                         {idx !== dashboard.roadmap.length - 1 && (
                           <div className="w-0.5 h-full bg-slate-100 mt-2"></div>
                         )}
                      </div>
                      <div className="pb-2 min-w-0 w-full">
                        <h4 className="text-[16px] font-extrabold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{weekData.focus}</h4>
                        <ul className="space-y-2">
                          {Array.isArray(weekData.tasks) && weekData.tasks.map((task: string, tIdx: number) => (
                            <li key={tIdx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                              <span className="material-symbols-outlined text-indigo-400 text-[18px] mt-0.5">check_circle</span>
                              <span className="text-[13px] text-slate-600 font-bold">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-slate-300 text-4xl mb-3">calendar_month</span>
                  <p className="text-slate-500 font-bold text-[14px]">No roadmap generated yet.</p>
                  <p className="text-slate-400 text-[12px] mt-1">Upload a resume to get a personalized 4-week preparation plan.</p>
                </div>
              )}
            </div>

            {/* Company Readiness */}
            <div className="min-w-0 pt-4">
              <h3 className="text-[18px] font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">domain</span> 
                Target Company Readiness
              </h3>
              {Array.isArray(dashboard.companyReadiness) && dashboard.companyReadiness.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboard.companyReadiness.map((company: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 min-w-0 hover:-translate-y-1 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shrink-0">
                           <span className="material-symbols-outlined text-blue-500 text-2xl">corporate_fare</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[16px] font-extrabold text-slate-900 truncate mb-1">{company.company}</h4>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-blue-500" style={{ width: `${company.readinessPercentage}%` }}></div>
                          </div>
                          <p className="text-[11px] font-bold text-blue-600">{company.readinessPercentage}% Match</p>
                        </div>
                      </div>
                      <p className="text-[13px] font-medium text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl">
                        {company.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-slate-300 text-4xl mb-3">business_center</span>
                  <p className="text-slate-500 font-bold text-[14px]">No company readiness data.</p>
                  <p className="text-slate-400 text-[12px] mt-1">Specify your target career to get company-specific analysis.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* Priority Improvements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 min-w-0 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 opacity-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-5 relative z-10">
                <span className="material-symbols-outlined text-red-500">warning</span> 
                Priority Improvements
              </h3>
              {Array.isArray(dashboard.priorityImprovements) && dashboard.priorityImprovements.length > 0 ? (
                <ul className="space-y-4 relative z-10">
                  {dashboard.priorityImprovements.map((improvement: string, idx: number) => (
                    <li key={idx} className="flex gap-4 items-start bg-red-50/30 p-3 rounded-xl border border-red-50/50 hover:bg-red-50/80 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-white text-red-600 shadow-sm flex items-center justify-center font-black text-[12px] shrink-0 mt-0.5 border border-red-100">
                        {idx + 1}
                      </div>
                      <p className="text-[13px] font-bold text-slate-800 leading-snug pt-1">{improvement}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="material-symbols-outlined text-emerald-500 mb-2">check_circle</span>
                  <p className="text-[13px] font-bold text-slate-500">No critical priority improvements found!</p>
                </div>
              )}
            </div>

            {/* Today's Recommendations */}
            <div className="bg-gradient-to-br from-[#00a878] to-[#008b63] rounded-2xl p-6 shadow-sm min-w-0 text-white relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-[16px] font-extrabold flex items-center gap-2 mb-5 relative z-10">
                <span className="material-symbols-outlined text-emerald-200">task_alt</span> 
                Today's Action Items
              </h3>
              {Array.isArray(dashboard.todayActions) && dashboard.todayActions.length > 0 ? (
                <div className="space-y-3 relative z-10">
                  {dashboard.todayActions.map((rec: string, idx: number) => (
                    <label key={idx} className="flex items-start gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer transition-colors border border-white/5">
                      <input type="checkbox" className="mt-0.5 w-5 h-5 rounded border-white/40 text-[#00a878] focus:ring-emerald-400 focus:ring-offset-0 bg-white/20" />
                      <span className="text-[14px] font-bold leading-snug">{rec}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 bg-white/10 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-emerald-200 mb-2">celebration</span>
                  <p className="text-[13px] font-bold text-emerald-50">No tasks for today. You're caught up!</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
