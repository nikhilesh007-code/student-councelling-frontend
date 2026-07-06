import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  type Variants,
} from 'framer-motion'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/recommendation/')({
  component: CareerGuidancePage,
})

// ---------------- Animation variants ----------------
const containerStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.8, rotate: -3 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 260, damping: 18 },
  },
}

const stepItem: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ---------------- BIG visible effects ----------------

const CONFETTI_COLORS = ['#00a878', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa', '#34d399']

/** Full-screen confetti burst — impossible to miss */
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

/** Quick full-screen color flash for extra punch on important actions */
function ScreenFlash({ trigger, color = 'bg-emerald-400' }: { trigger: number; color?: string }) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          key={trigger}
          initial={{ opacity: 0.28 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className={`pointer-events-none fixed inset-0 z-[998] ${color}`}
        />
      )}
    </AnimatePresence>
  )
}

/** Big celebratory popup badge, e.g. "Target Career Set!" */
function CelebrationToast({ show, text }: { show: boolean; text: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: -20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-white shadow-2xl border-2 border-emerald-200 rounded-2xl px-7 py-4 flex items-center gap-3"
        >
          <motion.span
            animate={{ rotate: [0, -15, 15, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.7 }}
            className="text-3xl"
          >
            🎉
          </motion.span>
          <span className="font-extrabold text-slate-900 text-lg whitespace-nowrap">{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Counts up from 0 to `value` whenever value changes */
function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start: number | null = null
    const duration = 1000
    let raf: number

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <span className={className}>{display}%</span>
}

/** Reveals text one character at a time */
function TypewriterText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    if (!text) return
    let i = 0
    const interval = setInterval(() => {
      i += 2
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 14)
    return () => clearInterval(interval)
  }, [text])

  return (
    <p className={className}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[2px] h-[13px] bg-[#00a878] ml-0.5 align-middle"
      />
    </p>
  )
}

/** Card wrapper: 3D tilt on hover, glow when active, ripple burst on click */
function TiltCard({
  children,
  className,
  onClick,
  isActive,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  isActive?: boolean
}) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 220, damping: 18 })
  const springY = useSpring(rotateY, { stiffness: 220, damping: 18 })
  const [rippleKey, setRippleKey] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * 14)
    rotateX.set(-py * 14)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const handleClick = () => {
    setRippleKey((k) => k + 1)
    onClick?.()
  }

  return (
    <motion.div
      variants={cardItem}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
      className={`relative ${className || ''}`}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <AnimatePresence>
          {rippleKey > 0 && (
            <motion.span
              key={rippleKey}
              initial={{ opacity: 0.5, scale: 0 }}
              animate={{ opacity: 0, scale: 3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-emerald-300/50"
            />
          )}
        </AnimatePresence>
      </div>

      {children}

      {isActive && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              '0 0 0px 0px rgba(0,168,120,0)',
              '0 0 28px 5px rgba(0,168,120,0.4)',
              '0 0 0px 0px rgba(0,168,120,0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  )
}

// ---------------- Main Page ----------------

function CareerGuidancePage() {
  const context = useRouteContext({ strict: false }) as any;
  const sessionUser = context?.sessionUser;
  const userId = sessionUser?.id;
  const profileData = context?.profile;

  const [activeCareerTitle, setActiveCareerTitle] = useState<string | null>(profileData?.selectedCareer || null);
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSettingTarget, setIsSettingTarget] = useState(false);

  // Big visible effect state
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiOriginX, setConfettiOriginX] = useState(50);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const fireConfettiFromElement = (el: HTMLElement | null) => {
    const rect = el?.getBoundingClientRect();
    const originX = rect ? ((rect.left + rect.width / 2) / window.innerWidth) * 100 : 50;
    setConfettiOriginX(originX);
    setConfettiTrigger((t) => t + 1);
  };

 

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendations', userId, profileData?.updatedAt],
    queryFn: async ({ signal }) => {
      if (!userId) throw new Error("No user ID found");

      const guidanceRes = await fetch(`${import.meta.env.VITE_API_URL}/career-guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
        signal,
      });

      if (!guidanceRes.ok) {
        throw new Error("Failed to fetch AI recommendation data");
      }

      const guidance = await guidanceRes.json();
      if (!guidance.success) {
          throw new Error(guidance.message || "Failed AI analysis");
      }

      const topCareers = (guidance.topCareers || []).map((c: any, index: number) => ({
        ...c,
        id: c.title,
        colorClass: index === 0 ? "text-emerald-500 bg-emerald-50" : (index === 1 ? "text-blue-500 bg-blue-50" : "text-purple-500 bg-purple-50"),
        icon: index === 0 ? "work" : (index === 1 ? "rocket_launch" : "psychiatry"),
        tags: index === 0 ? ["Top Match", "AI Recommended"] : ["Great Option"]
      }));

      return {
        topCareers,
        roadmap: guidance.roadmap || [],
        guidanceMeta: guidance._meta
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchInterval: (query: any) => {
        const data = query.state?.data as any;
        return data?.guidanceMeta?.isRefreshing ? 3000 : false;
    }
  });

  const handleRegenerate = async (el: HTMLElement | null) => {
    fireConfettiFromElement(el);
    setFlashTrigger((t) => t + 1);
    setIsRegenerating(true);
    try {
      const guidanceRes = await fetch(`${import.meta.env.VITE_API_URL}/career-guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, regenerate: true }),
      });
      const guidance = await guidanceRes.json();
      if (guidance.success) {
        queryClient.setQueryData(['recommendations', userId, profileData?.updatedAt], {
            topCareers: (guidance.topCareers || []).map((c: any, index: number) => ({
                ...c,
                id: c.title,
                colorClass: index === 0 ? "text-emerald-500 bg-emerald-50" : (index === 1 ? "text-blue-500 bg-blue-50" : "text-purple-500 bg-purple-50"),
                icon: index === 0 ? "work" : (index === 1 ? "rocket_launch" : "psychiatry"),
                tags: index === 0 ? ["Top Match", "AI Recommended"] : ["Great Option"]
              })),
            roadmap: guidance.roadmap || [],
            guidanceMeta: guidance._meta
        });
        setActiveCareerTitle(guidance.topCareers[0]?.title);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSetTargetCareer = async (careerTitle: string, el: HTMLElement | null) => {
    setIsSettingTarget(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/target-career`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, selectedCareer: careerTitle }),
      });
      const json = await res.json();
      if (json.success) {
         fireConfettiFromElement(el);
         setShowCelebration(true);
         setTimeout(() => {
           window.location.reload();
         }, 1300);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSettingTarget(false);
    }
  };

  const activeCareer = useMemo(() => {
    const careers = data?.topCareers ?? [];
    if (!careers || careers.length === 0) return null;
    return careers.find((c: any) => c.title === activeCareerTitle)
        || careers.find((c: any) => c.title === profileData?.selectedCareer)
        || careers[0];
  }, [data, activeCareerTitle, profileData]);

  if (error) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh]"
        >
          <div className="text-red-500 mb-4"><span className="material-symbols-outlined text-[48px]">error</span></div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong.</h3>
          <p className="text-slate-500 font-medium">{(error as any)?.message || "Failed to load recommendations."}</p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => refetch()}
            className="mt-6 bg-[#00a878] text-white px-6 py-2 rounded-xl text-sm font-bold"
          >
            Try Again
          </motion.button>
        </motion.div>
      </DashboardLayout>
    )
  }

  const careers = data?.topCareers ?? [];

  if (isLoading || careers.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div className="w-64 h-10 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-48 h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 2xl:grid-cols-[1fr_340px] gap-8">
              <div className="space-y-6">
                 <div className="w-48 h-6 bg-slate-200 rounded animate-pulse"></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
                    <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
                    <div className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
                 </div>
              </div>
              <div className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium animate-pulse mt-4">Generating your AI recommendations...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Confetti trigger={confettiTrigger} originX={confettiOriginX} />
      <ScreenFlash trigger={flashTrigger} />
      <CelebrationToast show={showCelebration} text="Target Career Set!" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="min-w-0 w-full max-w-7xl mx-auto pb-10"
      >
        {/* Hero Header */}
        <section className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 mb-2">
              AI Career Guidance{' '}
              <motion.span
                className="material-symbols-outlined text-amber-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.3 }}
              >
                psychiatry
              </motion.span>
            </h2>
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="text-slate-500 text-sm"
            >
              Discover the best career paths that match your skills, interests and goals.
            </motion.p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
              {data?.guidanceMeta?.isRefreshing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-amber-50 text-amber-600 px-4 py-2 rounded-lg font-bold text-sm border border-amber-100 flex items-center gap-2 shadow-sm animate-pulse"
                  >
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      Refreshing recommendations...
                  </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.2 }}
                className="bg-[#e6f6f2] p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-[#00a878]/20 shadow-sm w-full md:w-auto"
              >
             <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0"
              >
                <span className="text-xl">✨</span>
              </motion.div>
              <div>
                <h5 className="text-sm font-bold text-slate-900">AI Powered</h5>
                <p className="text-xs text-slate-500">Generated specifically for you</p>
              </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => handleRegenerate(e.currentTarget)}
                disabled={isRegenerating || data?.guidanceMeta?.isRefreshing}
                className="text-xs bg-[#00a878] text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
                <span className={`material-symbols-outlined text-[16px] ${(isRegenerating || data?.guidanceMeta?.isRefreshing) ? 'animate-spin' : ''}`}>refresh</span>
                {isRegenerating ? "Regenerating..." : "Regenerate Recommendations"}
            </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_340px] gap-8 min-w-0">

          {/* LEFT COLUMN */}
          <div className="space-y-10 min-w-0">
            {/* Top Career Matches */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold text-slate-900">Top 3 Career Matches for You</h3>
              </div>

              <motion.div
                variants={containerStagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {careers.map((match: any, idx: number) => {
                  const isActive = activeCareer && match.title === activeCareer.title;
                  const isTop = idx === 0;
                  return (
                    <TiltCard
                      key={match.title}
                      onClick={() => setActiveCareerTitle(match.title)}
                      isActive={isActive}
                      className={`p-5 bg-white rounded-2xl cursor-pointer min-w-0 transition-colors ${isActive ? 'border-2 border-[#00a878] shadow-md' : 'border border-slate-200 opacity-80 hover:opacity-100'}`}
                    >
                      <div className="flex justify-between items-start mb-4 h-6">
                        {isTop && <span className="bg-yellow-400 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider">Top Match</span>}
                        {isTop && (
                          <motion.span
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3 }}
                            className="text-yellow-400 text-lg leading-none"
                          >
                            ★
                          </motion.span>
                        )}
                      </div>
                      <div className="flex flex-col items-center mb-6 pt-2">
                        <motion.div
                          whileHover={{ rotate: 8, scale: 1.1 }}
                          className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center mb-3 ${match.colorClass}`}
                        >
                            <span className="material-symbols-outlined text-[32px]">{match.icon}</span>
                        </motion.div>
                        <h4 className="text-[15px] font-extrabold mb-1 text-slate-900 text-center">{match.title}</h4>
                        <AnimatedCounter
                          value={match.matchPercentage}
                          className={`${match.colorClass.split(' ')[0]} text-[12px] font-bold`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {match.tags.map((tag: string) => (
                          <span key={tag} className="bg-slate-50 text-[10px] text-slate-500 px-2 py-1 rounded border border-slate-100">{tag}</span>
                        ))}
                      </div>
                      <div className={`block text-center w-full py-2 transition-colors text-[12px] font-bold rounded-lg ${isActive ? 'bg-[#e6f6f2] text-[#00a878] border border-[#00a878]/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        {isActive ? 'Viewing Details' : 'View Details →'}
                      </div>
                    </TiltCard>
                  )
                })}
              </motion.div>
            </section>

            {/* Career Details Section */}
            <AnimatePresence mode="wait">
            {activeCareer && (
            <motion.section
              key={activeCareer.title}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl font-extrabold text-slate-900">{activeCareer.title}</h3>
                  <span className="bg-emerald-50 text-[#00a878] px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1">
                    <AnimatedCounter value={activeCareer.matchPercentage} /> AI Match
                  </span>
                </div>
              </div>

              <div className="space-y-8 min-w-0 flex-1">
                <div className="bg-slate-50 p-5 rounded-2xl">
                    <h5 className="text-sm font-extrabold text-slate-900 mb-2">AI Reasoning</h5>
                    <TypewriterText
                      text={activeCareer.reason}
                      className="text-sm text-slate-600 leading-relaxed font-medium min-h-[3em]"
                    />
                </div>

                <div className="flex justify-end">
                    <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={(e) => handleSetTargetCareer(activeCareer.title, e.currentTarget)}
                       disabled={isSettingTarget || profileData?.selectedCareer === activeCareer.title}
                       className="bg-[#00a878] text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                       {isSettingTarget ? (
                          <><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Setting...</>
                       ) : profileData?.selectedCareer === activeCareer.title ? (
                          <><span className="material-symbols-outlined text-[18px]">check_circle</span> Target Career Set</>
                       ) : (
                          <><span className="material-symbols-outlined text-[18px]">flag</span> Set as Target Career</>
                       )}
                    </motion.button>
                </div>
              </div>
            </motion.section>
            )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8 min-w-0">
            {/* Learning Path Preview */}
            <motion.section
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-extrabold text-slate-900">Recommended Steps</h3>
              </div>

              <motion.div
                variants={containerStagger}
                initial="hidden"
                animate="show"
                className="space-y-8 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent"
              >
                {data?.roadmap?.slice(0, 5).map((step: any, idx: number) => (
                  <motion.div key={idx} variants={stepItem} className="relative flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className={`w-6 h-6 shrink-0 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold relative z-10 shadow-sm ring-4 ring-white`}
                    >
                      {idx + 1}
                    </motion.div>
                    <div className="pt-0.5">
                      <h6 className="text-sm font-extrabold text-slate-900 mb-1">{step.step}</h6>
                      <p className="text-xs text-slate-500 font-medium">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
