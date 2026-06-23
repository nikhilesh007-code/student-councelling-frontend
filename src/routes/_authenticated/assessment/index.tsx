import { createFileRoute, useRouteContext, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

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

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['assessment-data', userId, profileData?.updatedAt],
    queryFn: async ({ signal }) => {
      if (!userId) throw new Error("No user session found. Please log in.");

      const careersRes = await fetch(`http://localhost:3000/api/careers?userId=${userId}`, { signal });
      if (!careersRes.ok) throw new Error("Failed to fetch careers data");
      
      const careersJson = await careersRes.json();
      const topCareerName = careersJson.data?.[0]?.name;

      const skillGapRes = await fetch("http://localhost:3000/api/skill-gap/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, targetCareer: topCareerName }),
        signal
      });

      const skillGapData = skillGapRes.ok ? await skillGapRes.json() : null;

      return {
        profile: profileData,
        careers: careersJson.data?.slice(0, 3) || [],
        allCareers: careersJson.data || [],
        skillGap: skillGapData
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const skillGapData = data?.skillGap;

  const { data: aiRoadmapData, isLoading: aiRoadmapLoading } = useQuery({
    queryKey: ['assessment-ai', userId, skillGapData?.career],
    queryFn: async ({ signal }) => {
      const aiRes = await fetch("http://localhost:3000/api/skill-gap/analyze/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          careerName: skillGapData.career,
          currentSkills: skillGapData.currentSkills,
          missingSkills: skillGapData.missingSkills,
          readinessScore: skillGapData.readinessScore
        }),
        signal
      }).then(r => r.json());

      if (aiRes.success) {
        return {
          roadmap: aiRes.roadmap || [],
          projects: aiRes.projects || [],
          studyPlan: aiRes.studyPlan || "",
          estimatedTimeline: aiRes.estimatedTimeline || ""
        };
      }
      throw new Error("Failed AI roadmap");
    },
    enabled: !!skillGapData?.success,
    staleTime: Infinity,
  });

  const handleRegenerate = async () => {
    if (!skillGapData) return;
    setIsRegenerating(true);
    try {
      const aiRes = await fetch("http://localhost:3000/api/skill-gap/analyze/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          careerName: skillGapData.career,
          currentSkills: skillGapData.currentSkills,
          missingSkills: skillGapData.missingSkills,
          readinessScore: skillGapData.readinessScore,
          regenerate: true
        })
      }).then(r => r.json());

      if (aiRes.success) {
        queryClient.setQueryData(['assessment-ai', userId, skillGapData?.career], {
          roadmap: aiRes.roadmap || [],
          projects: aiRes.projects || [],
          studyPlan: aiRes.studyPlan || "",
          estimatedTimeline: aiRes.estimatedTimeline || ""
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          {/* Skeletons to replace blank loading */}
          <div className="w-64 h-8 bg-slate-200 rounded animate-pulse"></div>
          <div className="w-full max-w-2xl h-4 bg-slate-100 rounded animate-pulse"></div>
          <div className="w-full max-w-4xl h-40 bg-slate-100 rounded-xl animate-pulse mt-8"></div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Analyzing your skills and generating dynamic gap report...</p>
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

  const profile = data?.profile;
  const careers = data?.careers;
  const topCareer = careers && careers.length > 0 ? careers[0] : null;

  // Prepare required arrays
  // Handle profile interests string or array
  let interests = profile?.interests || [];
  if (typeof interests === 'string') {
    interests = interests.split(',').map(i => i.trim());
  }

  // Handle profile skills string or array
  let topSkills = profile?.skills || [];
  if (typeof topSkills === 'string') {
    topSkills = topSkills.split(',').map(i => i.trim());
  }

  const aiCareers = (careers || []).map((c: any, idx: number) => ({
    title: c.name,
    match: c.matchScore,
    icon: idx === 0 ? 'code' : idx === 1 ? 'bar_chart' : 'smart_toy',
    active: idx === 0,
    color: idx === 0 ? 'emerald' : idx === 1 ? 'blue' : 'purple'
  }));

  let comparison: any = null;
  let insights: any = null;
  let actionPlan: any[] = [];
  let roadmapData: any = null;
  let targetCareerId: string | null = null;

  const skillGap = data?.skillGap;

  if (skillGap && skillGap.success) {
    const matched = skillGap.matchedSkills || [];
    const missing = skillGap.missingSkills || [];
    
    // Find the target career object to get its ID
    const targetCareerObj = data?.allCareers?.find((c: any) => 
      c.name === skillGap.career || 
      (skillGap.career?.name && c.name === skillGap.career.name)
    );
    // Support if backend returned an object or string
    targetCareerId = skillGap.career?.id || targetCareerObj?.id || null;
    
    let combinedSkills: any[] = [];
    if (skillGap.skillMatches) {
      combinedSkills = skillGap.skillMatches.map((match: any) => ({
        current: match.matchedWith || 'Not learned yet',
        required: match.requiredSkill,
        status: match.matchType, // 'Exact', 'Partial', 'Related', 'Missing'
        reason: match.reason
      }));
    } else {
      // Fallback if skillMatches is missing
      combinedSkills = [
        ...matched.map((s: string) => ({ current: s, required: s, status: 'Exact' })),
        ...missing.map((s: string) => ({ current: 'Not learned yet', required: s, status: 'Missing' }))
      ];
    }

    comparison = {
      targetCareer: skillGap.career,
      matchScore: skillGap.readinessScore,
      skills: combinedSkills
    };

    insights = {
      missingSkills: missing,
      progress: {
        have: skillGap.readinessScore,
        partial: 0,
        missing: skillGap.gapScore
      },
      summary: skillGap.summary
    };

    actionPlan = missing.slice(0, 3).map((skill: string, idx: number) => ({
      step: idx + 1,
      title: `Master ${skill}`,
      action: 'Explore Courses',
      color: idx === 0 ? 'red' : 'yellow'
    }));

    roadmapData = aiRoadmapData;
  }

  // Calculate circumference for radial progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.2
  const progressHave = insights?.progress.have || 0;
  const strokeDashoffset = circumference - (progressHave / 100) * circumference;

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Skill Gap Analysis
              <span className="material-symbols-outlined text-[#00a878] text-3xl">bar_chart</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl font-medium">
              Compare your current skills with industry requirements and close the gap to achieve your dream career.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm bg-white shrink-0">
            <span className="material-symbols-outlined text-lg">download</span>
            Download Report
          </button>
        </div>

        {/* Row 1: Profile & Top Careers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 min-w-0">
          
          {/* Profile Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6">Your Profile Summary</h3>
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Your Interests</p>
              <div className="flex flex-wrap gap-2">
                {interests.length > 0 ? interests.map((interest: string) => (
                  <span key={interest} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-700">
                    {interest}
                  </span>
                )) : (
                  <span className="text-slate-400 text-sm">No interests listed.</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Your Top Skills</p>
              <div className="flex flex-wrap gap-2">
                {topSkills.length > 0 ? topSkills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                    {skill}
                  </span>
                )) : (
                  <span className="text-slate-400 text-sm">No skills listed.</span>
                )}
              </div>
            </div>
          </div>

          {/* AI Recommended Top Careers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 min-w-0">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6">AI Recommended Top Careers for You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {aiCareers.map((career: any, idx: number) => (
                <div key={idx} className={`rounded-xl p-5 relative transition-all min-w-0 ${career.active ? 'border-2 border-[#00a878] bg-[#00a878]/5 shadow-sm' : 'border border-slate-200 hover:border-[#00a878]/50 hover:bg-slate-50 cursor-pointer opacity-80 hover:opacity-100'}`}>
                  {career.active && (
                    <div className="absolute top-3 right-3 text-[#00a878]">
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    career.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                    career.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <span className="material-symbols-outlined">{career.icon}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1 truncate" title={career.title}>{career.title}</h4>
                  <p className={`text-xs font-bold ${career.active ? 'text-[#00a878]' : 'text-slate-500'}`}>{career.match}% Match</p>
                </div>
              ))}
              {aiCareers.length === 0 && (
                <div className="col-span-3 text-slate-500 text-sm text-center py-4">No careers found.</div>
              )}
            </div>
            <div className="mt-5 flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="material-symbols-outlined text-lg text-blue-500">info</span>
              Based on your Recommendation Engine results.
            </div>
          </div>

        </div>

        {/* Row 2: Skills Comparison & Insights */}
        {comparison && insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 min-w-0">
          
          {/* Skills Comparison Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 min-w-0 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                Skills Comparison: You vs Required
                <span className="inline-block px-2.5 py-1 bg-[#00a878]/10 text-[#00a878] rounded-md text-xs border border-[#00a878]/20 whitespace-nowrap">{comparison.matchScore}% Match</span>
              </h3>
              <div className="flex gap-4 text-xs font-bold text-slate-600 shrink-0 flex-wrap">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#00a878]"></div> Exact</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Partial</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Related</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Missing</div>
              </div>
            </div>
            
            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 max-h-[400px] overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Your Current Skills</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Required for {comparison.targetCareer}</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Skill Gap</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {comparison.skills.map((skill: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 pr-4 align-top">
                        {skill.current === 'Not learned yet' ? (
                          <span className="text-slate-400 italic font-medium">{skill.current}</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-semibold text-slate-700">
                              <span className="material-symbols-outlined text-[#00a878] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 
                              {skill.current}
                            </div>
                            {skill.reason && skill.status !== 'Exact' && (
                                <span className="text-xs text-slate-500 italic pl-6">{skill.reason}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className={`py-3.5 pr-4 align-top font-semibold ${skill.status === 'Missing' ? 'text-red-600' : 'text-slate-900'}`}>
                        {skill.required}
                      </td>
                      <td className="py-3.5 align-top">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide
                          ${skill.status === 'Exact' ? 'bg-[#00a878]/10 text-[#00a878] border border-[#00a878]/20' : 
                            skill.status === 'Partial' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            skill.status === 'Related' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-red-50 text-red-600 border border-red-100'}`}
                        >
                          {skill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {comparison.skills.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">No skills required for this career.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Insights & Action Plan */}
          <div className="flex flex-col gap-6 min-w-0">
            
            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                AI Insights
              </h3>
              <div className="flex items-start gap-3 mb-5 bg-[#00a878]/5 border border-[#00a878]/10 p-4 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-[#00a878]">robot_2</span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {insights.summary || (insights.progress.missing === 0 ? 
                    `Excellent! You already have all the required skills for a ${comparison.targetCareer} role.` :
                    `Based on your profile, bridging these skill gaps will significantly increase your chances of becoming a ${comparison.targetCareer}.`)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-red-500 mb-3 uppercase tracking-wider">Top Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {insights.missingSkills.length > 0 ? insights.missingSkills.slice(0, 5).map((skill: string) => (
                    <span key={skill} className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 rounded-md font-bold text-xs">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-slate-500 text-sm italic">None!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Match Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-5">Overall Progress</h3>
              <div className="flex items-center gap-6">
                
                {/* Real Radial Progress */}
                <div className="relative w-[100px] h-[100px] shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-slate-100" cx="50" cy="50" fill="transparent" r={radius} stroke="currentColor" strokeWidth="10"></circle>
                    <circle className="text-[#00a878] transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r={radius} stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="10"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl text-slate-900 font-black leading-none">{insights.progress.have}%</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3.5">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5"><span className="text-slate-700">Skills You Have</span><span className="text-slate-500">{insights.progress.have}%</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-[#00a878] h-1.5 rounded-full" style={{ width: `${insights.progress.have}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5"><span className="text-slate-700">Missing Skills</span><span className="text-slate-500">{insights.progress.missing}%</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${insights.progress.missing}%` }}></div></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-slate-500 font-medium">
             No career data available to perform skill gap analysis.
          </div>
        )}

        {/* Row 3: AI-Generated Learning Roadmap */}
        {(aiRoadmapLoading && !roadmapData) || isRegenerating ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 min-w-0 mt-6 flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-[#00a878]/20 rounded-full animate-spin border-t-[#00a878]"></div>
             <p className="mt-4 text-slate-500 font-medium">Generating your personalized learning roadmap...</p>
          </div>
        ) : roadmapData && (roadmapData.roadmap?.length > 0 || roadmapData.projects?.length > 0) ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0 relative overflow-hidden mt-6">
            {/* Background elements */}
            <div className="absolute top-4 right-4 text-[#00a878]/10 text-6xl select-none material-symbols-outlined">auto_awesome</div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00a878]">route</span>
                  AI Learning Roadmap
                </h3>
                <button 
                  onClick={handleRegenerate} 
                  disabled={aiRoadmapLoading || isRegenerating}
                  className="text-xs bg-white text-[#00a878] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <span className={`material-symbols-outlined text-[14px] ${isRegenerating ? 'animate-spin' : ''}`}>refresh</span>
                  Regenerate
                </button>
              </div>
              {targetCareerId ? (
                <Link 
                  className="bg-[#00a878] text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm shadow-emerald-200 hover:bg-[#008b63] transition-colors shrink-0"
                  to="/careers/$careerId"
                  params={{ careerId: targetCareerId }}
                >
                    View Full Details <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              
              {/* Left Column: Timeline Steps */}
              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-[15px] font-extrabold text-slate-900 mb-4">Step-by-Step Plan</h4>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
                  
                  {roadmapData.roadmap.map((plan: any, index: number) => {
                    const safeColors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                    const colorClass = safeColors[index % safeColors.length];
                    const stepNum = plan.number ?? plan.step ?? (index + 1);
                    return (
                    <div key={index} className="relative flex items-start gap-4 md:gap-6">
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-[15px] text-white shadow-sm ring-4 ring-white relative z-10 ${colorClass}`}>
                        {stepNum}
                      </div>
                      <div className="pt-1.5 flex-1 min-w-0">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                          <h4 className="font-extrabold text-[15px] text-slate-900 mb-1">{plan.title}</h4>
                          <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{plan.desc}</p>
                        </div>
                      </div>
                    </div>
                    );
                  })}

                </div>
              </div>

              {/* Right Column: Projects & Plan Details */}
              <div className="space-y-6">
                {roadmapData.projects && roadmapData.projects.length > 0 && (
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                    <h4 className="text-[14px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500">code_blocks</span>
                      Recommended Projects
                    </h4>
                    <ul className="space-y-3">
                      {roadmapData.projects.map((proj: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2.5 text-[13px] text-slate-700 font-medium leading-snug">
                          <span className="material-symbols-outlined text-[16px] text-blue-500 shrink-0 mt-px">integration_instructions</span>
                          <span>
                            {typeof proj === 'string' ? proj : (
                              <>
                                <div>{proj.description || JSON.stringify(proj)}</div>
                                {proj.timeEstimate && <span className="text-slate-500 text-[11px] block mt-1">{proj.timeEstimate}</span>}
                              </>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {roadmapData.studyPlan && (
                  <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100">
                    <h4 className="text-[14px] font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500">calendar_month</span>
                      Weekly Study Plan
                    </h4>
                    <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                      {roadmapData.studyPlan}
                    </p>
                  </div>
                )}

                {roadmapData.estimatedTimeline && (
                  <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
                    <h4 className="text-[14px] font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500">schedule</span>
                      Estimated Timeline
                    </h4>
                    <p className="text-[15px] font-black text-purple-700">
                      {roadmapData.estimatedTimeline}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : null}

      </div>
    </DashboardLayout>
  )
}
