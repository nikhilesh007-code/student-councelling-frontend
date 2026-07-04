import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

/** Energy pulse dot travels along the bar while it fills behind it. Plays once when `trigger` becomes true. */
function PulseBar({ target, colorClass, trigger, delay, duration = 0.7 }: { target: number; colorClass: string; trigger: boolean; delay: number; duration?: number }) {
  return (
    <div className="relative w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
      <motion.div
        className={`h-full ${colorClass}`}
        initial={{ width: '0%' }}
        animate={trigger ? { width: `${target}%` } : { width: '0%' }}
        transition={{ duration, delay, ease: 'easeInOut' }}
      />
      {trigger && (
        <motion.div
          initial={{ left: '0%', opacity: 1 }}
          animate={{ left: `${target}%`, opacity: [1, 1, 0] }}
          transition={{ duration, delay, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-3px',
            width: 8,
            height: 8,
            borderRadius: '9999px',
            background: '#00a878',
            boxShadow: '0 0 8px 3px rgba(0,168,120,0.7)',
            transform: 'translateX(-50%)',
          }}
        />
      )}
    </div>
  )
}

/** Counts up from 0 to `value` once triggered, after `delay` seconds. */
function AnimatedPercent({ value, trigger, delay, duration = 0.35 }: { value: number; trigger: boolean; delay: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let raf = 0;
    const startTimeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / (duration * 1000), 1);
        setDisplay(Math.round(progress * value));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay * 1000);
    return () => { clearTimeout(startTimeout); cancelAnimationFrame(raf); };
  }, [trigger, value, delay, duration]);

  return <>{display}%</>;
}

/** Reveals text a couple characters at a time, starting after `delay` seconds. Plays once. */
function TypewriterLine({ text, trigger, delay }: { text: string; trigger: boolean; delay: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!trigger || !text) return;
    let interval: any;
    const startTimeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i += 3;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, 10);
    }, delay * 1000);
    return () => { clearTimeout(startTimeout); clearInterval(interval); };
  }, [trigger, text, delay]);

  return <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{displayed}</p>;
}

function ProgressTrackingPage() {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['progressData', 'v2', userId],
    queryFn: fetchProgressData,
    enabled: !!userId,
  })

  // AI Growth Pulse — plays once when data is ready
  const [animateTimeline, setAnimateTimeline] = useState(false);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setAnimateTimeline(true), 200);
      return () => clearTimeout(timer);
    }
  }, [data]);

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
  const readiness = getReadinessData(dbData.readinessScore);
  const summarySentences: string[] = (aiData.progressSummary || '').split(/(?<=[.!?])\s+/).filter(Boolean);

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
          
          {/* Step 1: Profile Completion — pulse travels, bar fills, percentage counts up */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-blue-500">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="text-[18px] font-black text-slate-900">
                  <AnimatedPercent value={dbData.profileCompletion} trigger={animateTimeline} delay={0.8} />
                </span>
              </div>
              <h3 className="text-[13px] font-extrabold text-slate-600 truncate">Profile Completion</h3>
            </div>
            <PulseBar target={dbData.profileCompletion} colorClass="bg-blue-500" trigger={animateTimeline} delay={0.2} duration={0.6} />
          </div>

          {/* Step 2: Career Readiness — same treatment, starts right after Step 1 */}
          {!readiness ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 bg-slate-100">
                  <span className="material-symbols-outlined">target</span>
                </div>
                <h3 className="text-[15px] font-extrabold text-slate-900">Career Readiness</h3>
              </div>
              <p className="text-[13px] font-medium text-slate-500">Run Skill Gap Analysis to generate your readiness score.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${readiness.bgClass}`}>
                    <span className="material-symbols-outlined">target</span>
                  </div>
                  <span className={`text-[18px] font-black ${readiness.colorClass}`}>
                    <AnimatedPercent value={Math.round(readiness.value)} trigger={animateTimeline} delay={1.7} />
                  </span>
                </div>
                <h3 className="text-[13px] font-extrabold text-slate-600 truncate">Career Readiness</h3>
              </div>
              <div>
                <PulseBar target={readiness.visualWidth} colorClass={readiness.bgClass} trigger={animateTimeline} delay={1.1} duration={0.6} />
                <p className={`text-[11px] font-bold ${readiness.colorClass} mt-2`}>{readiness.status}</p>
              </div>
            </div>
          )}

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Step 3: AI Summary Banner — brightens, icon rotates, text fades in sentence by sentence */}
            <motion.div
              animate={animateTimeline ? { filter: ['brightness(1)', 'brightness(1.08)', 'brightness(1)'] } : {}}
              transition={{ duration: 0.6, delay: 2.0, ease: 'easeInOut' }}
              className="bg-gradient-to-r from-emerald-50 to-[#00a878]/10 border border-emerald-100 p-6 rounded-2xl shadow-sm relative overflow-hidden"
            >
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-3">
                <motion.span
                  animate={animateTimeline ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.6, delay: 2.0, ease: 'easeInOut' }}
                  className="material-symbols-outlined text-[#00a878] inline-block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </motion.span>
                AI Progress Summary
              </h3>
              <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
                {summarySentences.map((sentence, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={animateTimeline ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.4, delay: 2.15 + idx * 0.18 }}
                    className="inline"
                  >
                    {sentence + ' '}
                  </motion.span>
                ))}
              </p>
            </motion.div>

            {/* Recommended Learning Resources — Step 5: cards activate left to right */}
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
                      <motion.a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        animate={animateTimeline ? { y: [0, -4, 0], rotate: [0, 2, 0] } : {}}
                        transition={{ duration: 0.4, delay: 2.7 + idx * 0.12, ease: 'easeInOut' }}
                        className="block bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50 rounded-xl p-4 transition-colors"
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
                      </motion.a>
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
            
            {/* Step 4: AI Focus Area — each card activates one by one */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800 text-white min-w-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-[16px] font-extrabold flex items-center gap-2 mb-6 relative z-10">
                <span className="material-symbols-outlined text-[#00a878]">rocket_launch</span> AI Focus Areas
              </h3>
              
              <div className="space-y-4 relative z-10">
                <motion.div
                  animate={animateTimeline ? { y: [0, -4, 0], scale: [1, 1.03, 1] } : {}}
                  transition={{ duration: 0.5, delay: 2.4, ease: 'easeInOut' }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Top Strength</p>
                  <p className="text-[15px] font-black text-emerald-400">{dbData.focusAreas?.topStrength || "Not available"}</p>
                </motion.div>
                <motion.div
                  animate={animateTimeline ? { y: [0, -4, 0], scale: [1, 1.03, 1] } : {}}
                  transition={{ duration: 0.5, delay: 2.55, ease: 'easeInOut' }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Critical Weakness</p>
                  <p className="text-[15px] font-black text-amber-400">{dbData.focusAreas?.criticalWeakness || "Not available"}</p>
                </motion.div>
                <motion.div
                  animate={animateTimeline ? { y: [0, -4, 0], scale: [1, 1.03, 1] } : {}}
                  transition={{ duration: 0.5, delay: 2.7, ease: 'easeInOut' }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Next Skill Target</p>
                  <p className="text-[15px] font-black text-blue-400">{dbData.focusAreas?.nextSkill || "Not available"}</p>
                </motion.div>
              </div>
            </div>

            {/* Step 6: Detailed Insights — typewriter reveal, one bullet after another */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-indigo-500">lightbulb</span> 
                Detailed Insights
              </h3>
              <ul className="space-y-4">
                {aiData?.recommendations?.map((insight: string, idx: number) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={animateTimeline ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.2, delay: 3.0 + idx * 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                    <TypewriterLine text={insight} trigger={animateTimeline} delay={3.0 + idx * 0.3} />
                  </motion.li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
