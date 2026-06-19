import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

import { generateCareerRecommendations } from '../../../services/recommendation-service'
import type { RecommendationResult, RecommendedCareer } from '../../../services/recommendation-service'

export const Route = createFileRoute('/_authenticated/recommendation/')({
  component: CareerGuidancePage,
})

function CareerGuidancePage() {
  const context = useRouteContext({ strict: false }) as any;
  const profile = context?.profile || null;
  const completionPercentage = context?.completionPercentage || 0;
  
  const [data, setData] = useState<RecommendationResult | null>(null)
  const [activeCareer, setActiveCareer] = useState<RecommendedCareer | null>(null)
  
  useEffect(() => {
    const recommendations = generateCareerRecommendations(profile);
    setData(recommendations);
    if (recommendations.topMatches.length > 0) {
      setActiveCareer(recommendations.topMatches[0]);
    }
  }, [profile, completionPercentage])


  if (!data || !activeCareer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-emerald-600"></div>
           <p className="mt-4 text-slate-500 font-medium">Analyzing your profile to generate recommendations...</p>
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
            Career Guidance <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
          </h2>
          <p className="text-slate-500 text-sm">Discover the best career paths that match your skills, interests and goals.</p>
        </div>
        <div className="bg-white p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-slate-100 shadow-sm w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">Need Help Deciding?</h5>
              <p className="text-xs text-slate-400">Ask our AI Assistant for personalized advice</p>
            </div>
          </div>
          <button className="bg-[#00a878] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#008b63] transition-all whitespace-nowrap w-full sm:w-auto justify-center">
            Ask CareerAI 
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
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
               <a href="#" className="text-[#00a878] text-sm font-bold flex items-center gap-1 hover:underline shrink-0">
                 View All 
                 <span className="material-symbols-outlined text-[16px] hidden sm:block">arrow_forward</span>
               </a>
             </div>
             
             {/* Cards Grid Container */}
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
               {data.topMatches.map((match, idx) => {
                 const isTop = idx === 0;
                 return (
                   <div 
                     key={match.id} 
                     onClick={() => setActiveCareer(match)}
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
                       {match.tags.slice(0, 2).map(tag => (
                         <span key={tag} className="bg-slate-50 text-[10px] text-slate-500 px-2 py-1 rounded border border-slate-100">{tag}</span>
                       ))}
                     </div>
                     <button className={`w-full py-2 transition-colors text-[12px] font-bold rounded-lg ${isTop ? 'bg-[#e6f6f2] text-[#00a878] hover:bg-[#d0efe6] border border-[#00a878]/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                       View Details →
                     </button>
                   </div>
                 )
               })}
             </div>
           </section>

           {/* Career Details Section */}
           <section className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
               <div className="flex items-center gap-3 flex-wrap">
                 <h3 className="text-xl font-extrabold text-slate-900">Career Details: {activeCareer.title}</h3>
                 <span className="bg-emerald-50 text-[#00a878] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{activeCareer.matchScore}% Match</span>
               </div>
               <button className="text-slate-400 hover:text-slate-600 hidden sm:block shrink-0">
                 <span className="material-symbols-outlined">bookmark_border</span>
               </button>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 mb-3">Required Skills</h5>
                      <ul className="space-y-2">
                        {activeCareer.requiredSkills.slice(0, 4).map(skill => (
                          <li key={skill} className="flex items-center gap-2 text-xs text-slate-600 font-medium"><span className="text-[#00a878]">✔</span> {skill}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 mb-3">Top Industries</h5>
                      <ul className="space-y-2">
                         {activeCareer.topIndustries.slice(0, 3).map(industry => (
                          <li key={industry} className="flex items-center gap-2 text-xs text-slate-600 font-medium"><span className="text-slate-300 text-lg leading-none">•</span> {industry}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-100">
                    <button className="bg-[#00a878] hover:bg-[#008b63] text-white py-3 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 flex-1 w-full transition-colors shadow-sm">
                      Explore Learning Path
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                    <button className="border border-slate-200 hover:bg-slate-50 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 flex items-center justify-center gap-2 w-full sm:w-auto transition-colors">
                      <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                      Save as Goal
                    </button>
                  </div>
                </div>
             </div>
           </section>

           {/* Other Good Options */}
           <section>
             <h3 className="text-lg font-extrabold text-slate-900 mb-5">Other Good Career Options</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {data.otherOptions.map(option => (
                 <div key={option.title} onClick={() => setActiveCareer(option)} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
           {/* AI Recommendation Card */}
           <section className="bg-[#e6f6f2] p-6 sm:p-8 rounded-3xl relative overflow-hidden">
             {/* Background elements */}
             <div className="absolute top-4 right-4 text-[#00a878]/20 text-3xl select-none">✦</div>
             <div className="absolute bottom-4 left-4 text-[#00a878]/20 text-3xl select-none">✦</div>
             
             <h3 className="text-lg font-extrabold text-slate-900 mb-6 text-center relative z-10">AI Career Recommendation</h3>
             
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
               
               <p className="text-center text-sm leading-relaxed text-slate-700 font-medium">
                 "Based on your profile, skills, and goals, <span className="text-[#00a878] font-extrabold">{data.aiRecommendation.career}</span> is the best match for you!"
               </p>
             </div>
             
             <div className="space-y-4 relative z-10 bg-white/60 p-5 rounded-2xl backdrop-blur-sm">
               <p className="text-sm font-extrabold text-slate-900">Why this career?</p>
               <ul className="space-y-3">
                 {data.aiRecommendation.reasons.map((reason, idx) => (
                   <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 font-medium leading-snug">
                     <span className="w-5 h-5 shrink-0 bg-[#00a878]/10 text-[#00a878] rounded-full flex items-center justify-center text-[10px] mt-px">✔</span> 
                     {reason}
                   </li>
                 ))}
               </ul>
             </div>
           </section>

           {/* Learning Path Preview */}
           <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-extrabold text-slate-900">Learning Path Preview</h3>
               <a href="#" className="text-[#00a878] text-xs font-bold hover:underline shrink-0 ml-4">View Full Roadmap →</a>
             </div>
             
             <div className="space-y-8 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
               
               {data.roadmap.map(step => (
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
