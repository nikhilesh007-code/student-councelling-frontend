import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../../../lib/auth-client'

export const Route = createFileRoute('/_authenticated/progress/')({
  component: ProgressTrackingPage,
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function fetchProgressData() {
  const session = await authClient.getSession();
  const userId = session?.data?.user?.id;
  if (!userId) return null;

  const res = await fetch(`${API_URL}/progress/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch progress analysis')
  }
  return res.json()
}

function ProgressTrackingPage() {
  const context = useRouteContext({ strict: false }) as any;
  const completionPercentage = context?.completionPercentage || 0;

  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['progressData', 'v1', userId],
    queryFn: fetchProgressData,
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-16 h-16 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878] mb-6"></div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Progress...</h3>
           <p className="text-slate-500 font-medium max-w-md text-center">
             Our AI is gathering your milestones, applications, and skill gaps to generate a personalized progress report.
           </p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
       <DashboardLayout>
         <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">error</span>
           </div>
           <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load</h3>
           <p className="text-slate-500 mb-6">{error?.message || 'Progress data not found'}</p>
           <button onClick={() => window.location.reload()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#008b63]">Try Again</button>
         </div>
       </DashboardLayout>
    )
  }

  const { dbData, aiData } = data;

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
            Progress Tracking <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
          </h2>
          <p className="text-[14px] text-slate-500">A unified, AI-driven view of your learning, skills, career readiness, and applications.</p>
        </div>

        {/* Overall Progress Dashboard (Top Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 min-w-0">
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-blue-500">
                <span className="material-symbols-outlined">person</span>
              </div>
              <span className="text-[18px] font-black text-slate-900">{completionPercentage}%</span>
            </div>
            <h3 className="text-[13px] font-extrabold text-slate-600 truncate">Profile Completion</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-blue-500" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-[#00a878]">
                <span className="material-symbols-outlined">target</span>
              </div>
              <span className="text-[18px] font-black text-slate-900">{aiData.estimatedReadiness}%</span>
            </div>
            <h3 className="text-[13px] font-extrabold text-slate-600 truncate">AI Estimated Readiness</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-[#00a878]" style={{ width: `${aiData.estimatedReadiness}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-purple-500">
                <span className="material-symbols-outlined">school</span>
              </div>
              <span className="text-[18px] font-black text-slate-900">{dbData.roadmapProgress.percentage}%</span>
            </div>
            <h3 className="text-[13px] font-extrabold text-slate-600 truncate">Roadmap Progress</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-purple-500" style={{ width: `${dbData.roadmapProgress.percentage}%` }}></div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* AI Summary Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-[#00a878]/10 border border-emerald-100 p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> 
                AI Progress Summary
              </h3>
              <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
                {aiData.progressSummary}
              </p>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              
              {/* Roadmap Progress */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
                <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#00a878]">map</span> Roadmap Milestones
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center shrink-0">
                    <p className="text-[24px] font-black text-[#00a878]">{dbData.roadmapProgress.completed}<span className="text-[14px] text-slate-400">/{dbData.roadmapProgress.total}</span></p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Milestones</p>
                  </div>
                  <div className="min-w-0 flex-1 border-l pl-4 border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Current Milestone</p>
                    <p className="text-[14px] font-extrabold text-slate-800 truncate">{dbData.roadmapProgress.currentMilestone}</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00a878]" style={{ width: `${dbData.roadmapProgress.percentage}%` }}></div>
                </div>
              </div>

               {/* Applications Progress */}
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex flex-col">
                <h3 className="text-[15px] font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">work</span> Applications Tracker
                </h3>
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Applied</span>
                    </div>
                    <span className="text-[16px] font-black text-slate-900">{dbData.applications.applied}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                        <span className="material-symbols-outlined text-[18px]">forum</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Interviews</span>
                    </div>
                    <span className="text-[16px] font-black text-slate-900">{dbData.applications.interviews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#00a878] border border-emerald-100">
                        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Offers</span>
                    </div>
                    <span className="text-[16px] font-black text-slate-900">{dbData.applications.offers}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Skill Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">psychology</span> Skill Integration Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Learned ({dbData.learnedSkills.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dbData.learnedSkills.length > 0 ? dbData.learnedSkills.slice(0, 10).map((skill: string) => (
                      <span key={skill} className="bg-emerald-50 text-[#00a878] border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-extrabold">{skill}</span>
                    )) : <span className="text-slate-400 text-sm">No skills added yet.</span>}
                    {dbData.learnedSkills.length > 10 && <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5">+{dbData.learnedSkills.length - 10}</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">In Progress ({dbData.inProgressSkills.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dbData.inProgressSkills.length > 0 ? dbData.inProgressSkills.map((skill: string) => (
                      <span key={skill} className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-extrabold">{skill}</span>
                    )) : <span className="text-slate-400 text-sm">No active milestones.</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Missing Skills ({dbData.missingSkills.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dbData.missingSkills.length > 0 ? dbData.missingSkills.map((skill: string) => (
                      <span key={skill} className="bg-amber-50 text-amber-600 border border-amber-100 border-dashed px-2 py-0.5 rounded text-[10px] font-extrabold">{skill}</span>
                    )) : <span className="text-slate-400 text-sm">No missing skills identified yet.</span>}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* AI Focus Area */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 text-white min-w-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-[16px] font-extrabold flex items-center gap-2 mb-6 relative z-10">
                <span className="material-symbols-outlined text-[#00a878]">rocket_launch</span> AI Focus Areas
              </h3>
              
              <div className="space-y-4 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Top Strength</p>
                  <p className="text-[15px] font-black text-emerald-400">{aiData.topStrength}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Critical Weakness</p>
                  <p className="text-[15px] font-black text-amber-400">{aiData.topWeakness}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Next Skill Target</p>
                  <p className="text-[15px] font-black text-blue-400">{aiData.nextSkill}</p>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-indigo-500">lightbulb</span> 
                Detailed Insights
              </h3>
              <ul className="space-y-4">
                {aiData?.insights?.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weekly Recommendation */}
            <div className="bg-amber-50 rounded-2xl p-6 shadow-sm border border-amber-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-amber-900 flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-500">calendar_today</span> 
                Weekly Recommendation
              </h3>
              <p className="text-[14px] font-medium text-amber-800 leading-relaxed bg-white/50 p-4 rounded-xl border border-amber-200/50">
                {aiData.weeklyRecommendation}
              </p>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
