import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

const CONFETTI_COLORS = ['#00a878', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa']

/** Full-screen confetti that falls from wherever the button was clicked */
function Confetti({ trigger, originX = 50 }: { trigger: number; originX?: number }) {
  const pieces = useMemo(() => {
    if (!trigger) return []
    return Array.from({ length: 34 }).map((_, i) => ({
      id: `${trigger}-${i}`,
      x: (Math.random() - 0.5) * 340,
      rotate: Math.random() * 720 - 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.2,
      size: 7 + Math.random() * 7,
      round: Math.random() > 0.5,
      duration: 1.4 + Math.random() * 0.8,
    }))
  }, [trigger])

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, top: '-5%', left: `calc(${originX}% + ${p.x}px)`, rotate: 0 }}
            animate={{ opacity: [1, 1, 0], top: '105%', rotate: p.rotate }}
            transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.6, 0.4, 1] }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.round ? '50%' : '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/assessment/')({
  component: AssessmentPage,
})

function AssessmentPage() {
  const context = useRouteContext({ strict: false }) as any;
  const sessionUser = context?.sessionUser;
  const profileData = context?.profile;
  const userId = sessionUser?.id;

  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Confetti state — same approach as Career Guidance page
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiOriginX, setConfettiOriginX] = useState(50);

  const fireConfettiFromElement = (el: HTMLElement | null) => {
    const rect = el?.getBoundingClientRect();
    const originX = rect ? ((rect.left + rect.width / 2) / window.innerWidth) * 100 : 50;
    setConfettiOriginX(originX);
    setConfettiTrigger((t) => t + 1);
  };

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['assessment-data', userId, profileData?.updatedAt],
   queryFn: async ({ signal }) => {
  if (!userId) throw new Error("No user session found. Please log in.");

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // Always start the career-guidance call
  const guidancePromise = fetch(`${API}/career-guidance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
    signal
  }).then(res => {
    if (!res.ok) throw new Error("Failed to fetch careers data");
    return res.json();
  });

  // If we ALREADY know the target career, start skill-gap at the SAME time
  // instead of waiting for career-guidance to finish first.
  const knownCareer = profileData?.selectedCareer || profileData?.careerGoal;

  const skillGapPromise = knownCareer
    ? fetch(`${API}/skill-gap/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, targetCareer: knownCareer }),
        signal
      }).then(res => (res.ok ? res.json() : null))
    : null; // if we don't know the career yet, we'll fetch it after guidance responds

  const guidanceJson = await guidancePromise;
  const topCareerName = knownCareer || guidanceJson.topCareers?.[0]?.title;

  // If skill-gap was already started above, just wait for it.
  // Otherwise (we didn't know the career yet), fetch it now.
  const skillGapData = skillGapPromise
    ? await skillGapPromise
    : await fetch(`${API}/skill-gap/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, targetCareer: topCareerName }),
        signal
      }).then(res => (res.ok ? res.json() : null));

  return {
    profile: profileData,
    targetCareer: topCareerName,
    skillGap: skillGapData,
    guidanceMeta: guidanceJson._meta
  };
},
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchInterval: (query: any) => {
      const data = query.state?.data as any;
      const isGuidanceRefreshing = data?.guidanceMeta?.isRefreshing;
      const isSkillGapRefreshing = data?.skillGap?._meta?.isRefreshing;
      return (isGuidanceRefreshing || isSkillGapRefreshing) ? 3000 : false;
    }
  });

  const handleRegenerate = async (el: HTMLElement | null) => {
    fireConfettiFromElement(el);
    setIsRegenerating(true);
    try {
      const guidanceRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/career-guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, regenerate: true })
      }).then(r => r.json());

      const topCareerName = profileData?.selectedCareer || guidanceRes.topCareers?.[0]?.title || profileData?.careerGoal;

      const skillGapRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/skill-gap/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, targetCareer: topCareerName, regenerate: true })
      }).then(r => r.json());

      queryClient.setQueryData(['assessment-data', userId, profileData?.updatedAt], {
        profile: profileData,
        targetCareer: topCareerName,
        skillGap: skillGapRes,
        guidanceMeta: guidanceRes._meta
      });
      queryClient.invalidateQueries({ queryKey: ['progressData'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  // We no longer block the whole UI if it's just refreshing in background.
  // We only block if there's no data AND it's loading.
  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Analyzing your skills and generating gap report...</p>
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
          <h3 className="text-lg font-bold text-slate-900 mb-2">Analysis Failed</h3>
          <p className="text-slate-500 mb-6">{(error as any)?.message || "Failed to load assessment."}</p>
          <button onClick={() => refetch()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
        </div>
      </DashboardLayout>
    )
  }

  const skillGap = data?.skillGap;

  if (!skillGap || !skillGap.success) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-slate-500 font-medium mt-10">
          No skill gap data could be generated. Please ensure your profile is complete.
        </div>
      </DashboardLayout>
    )
  }

  const matched = skillGap.matchedSkills || [];
  const missing = skillGap.missingSkills || [];
  const targetCareer = skillGap.career || data?.targetCareer || "Your Career Goal";
  const rawReadiness = Number(skillGap.readinessScore ?? 0);

  const readiness =
    rawReadiness <= 1
      ? Math.round(rawReadiness * 100)
      : Math.round(rawReadiness);
  const analysisSummary = skillGap.summary || "You have some missing skills. Focus on learning them to achieve your career goal.";

  const actionPlan = missing.slice(0, 5).map((skill: string, idx: number) => ({
    step: idx + 1,
    title: skill,
    color: idx === 0 ? 'red' : idx === 1 ? 'orange' : 'yellow'
  }));

  // Calculate circumference for radial progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.2
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  return (
    <DashboardLayout>
      <Confetti trigger={confettiTrigger} originX={confettiOriginX} />
      <div className="min-w-0 w-full max-w-5xl mx-auto pb-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Skill Gap Analysis
              <span className="material-symbols-outlined text-[#00a878] text-3xl">bar_chart</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl font-medium">
              A highly focused view of your current skills versus your target career requirements.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {(data?.guidanceMeta?.isRefreshing || data?.skillGap?._meta?.isRefreshing) && (
              <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-lg font-bold text-sm border border-amber-100 flex items-center gap-2 shadow-sm animate-pulse">
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                Refreshing recommendations...
              </div>
            )}
            <button
              onClick={(e) => handleRegenerate(e.currentTarget)}
              disabled={isRegenerating || data?.guidanceMeta?.isRefreshing || data?.skillGap?._meta?.isRefreshing}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm bg-white shrink-0 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${(isRegenerating || data?.guidanceMeta?.isRefreshing || data?.skillGap?._meta?.isRefreshing) ? 'animate-spin' : ''}`}>refresh</span>
              {isRegenerating ? "Regenerating..." : "Regenerate Analysis"}
            </button>
          </div>
        </div>

        {/* Hero Section: Target Career & AI Insight */}
        <div className="bg-slate-900 rounded-3xl p-8 mb-8 shadow-lg border border-slate-800 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
         {/* Shimmer sweep */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '700%' }}
            transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '15%',
              height: '100%',
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,215,0,0.15) 48%, rgba(255,255,255,0.25) 50%, rgba(255,215,0,0.15) 52%, transparent 65%)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a878] rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>

          <div className="flex-1 z-10">
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-2">Target Career Path</p>
            <h3 className="text-4xl font-black mb-6">{targetCareer}</h3>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h5 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">psychiatry</span>
                AI Analysis
              </h5>
              <p className="text-slate-300 leading-relaxed text-sm font-medium">
                {analysisSummary}
              </p>
            </div>
          </div>

          {/* Radial Readiness Score */}
          <div className="shrink-0 flex flex-col items-center justify-center bg-white/5 p-6 rounded-3xl border border-white/10 z-10 min-w-[200px]">
            <div className="relative w-[120px] h-[120px]">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-white/10" cx="50" cy="50" fill="transparent" r={radius} stroke="currentColor" strokeWidth="10"></circle>
                <circle className="text-[#00a878] transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r={radius} stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="10"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl text-white font-black leading-none">{readiness}%</span>
              </div>
            </div>
            <span className="mt-4 text-slate-300 font-bold text-sm uppercase tracking-wide">Readiness</span>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Skills You Have */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h4 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00a878]">task_alt</span>
              Skills Already Present
            </h4>
            {matched.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {matched.map((skill: string, index: number) => {
                  const directions = [
                    { x: -50, y: 0 }, { x: 50, y: 0 },
                    { x: 0, y: -50 }, { x: 0, y: 50 },
                    { x: -50, y: -50 }, { x: 50, y: 50 }
                  ]
                  const dir = directions[index % directions.length]
                  return (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, x: dir.x, y: dir.y }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
                      className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 shadow-sm"
                    >
                      {skill}
                    </motion.span>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">No exact skill matches found.</p>
            )}
          </div>

          {/* Skills You Need */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h4 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">warning</span>
              Missing Skills
            </h4>
            {missing.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {missing.map((skill: string, index: number) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, y: -60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1, type: 'spring', bounce: 0.55 }}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-red-100 shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">You have all the required skills!</p>
            )}
          </div>
        </div>

        {/* Priority Learning Order */}
        {actionPlan.length > 0 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h4 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">format_list_numbered</span>
              Priority Learning Order
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {actionPlan.map((plan: any) => (
                <div key={plan.step} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shrink-0">
                    {plan.step}
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm">{plan.title}</h5>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
