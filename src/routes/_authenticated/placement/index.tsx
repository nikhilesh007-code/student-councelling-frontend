import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../../../lib/auth-client'
import { motion, animate } from 'framer-motion'

export const Route = createFileRoute('/_authenticated/placement/')({
  component: PlacementPage,
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function fetchPlacementDashboard(userId: string) {
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

// ---------- Counts a number up from 0 to its final value, once ----------
function AnimatedPercent({ value, onDone }: { value: number; onDone?: () => void }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => onDone?.(),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <>{display}</>
}

type TreeTarget = 'strengths' | 'weaknesses' | 'interview' | 'eligibility' | 'recruiter'
const SEQUENCE_ORDER: TreeTarget[] = ['strengths', 'weaknesses', 'interview', 'eligibility', 'recruiter']
const STEP_GAP_MS = 550

function PlacementPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const userId = session?.user?.id

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['placementDashboard', 'v2', userId],
    queryFn: () => fetchPlacementDashboard(userId as string),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // True while we're still waiting on either the session OR the dashboard data.
  // Everything below should check THIS, not the raw isLoading, or we're back
  // to the same "flash of error before real data" bug.
  const stillLoading = sessionLoading || !userId || isLoading

  const hasPlayedRef = useRef(false)

  const [scoreDone, setScoreDone] = useState(false)
  const [activePulse, setActivePulse] = useState<TreeTarget | null>(null)
  const [interviewBarsReady, setInterviewBarsReady] = useState(false)
  const [recruiterRevealed, setRecruiterRevealed] = useState(false)

  const handleStepArrived = (id: TreeTarget) => {
    setActivePulse(id)
    setTimeout(() => setActivePulse(null), 450)
    if (id === 'interview') setInterviewBarsReady(true)
    if (id === 'recruiter') setRecruiterRevealed(true)
  }

  // Once the score finishes counting up, play the card-by-card sequence on a simple timer.
  useEffect(() => {
    if (!scoreDone || hasPlayedRef.current || !dashboard) return
    hasPlayedRef.current = true

    const timers = SEQUENCE_ORDER.map((id, idx) =>
      setTimeout(() => handleStepArrived(id), idx * STEP_GAP_MS + 200)
    )

    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreDone, dashboard])

  const pulseAnimate = (id: TreeTarget) =>
    activePulse === id ? { scale: 1.03, y: -6 } : { scale: 1, y: 0 }

  if (stillLoading) {
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

  const finalScore = dashboard.estimatedPlacementConfidence?.score || 0

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 mb-2">
  Placement Coach
  <motion.span
    className="material-symbols-outlined text-[#00a878]"
    style={{ fontVariationSettings: "'FILL' 1", display: 'inline-block', transformOrigin: '50% 50%' }}
    animate={{ rotate: [0, -12, 12, -8, 0], scale: [1, 1.15, 1.15, 1.05, 1] }}
    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
  >
    auto_awesome
  </motion.span>
</h2>
          <p className="text-[14px] text-slate-500">Your personalized placement readiness assessment and actionable priorities.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">

          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Hero: AI Readiness Assessment */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-w-0 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a878] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative w-32 h-32 shrink-0 group" title={dashboard.estimatedPlacementConfidence?.confidenceReason}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <motion.path
                    className="text-[#00a878] drop-shadow-sm"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${finalScore}, 100` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900">
                    <AnimatedPercent value={finalScore} onDone={() => setScoreDone(true)} />%
                  </span>
                </div>
              </div>
              
              <div className="min-w-0 text-center md:text-left z-10">
                <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                  <h3 className="text-[20px] font-extrabold text-slate-900">Placement Assessment</h3>
                  <span className="bg-emerald-50 text-[#00a878] px-3 py-1 rounded-full text-[12px] font-bold border border-emerald-100">
                    {dashboard.estimatedPlacementConfidence?.category || "Unknown"}
                  </span>
                </div>
                {dashboard.placementReadinessAssessment ? (
                  <div className="text-[14px] font-medium text-slate-600 leading-relaxed space-y-3">
                    {dashboard.placementReadinessAssessment.split('\n').map((paragraph: string, idx: number) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">info</span>
                    <p className="text-sm text-slate-500 font-medium">Assessment data not available. Please complete your profile.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              <motion.div
                animate={pulseAnimate('strengths')}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-emerald-50/50 rounded-2xl p-6 shadow-sm border border-emerald-100 min-w-0"
              >
                <h3 className="text-[16px] font-extrabold text-emerald-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">add_circle</span> Technical Strengths
                </h3>
                <div className="space-y-4">
                  {dashboard.technicalStrengths?.map((s: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100/50" title={s.reason}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 text-[14px]">{s.skill}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${s.importance === 'High' ? 'bg-emerald-50 text-emerald-600' : s.importance === 'Medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                          {s.importance}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 leading-snug">{s.reason}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={pulseAnimate('weaknesses')}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-amber-50/50 rounded-2xl p-6 shadow-sm border border-amber-100 min-w-0"
              >
                <h3 className="text-[16px] font-extrabold text-amber-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">remove_circle</span> Technical Weaknesses
                </h3>
                <div className="space-y-4">
                  {dashboard.technicalWeaknesses?.map((w: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100/50" title={w.reason}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 text-[14px]">{w.skill}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${w.importance === 'High' ? 'bg-red-50 text-red-600' : w.importance === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {w.importance}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 leading-snug">{w.reason}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Interview Readiness */}
            <motion.div
              animate={pulseAnimate('interview')}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0"
            >
              <h3 className="text-[18px] font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">model_training</span> Interview Readiness
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {Object.entries(dashboard.interviewReadiness || {}).map(([key, data]: [string, any], idx: number) => {
                  const title = key === 'cn' ? 'Computer Networks' : key === 'os' ? 'Operating Systems' : key === 'dbms' ? 'DBMS' : key === 'hr' ? 'HR / Behavioral' : key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <div key={key} className="group" title={data.reason}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-slate-700 text-[13px]">{title}</span>
                        <span className="font-black text-slate-900 text-[14px]">{data.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                        <motion.div
                          className={`h-full ${data.score >= 80 ? 'bg-[#00a878]' : data.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          initial={{ width: '0%' }}
                          animate={{ width: interviewBarsReady ? `${data.score}%` : '0%' }}
                          transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug truncate group-hover:whitespace-normal group-hover:text-clip">{data.reason}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Company Eligibility */}
            <motion.div
              animate={pulseAnimate('eligibility')}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="min-w-0"
            >
              <h3 className="text-[18px] font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">domain</span> Company Eligibility
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['service', 'product', 'startup'].map((type) => {
                  const data = dashboard.companyEligibility?.[type];
                  if (!data) return null;
                  const isReady = data.status === 'Ready';
                  const isNeedsImp = data.status === 'Needs Improvement';
                  return (
                    <div key={type} className={`bg-white rounded-2xl p-6 shadow-sm border ${isReady ? 'border-[#00a878]/30' : isNeedsImp ? 'border-amber-300/30' : 'border-red-300/30'} flex flex-col gap-3 min-w-0`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isReady ? 'bg-emerald-50 text-[#00a878]' : isNeedsImp ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                          <span className="material-symbols-outlined">
                            {type === 'service' ? 'corporate_fare' : type === 'product' ? 'code_blocks' : 'rocket_launch'}
                          </span>
                        </div>
                        <h4 className="text-[15px] font-extrabold text-slate-900 capitalize">{type}</h4>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider w-max ${isReady ? 'bg-emerald-50 text-[#00a878]' : isNeedsImp ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                        {data.status}
                      </span>
                      <p className="text-[12px] font-medium text-slate-500 leading-relaxed mt-1">
                        {data.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* Priorities */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 min-w-0 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-[16px] font-extrabold text-white flex items-center gap-2 mb-6 relative z-10">
                <span className="material-symbols-outlined text-indigo-400">priority</span> 
                Top 5 Priorities
              </h3>
              {Array.isArray(dashboard.fivePlacementPriorities) && dashboard.fivePlacementPriorities.length > 0 ? (
                <ul className="space-y-4 relative z-10">
                  {dashboard.fivePlacementPriorities.map((priority: string, idx: number) => (
                    <li key={idx} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-black text-[12px] shrink-0 mt-0.5 border border-indigo-500/30">
                        {idx + 1}
                      </div>
                      <p className="text-[13px] font-medium text-slate-300 leading-snug pt-0.5">{priority}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="material-symbols-outlined text-emerald-400 mb-2">check_circle</span>
                  <p className="text-[13px] font-bold text-slate-400">No priorities found!</p>
                </div>
              )}
            </div>

            {/* Missing Requirements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold flex items-center gap-2 mb-5 text-slate-900">
                <span className="material-symbols-outlined text-amber-500">inventory_2</span> 
                Missing Assets
              </h3>
              <div className="space-y-5">
                {['skills', 'projects', 'documents'].map((reqType) => {
                  const items = dashboard.missingPlacementRequirements?.[reqType] || [];
                  return (
                    <div key={reqType}>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">{reqType}</h4>
                      {items.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {items.map((item: string, idx: number) => (
                            <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-200/50 px-2.5 py-1 rounded-md text-[11px] font-bold">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] font-medium text-slate-400 italic">None missing.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recruiter Feedback */}
            {dashboard.recruiterFeedback && (
              <motion.div
                animate={pulseAnimate('recruiter')}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-blue-50/50 rounded-2xl p-6 shadow-sm border border-blue-100 min-w-0 relative"
              >
                <div className="absolute top-4 right-4 text-blue-200">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                </div>
                <h3 className="text-[13px] font-black uppercase tracking-wider flex items-center gap-2 mb-3 text-blue-600 relative z-10">
                  Recruiter Feedback
                </h3>
                <motion.p
                  className="text-[14px] font-medium text-slate-700 leading-relaxed relative z-10 italic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: recruiterRevealed ? 1 : 0, y: recruiterRevealed ? 0 : 10 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  "{dashboard.recruiterFeedback}"
                </motion.p>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
