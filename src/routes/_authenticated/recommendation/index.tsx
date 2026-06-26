import { createFileRoute, useRouteContext, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/recommendation/')({
  component: CareerGuidancePage,
})

function CareerGuidancePage() {
  const context = useRouteContext({ strict: false }) as any;
  const sessionUser = context?.sessionUser;
  const userId = sessionUser?.id;
  const profileData = context?.profile;

  const [activeCareerTitle, setActiveCareerTitle] = useState<string | null>(profileData?.selectedCareer || null);
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSettingTarget, setIsSettingTarget] = useState(false);

  // Main Query for Recommendations Data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendations', userId, profileData?.updatedAt],
    queryFn: async ({ signal }) => {
      if (!userId) throw new Error("No user ID found");

      const guidanceRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/career-guidance`, {
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchInterval: (query: any) => {
        const data = query.state?.data as any;
        return data?.guidanceMeta?.isRefreshing ? 3000 : false;
    }
  });

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const guidanceRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/career-guidance`, {
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

  const handleSetTargetCareer = async (careerTitle: string) => {
    setIsSettingTarget(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/profile/target-career`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, selectedCareer: careerTitle }),
      });
      const json = await res.json();
      if (json.success) {
         // Reload profile context so it knows the new selected career globally
         window.location.reload(); 
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
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-red-500 mb-4"><span className="material-symbols-outlined text-[48px]">error</span></div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong.</h3>
          <p className="text-slate-500 font-medium">{(error as any)?.message || "Failed to load recommendations."}</p>
          <button onClick={() => refetch()} className="mt-6 bg-[#00a878] text-white px-6 py-2 rounded-xl text-sm font-bold">Try Again</button>
        </div>
      </DashboardLayout>
    )
  }

  const careers = data?.topCareers ?? [];

  if (isLoading || careers.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
              <div className="w-64 h-10 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-48 h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
            </div>
            {/* Grid Skeleton */}
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
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        {/* Hero Header */}
        <section className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 mb-2">
              AI Career Guidance <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>psychiatry</span>
            </h2>
            <p className="text-slate-500 text-sm">Discover the best career paths that match your skills, interests and goals.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
              {data?.guidanceMeta?.isRefreshing && (
                  <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-lg font-bold text-sm border border-amber-100 flex items-center gap-2 shadow-sm animate-pulse">
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      Refreshing recommendations...
                  </div>
              )}
              <div className="bg-[#e6f6f2] p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-[#00a878]/20 shadow-sm w-full md:w-auto">
             <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900">AI Powered</h5>
                <p className="text-xs text-slate-500">Generated specifically for you</p>
              </div>
            </div>
            <button 
                onClick={handleRegenerate} 
                disabled={isRegenerating || data?.guidanceMeta?.isRefreshing}
                className="text-xs bg-[#00a878] text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
                <span className={`material-symbols-outlined text-[16px] ${(isRegenerating || data?.guidanceMeta?.isRefreshing) ? 'animate-spin' : ''}`}>refresh</span>
                {isRegenerating ? "Regenerating..." : "Regenerate Recommendations"}
            </button>
            </div>
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

              {/* Cards Grid Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {careers.map((match: any, idx: number) => {
                  const isActive = activeCareer && match.title === activeCareer.title;
                  const isTop = idx === 0;
                  return (
                    <div
                      key={match.title}
                      onClick={() => setActiveCareerTitle(match.title)}
                      className={`p-5 bg-white rounded-2xl cursor-pointer min-w-0 transition-all ${isActive ? 'border-2 border-[#00a878] shadow-md' : 'border border-slate-200 opacity-80 hover:opacity-100 hover:shadow-md'}`}
                    >
                      <div className="flex justify-between items-start mb-4 h-6">
                        {isTop && <span className="bg-yellow-400 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider">Top Match</span>}
                        {isTop && <span className="text-yellow-400 text-lg leading-none">★</span>}
                      </div>
                      <div className="flex flex-col items-center mb-6 pt-2">
                        <div className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center mb-3 ${match.colorClass}`}>
                            <span className="material-symbols-outlined text-[32px]">{match.icon}</span>
                        </div>
                        <h4 className="text-[15px] font-extrabold mb-1 text-slate-900 text-center">{match.title}</h4>
                        <span className={`${match.colorClass.split(' ')[0]} text-[12px] font-bold`}>{match.matchPercentage}% Match</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {match.tags.map((tag: string) => (
                          <span key={tag} className="bg-slate-50 text-[10px] text-slate-500 px-2 py-1 rounded border border-slate-100">{tag}</span>
                        ))}
                      </div>
                      <div className={`block text-center w-full py-2 transition-colors text-[12px] font-bold rounded-lg ${isActive ? 'bg-[#e6f6f2] text-[#00a878] border border-[#00a878]/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        {isActive ? 'Viewing Details' : 'View Details →'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Career Details Section */}
            {activeCareer && (
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl font-extrabold text-slate-900">{activeCareer.title}</h3>
                  <span className="bg-emerald-50 text-[#00a878] px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">{activeCareer.matchPercentage}% AI Match</span>
                </div>
              </div>

              <div className="space-y-8 min-w-0 flex-1">
                <div className="bg-slate-50 p-5 rounded-2xl">
                    <h5 className="text-sm font-extrabold text-slate-900 mb-2">AI Reasoning</h5>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{activeCareer.reason}</p>
                </div>
                
                <div className="flex justify-end">
                    <button 
                       onClick={() => handleSetTargetCareer(activeCareer.title)}
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
                    </button>
                </div>
              </div>
            </section>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8 min-w-0">



            {/* Learning Path Preview */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-extrabold text-slate-900">Recommended Steps</h3>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">

                {data?.roadmap?.slice(0, 5).map((step: any, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className={`w-6 h-6 shrink-0 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold relative z-10 shadow-sm ring-4 ring-white`}>
                      {idx + 1}
                    </div>
                    <div className="pt-0.5">
                      <h6 className="text-sm font-extrabold text-slate-900 mb-1">{step.step}</h6>
                      <p className="text-xs text-slate-500 font-medium">{step.description}</p>
                    </div>
                  </div>
                ))}

              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
