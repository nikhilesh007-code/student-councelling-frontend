import { createFileRoute, useRouteContext, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

import type { RecommendationResult, RecommendedCareer } from '../../../services/recommendation-service'

export const Route = createFileRoute('/_authenticated/recommendation/')({
  component: CareerGuidancePage,
})

function CareerGuidancePage() {
  const context = useRouteContext({ strict: false }) as any;
  const sessionUser = context?.sessionUser;
  const userId = sessionUser?.id;
  const profileData = context?.profile;

  const [activeCareerId, setActiveCareerId] = useState<string | number | null>(null);
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Main Query for Recommendations Data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendations', userId, profileData?.updatedAt],
    queryFn: async ({ signal }) => {
      if (!userId) throw new Error("No user ID found");

      // Fetch Skill Gap and Careers concurrently
      const [skillGapRes, careersRes, guidanceRes] = await Promise.all([
        fetch("http://localhost:3000/api/skill-gap/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
          signal,
        }),
        fetch(`http://localhost:3000/api/careers?userId=${userId}`, {
          credentials: "include",
          signal,
        }),
        fetch("http://localhost:3000/api/career-guidance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
          signal,
        })
      ]);

      if (!skillGapRes.ok || !guidanceRes.ok) {
        throw new Error("Failed to fetch recommendation data");
      }

      const [skillGap, careersDataRes, guidance] = await Promise.all([
        skillGapRes.json(),
        careersRes.ok ? careersRes.json() : { data: [] },
        guidanceRes.json()
      ]);

      const careersData = careersDataRes.success ? careersDataRes.data : [];

      // Map careers to Top Matches
      const mappedCareers = careersData.map((c: any, index: number) => ({
        id: c.id,
        title: c.name,
        matchScore: c.matchScore || c.readinessScore || 80,
        averageSalary: c.salaryRange || "₹8 - 15 LPA",
        demandLevel: "High",
        jobGrowth: "Excellent",
        requiredSkills: c.matchedSkills?.length ? c.matchedSkills : c.requiredSkills?.slice(0, 3) || [],
        recommendedSkills: c.missingSkills || [],
        recommendedCertifications: [],
        topIndustries: ["IT", "Software", "Tech"],
        tags: index === 0 ? ["AI Recommended"] : ["Good Match"],
        icon: "work",
        colorClass: index === 0 ? "text-emerald-500 bg-emerald-50" : "text-blue-500 bg-blue-50",
      }));

      const topMatches = mappedCareers.slice(0, 3);
      const otherOptions = mappedCareers.slice(3, 9);

      if (topMatches.length === 0) {
        topMatches.push({
          id: 1,
          title: skillGap.career,
          matchScore: skillGap.readinessScore,
          averageSalary: "₹8 - 15 LPA",
          demandLevel: "High",
          jobGrowth: "Excellent",
          requiredSkills: skillGap.matchedSkills || [],
          recommendedSkills: skillGap.missingSkills || [],
          recommendedCertifications: [],
          topIndustries: ["IT", "Software"],
          tags: ["AI Recommended"],
          icon: "code",
          colorClass: "text-emerald-500 bg-emerald-50",
        });
      }

      const primaryMatch = topMatches[0];

      return {
        topMatches,
        otherOptions,
        guidanceData: guidance.success ? guidance : null,
        primaryMatch,
        roadmap: [
          {
            step: 1,
            title: "Learn Missing Skills",
            desc: primaryMatch.recommendedSkills.slice(0, 3).join(", ") || "Focus on building advanced projects.",
            color: "bg-emerald-500",
          },
        ]
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for AI Insights (runs only if guidanceData exists)
  const guidanceData = data?.guidanceData;
  const { data: aiInsights, isLoading: aiInsightsLoading } = useQuery({
    queryKey: ['recommendations-ai', userId, guidanceData?.career],
    queryFn: async ({ signal }) => {
      const aiRes = await fetch("http://localhost:3000/api/career-guidance/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          studentSkills: guidanceData.studentSkills,
          interests: guidanceData.interests,
          careerGoal: guidanceData.careerGoal,
          careerName: guidanceData.career,
          matchScore: guidanceData.matchScore,
          missingSkills: guidanceData.missingSkills
        }),
        signal
      }).then(r => r.json());

      if (aiRes.success) {
        return {
          explanation: aiRes.aiExplanation,
          reasons: aiRes.nextSteps
        };
      }
      throw new Error("Failed AI guidance");
    },
    enabled: !!guidanceData,
    staleTime: Infinity, // Never re-fetch AI insights if cached
  });

  const handleRegenerate = async () => {
    if (!guidanceData) return;
    setIsRegenerating(true);
    try {
      const aiRes = await fetch("http://localhost:3000/api/career-guidance/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          studentSkills: guidanceData.studentSkills,
          interests: guidanceData.interests,
          careerGoal: guidanceData.careerGoal,
          careerName: guidanceData.career,
          matchScore: guidanceData.matchScore,
          missingSkills: guidanceData.missingSkills,
          regenerate: true
        })
      }).then(r => r.json());

      if (aiRes.success) {
        queryClient.setQueryData(['recommendations-ai', userId, guidanceData?.career], {
          explanation: aiRes.aiExplanation,
          reasons: aiRes.nextSteps
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const activeCareer = useMemo(() => {
    if (!data) return null;
    return data.topMatches.find((c: any) => c.id === activeCareerId) 
        || data.otherOptions.find((c: any) => c.id === activeCareerId) 
        || data.primaryMatch;
  }, [data, activeCareerId]);

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

  if (isLoading || !data || !activeCareer) {
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
          <p className="text-slate-500 font-medium animate-pulse mt-4">Analyzing your profile to generate recommendations...</p>
        </div>
      </DashboardLayout>
    )
  }

  console.log('[CAREER PAGE DATA]', data);
  console.log('[TOP MATCHES]', data?.topMatches);
  console.log('[PRIMARY MATCH]', data?.primaryMatch);

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        {/* Hero Header */}
        <section className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 mb-2">
              Career Guidance <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
            </h2>
            <p className="text-slate-500 text-sm">Discover the best career paths that match your skills, interests and goals.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-slate-100 shadow-sm w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900">Career Insights</h5>
                <p className="text-xs text-slate-500">Your profile aligns well with software development roles.</p>
              </div>
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
                <h3 className="text-lg font-extrabold text-slate-900">Top Career Matches for You</h3>
                <Link to="/careers" className="text-[#00a878] text-sm font-bold flex items-center gap-1 hover:underline shrink-0">
                  View All
                  <span className="material-symbols-outlined text-[16px] hidden sm:block">arrow_forward</span>
                </Link>
              </div>

              {/* Cards Grid Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.topMatches.map((match: any, idx: number) => {
                  const isTop = idx === 0;
                  return (
                    <div
                      key={match.id}
                      onClick={() => setActiveCareerId(match.id)}
                      className={`p-5 bg-white rounded-2xl cursor-pointer min-w-0 transition-all ${isTop && match.id === activeCareer.id ? 'border-2 border-[#00a878] shadow-sm' : 'border border-slate-200 opacity-80 hover:opacity-100 hover:shadow-md'}`}
                    >
                      <div className="flex justify-between items-start mb-4 h-6">
                        {isTop && <span className="bg-yellow-400 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider">Recommended</span>}
                        {isTop && <span className="text-yellow-400 text-lg leading-none">★</span>}
                      </div>
                      <div className="flex flex-col items-center mb-6 pt-2">
                        <div className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center mb-3 ${match.colorClass}`}>
                          {match.icon.length > 2 ? (
                            <span className="material-symbols-outlined text-[32px]">{match.icon}</span>
                          ) : (
                            <span className="text-2xl">{match.icon}</span>
                          )}
                        </div>
                        <h4 className="text-[15px] font-extrabold mb-1 text-slate-900 text-center">{match.title}</h4>
                        <span className={`${match.colorClass.split(' ')[0]} text-[12px] font-bold`}>{match.matchScore}% Match</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {match.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="bg-slate-50 text-[10px] text-slate-500 px-2 py-1 rounded border border-slate-100">{tag}</span>
                        ))}
                      </div>
                      <Link to="/careers/$careerId" params={{ careerId: match.id.toString() }} className={`block text-center w-full py-2 transition-colors text-[12px] font-bold rounded-lg ${isTop ? 'bg-[#e6f6f2] text-[#00a878] hover:bg-[#d0efe6] border border-[#00a878]/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        View Details →
                      </Link>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Career Details Section */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-extrabold text-slate-900">Career Details: {activeCareer.title}</h3>
                  <span className="bg-emerald-50 text-[#00a878] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{activeCareer.matchScore}% Match</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 min-w-0">
                {/* Illustration Area */}
                <div className="relative mx-auto w-full max-w-[280px] lg:w-[240px] shrink-0">
                  <div className="w-full aspect-square lg:h-[240px] bg-slate-50 rounded-2xl relative overflow-hidden flex items-end justify-center border border-slate-100">
                    <div className="absolute top-6 left-6 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm"><span className="text-xs">🐍</span></div>
                    <div className="absolute top-8 right-6 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shadow-sm"><span className="text-xs">&lt;/&gt;</span></div>
                    <div className="absolute bottom-24 right-3 w-8 h-8 bg-red-50 rounded-full flex items-center justify-center shadow-sm"><span className="text-xs">☕</span></div>
                    <div className="absolute bottom-8 left-3 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shadow-sm"><span className="text-xs">⚛️</span></div>
                    {activeCareer.illustrationUrl && (
                      <img alt="Career Illustration" className="w-[80%] h-[80%] object-contain z-10 relative bottom-[-10px]" src={activeCareer.illustrationUrl} />
                    )}
                  </div>
                </div>

                {/* Stats & Info */}
                <div className="space-y-6 min-w-0 flex-1">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-[#00a878] text-lg shrink-0">💰</div>
                      <div>
                        <p className="text-[11px] text-slate-500 font-medium">Average Salary</p>
                        <p className="text-sm font-bold text-slate-900">{activeCareer.averageSalary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 text-lg shrink-0">🔥</div>
                      <div>
                        <p className="text-[11px] text-slate-500 font-medium">Demand Level</p>
                        <p className="text-sm font-bold text-slate-900">{activeCareer.demandLevel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 text-lg shrink-0">📈</div>
                      <div>
                        <p className="text-[11px] text-slate-500 font-medium">Job Growth</p>
                        <p className="text-sm font-bold text-slate-900">{activeCareer.jobGrowth}</p>
                      </div>
                    </div>
                  </div>

                  {/* Required Skills & Industries */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 pb-2">
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 mb-3">Required Skills</h5>
                      <ul className="space-y-2">
                        {activeCareer.requiredSkills.slice(0, 4).map((skill: string) => (
                          <li key={skill} className="flex items-center gap-2 text-xs text-slate-600 font-medium"><span className="text-[#00a878]">✔</span> {skill}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 mb-3">Top Industries</h5>
                      <ul className="space-y-2">
                        {activeCareer.topIndustries.slice(0, 3).map((industry: string) => (
                          <li key={industry} className="flex items-center gap-2 text-xs text-slate-600 font-medium"><span className="text-slate-300 text-lg leading-none">•</span> {industry}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Insights Section */}
            <section className="bg-[#e6f6f2] p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm border border-emerald-100 min-h-[300px]">
              {/* Background elements */}
              <div className="absolute top-4 right-4 text-[#00a878]/20 text-3xl select-none">✦</div>
              <div className="absolute bottom-4 left-4 text-[#00a878]/20 text-3xl select-none">✦</div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-extrabold text-slate-900">AI Insights</h3>
                <button 
                  onClick={handleRegenerate} 
                  disabled={aiInsightsLoading || isRegenerating}
                  className="text-xs bg-white text-[#00a878] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <span className={`material-symbols-outlined text-[14px] ${isRegenerating ? 'animate-spin' : ''}`}>refresh</span>
                  Regenerate
                </button>
              </div>

              {(aiInsightsLoading && !aiInsights) || isRegenerating ? (
                <div className="flex flex-col items-center justify-center h-40 relative z-10">
                   <div className="w-10 h-10 border-4 border-[#00a878]/20 rounded-full animate-spin border-t-[#00a878]"></div>
                   <p className="text-slate-500 font-medium mt-4 text-sm">Generating personalized career insights...</p>
                </div>
              ) : aiInsights ? (
                <>
                  <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="w-[120px] h-[120px] relative mb-6">
                      <div className="absolute inset-0 bg-[#00a878] rounded-full opacity-10 animate-pulse"></div>
                      <div className="w-full h-full border-4 border-[#00a878]/20 rounded-full flex items-center justify-center p-2 bg-white/50 backdrop-blur-sm">
                        <div className="w-full h-full bg-slate-900 rounded-full flex flex-col items-center justify-center gap-2 shadow-inner">
                          <div className="flex gap-4">
                            <div className="w-3 h-1 bg-[#00a878] rounded-full"></div>
                            <div className="w-3 h-1 bg-[#00a878] rounded-full"></div>
                          </div>
                          <div className="w-8 h-1 bg-[#00a878]/50 rounded-full"></div>
                        </div>
                      </div>
                      <div className="absolute -right-2 top-0 bg-white p-1.5 rounded-full shadow-sm text-lg">💡</div>
                    </div>

                    <p className="text-center text-sm leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
                      {aiInsights.explanation}
                    </p>
                  </div>

                  <div className="space-y-4 relative z-10 bg-white/60 p-5 rounded-2xl backdrop-blur-sm">
                    <p className="text-sm font-extrabold text-slate-900">Next Steps</p>
                    <ul className="space-y-3">
                      {aiInsights.reasons.map((reason: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-xs text-slate-700 font-medium leading-snug"
                        >
                          <span className="w-5 h-5 shrink-0 bg-[#00a878]/10 text-[#00a878] rounded-full flex items-center justify-center text-[10px] mt-px">
                            ✔
                          </span>
                          <div className="whitespace-pre-wrap break-words">
                            {typeof reason === 'string' ? reason : (
                              <>
                                <div>{reason.description || JSON.stringify(reason)}</div>
                                {reason.timeEstimate && <span className="text-slate-500 text-[11px] block mt-1">{reason.timeEstimate}</span>}
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 py-10 relative z-10">
                  <span className="material-symbols-outlined text-4xl mb-2">error</span>
                  <p>Could not generate insights at this time.</p>
                </div>
              )}
            </section>

            {/* Other Good Options */}
            <section>
              <h3 className="text-lg font-extrabold text-slate-900 mb-5">Other Good Career Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.otherOptions.map((option: any) => (
                  <div key={option.title} onClick={() => setActiveCareerId(option.id)} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${option.colorClass}`}>
                      {option.icon.length > 2 ? <span className="material-symbols-outlined text-[20px]">{option.icon}</span> : option.icon}
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <h6 className="text-sm font-bold text-slate-900 truncate">{option.title}</h6>
                      <p className={`text-xs font-bold ${option.colorClass.split(' ')[0]}`}>{option.matchScore}% Match</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8 min-w-0">


            {/* Learning Path Preview */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-extrabold text-slate-900">Learning Path Preview</h3>
                <a href="#" className="text-[#00a878] text-xs font-bold hover:underline shrink-0 ml-4">View Full Roadmap →</a>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">

                {data.roadmap.map((step: any) => (
                  <div key={step.step} className="relative flex items-start gap-4">
                    <div className={`w-6 h-6 shrink-0 ${step.color} text-white rounded-full flex items-center justify-center text-xs font-bold relative z-10 shadow-sm ring-4 ring-white`}>
                      {step.step}
                    </div>
                    <div className="pt-0.5">
                      <h6 className="text-sm font-extrabold text-slate-900 mb-1">{step.title}</h6>
                      <p className="text-xs text-slate-500 font-medium">{step.desc}</p>
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
