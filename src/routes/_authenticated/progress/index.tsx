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

function getReadinessData(score: number | null | undefined) {
  if (score == null || Number.isNaN(score) || !Number.isFinite(score) || score <= 0) {
    return null;
  }

  // Handle cases where the AI returns a fraction (e.g. 0.85) instead of a percentage (85)
  let normalizedScore = score;
  if (normalizedScore > 0 && normalizedScore <= 1.0) {
    normalizedScore = normalizedScore * 100;
  }

  const clamped = Math.min(100, Math.max(0, normalizedScore));
  
  let text = '';
  if (clamped < 1) {
    text = '<1%';
  } else if (clamped < 10) {
    text = `${clamped.toFixed(1)}%`;
  } else {
    text = `${Math.round(clamped)}%`;
  }

  let status = '';
  let colorClass = '';
  let bgClass = '';

  if (clamped <= 20) {
    status = 'Needs Improvement';
    colorClass = 'text-red-500';
    bgClass = 'bg-red-500';
  } else if (clamped <= 40) {
    status = 'Getting Started';
    colorClass = 'text-orange-500';
    bgClass = 'bg-orange-500';
  } else if (clamped <= 60) {
    status = 'Improving';
    colorClass = 'text-amber-500';
    bgClass = 'bg-amber-400';
  } else if (clamped <= 80) {
    status = 'Good Progress';
    colorClass = 'text-[#00a878]';
    bgClass = 'bg-[#00a878]';
  } else {
    status = 'Career Ready';
    colorClass = 'text-emerald-500';
    bgClass = 'bg-emerald-500';
  }

  const visualWidth = clamped > 0 && clamped < 5 ? 5 : clamped;

  return {
    value: clamped,
    text,
    status,
    colorClass,
    bgClass,
    visualWidth
  };
}

function ProgressTrackingPage() {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['progressData', 'v2', userId],
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 min-w-0">
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-blue-500">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="text-[18px] font-black text-slate-900">{dbData.profileCompletion}%</span>
              </div>
              <h3 className="text-[13px] font-extrabold text-slate-600 truncate">Profile Completion</h3>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-blue-500" style={{ width: `${dbData.profileCompletion}%` }}></div>
            </div>
          </div>

          {(() => {
            const readiness = getReadinessData(dbData.readinessScore);
            
            if (!readiness) {
              return (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform flex flex-col justify-center h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 bg-slate-100">
                      <span className="material-symbols-outlined">target</span>
                    </div>
                    <h3 className="text-[15px] font-extrabold text-slate-900">Career Readiness</h3>
                  </div>
                  <p className="text-[13px] font-medium text-slate-500">Run Skill Gap Analysis to generate your readiness score.</p>
                </div>
              );
            }

            return (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${readiness.bgClass}`}>
                      <span className="material-symbols-outlined">target</span>
                    </div>
                    <span className={`text-[18px] font-black ${readiness.colorClass}`}>{readiness.text}</span>
                  </div>
                  <h3 className="text-[13px] font-extrabold text-slate-600 truncate">Career Readiness</h3>
                </div>
                <div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3 mb-2">
                    <div className={`h-full ${readiness.bgClass} transition-all duration-500 ease-out`} style={{ width: `${readiness.visualWidth}%` }}></div>
                  </div>
                  <p className={`text-[11px] font-bold ${readiness.colorClass}`}>{readiness.status}</p>
                </div>
              </div>
            );
          })()}

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

            {/* Recommended Learning Resources */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-500">local_library</span> 
                Recommended Learning Resources
              </h3>
              
              {dbData.nextLearningSteps?.length > 0 ? (
                <div>
                  <p className="text-[13px] font-bold text-slate-500 mb-4">
                    Based on your progress, you should focus on learning <span className="text-amber-600 font-extrabold">{dbData.focusAreas?.nextSkill || "Target Skills"}</span> next.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dbData.nextLearningSteps.map((resource: any, idx: number) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                            <span className="material-symbols-outlined text-amber-600">
                              {resource.type === "Video" ? "play_circle" : "menu_book"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug mb-1">{resource.title}</p>
                            <p className="text-[11px] font-medium text-slate-500 truncate">{resource.provider}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                  <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">check_circle</span>
                  <p className="text-[14px] font-medium text-slate-600">You're all caught up! Keep building your profile to unlock new resources.</p>
                </div>
              )}
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
                  <p className="text-[15px] font-black text-emerald-400">{dbData.focusAreas?.topStrength || "Not available"}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Critical Weakness</p>
                  <p className="text-[15px] font-black text-amber-400">{dbData.focusAreas?.criticalWeakness || "Not available"}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Next Skill Target</p>
                  <p className="text-[15px] font-black text-blue-400">{dbData.focusAreas?.nextSkill || "Not available"}</p>
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
                {aiData?.recommendations?.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>



          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
