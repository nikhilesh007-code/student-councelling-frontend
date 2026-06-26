import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { formatDistanceToNow, format, isPast } from 'date-fns'

export const Route = createFileRoute('/_authenticated/opportunities/')({
  component: OpportunitiesPage,
})

function CompanyLogo({ logo, company, size = "large" }: { logo?: string; company: string; size?: "small" | "medium" | "large" }) {
  const [imgError, setImgError] = useState(false);

  const colors = [
    "bg-red-50 text-red-600 border-red-100", 
    "bg-blue-50 text-blue-600 border-blue-100", 
    "bg-emerald-50 text-emerald-600 border-emerald-100", 
    "bg-purple-50 text-purple-600 border-purple-100", 
    "bg-amber-50 text-amber-600 border-amber-100", 
    "bg-indigo-50 text-indigo-600 border-indigo-100",
    "bg-pink-50 text-pink-600 border-pink-100"
  ];
  const charCode = company ? company.charCodeAt(0) : 0;
  const colorClass = colors[charCode % colors.length];

  const initials = company ? company.substring(0, 1).toUpperCase() : "NA";

  // Naive domain guess for clearbit
  const guessDomain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  const clearbitLogo = `https://logo.clearbit.com/${guessDomain}`;
  const targetLogo = logo || clearbitLogo;

  const containerClass = size === "large" 
    ? "w-16 h-16 rounded-2xl text-2xl" 
    : size === "medium" 
      ? "w-12 h-12 rounded-xl text-xl" 
      : "w-10 h-10 rounded-xl text-lg";

  if (targetLogo && !imgError) {
    return (
      <div className={`${containerClass} bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0`}>
         <img src={targetLogo} alt={company} onError={() => setImgError(true)} className="w-full h-full object-contain p-1.5" />
      </div>
    );
  }

  return (
    <div className={`${containerClass} ${colorClass} border flex items-center justify-center overflow-hidden flex-shrink-0 font-black`}>
       {initials}
    </div>
  );
}

function OpportunityModal({ opp, onClose }: { opp: any; onClose: () => void }) {
  if (!opp) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto mt-20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-start">
          <div className="flex gap-6 items-center">
            <CompanyLogo logo={opp.companyLogo} company={opp.company} size="large" />
            <div>
              <div className="flex gap-2 mb-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wide text-[10px] rounded-lg border border-emerald-100/50">{opp.type}</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold uppercase tracking-wide text-[10px] rounded-lg border border-blue-100/50">{opp.workMode}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{opp.title}</h2>
              <p className="text-slate-500 font-medium">{opp.company} • {opp.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Stipend / Salary</p>
               <p className="font-extrabold text-slate-800">{opp.stipend || 'Unpaid'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Duration</p>
               <p className="font-extrabold text-slate-800">{opp.duration || 'Full-time'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Deadline</p>
               <p className="font-extrabold text-red-500">{opp.deadline ? format(new Date(opp.deadline), 'MMM dd, yyyy') : 'N/A'}</p>
            </div>
            
            {(() => {
               const matchVal = opp.matchPercentage || 0;
               let badgeTheme = "bg-slate-50 text-slate-600 border-slate-100";
               
               if (matchVal >= 90) badgeTheme = "bg-emerald-50 text-emerald-700 border-emerald-100";
               else if (matchVal >= 80) badgeTheme = "bg-blue-50 text-blue-700 border-blue-100";
               else if (matchVal >= 70) badgeTheme = "bg-amber-50 text-amber-700 border-amber-100";

               return (
                 <div className={`p-4 rounded-2xl border ${badgeTheme}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">AI Match</p>
                    <p className="font-extrabold text-lg flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">psychology</span> {matchVal}% {opp.matchLevel}</p>
                 </div>
               );
            })()}
          </div>

          <div className="space-y-6 text-slate-600">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">Description</h3>
              <p className="leading-relaxed">{opp.description || 'No description provided.'}</p>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">Eligibility</h3>
              <p className="leading-relaxed">{opp.eligibility || 'Open to everyone.'}</p>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {opp.requiredSkills?.map((s: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg border border-slate-200">{s}</span>
                ))}
              </div>
            </div>

            {opp.recommendedPreparation && (
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 mt-6">
                <h3 className="text-sm font-extrabold text-amber-600 uppercase tracking-wide flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span> Recommended Preparation
                </h3>
                <p className="text-sm text-amber-800 font-medium leading-relaxed">
                  {opp.recommendedPreparation}
                </p>
                {opp.estimatedDifficulty && (
                   <p className="text-xs text-amber-600 font-bold mt-3">Estimated Difficulty: {opp.estimatedDifficulty}</p>
                )}
              </div>
            )}
            
            {opp.matchReason && opp.matchReason.length > 0 && (
              <div className="bg-[#00a878]/10 p-5 rounded-2xl border border-[#00a878]/20 mt-6">
                <h3 className="text-sm font-extrabold text-[#00a878] uppercase tracking-wide flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px]">psychology</span> AI Match Breakdown
                </h3>
                <ul className="space-y-2">
                  {opp.matchReason.map((r: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-700 font-medium flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#00a878] mt-0.5">check_circle</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
          <a href={opp.applyUrl || '#'} target="_blank" rel="noreferrer" className="px-8 py-3 bg-[#00a878] hover:bg-[#008f66] text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2">
            Apply Now <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function OpportunitiesPage() {
  const context = useRouteContext({ strict: false }) as any;
  const sessionUser = context?.sessionUser;
  const userId = sessionUser?.id;
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterRemote, setFilterRemote] = useState(false);
  const [sortBy, setSortBy] = useState("Highest Match");
  
  const [selectedOpp, setSelectedOpp] = useState<any>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['opportunities', userId, filterType, filterRemote, sortBy, searchQuery, filterLocation],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, search: searchQuery, type: filterType, location: filterLocation, remote: filterRemote ? 'true' : undefined, sortBy }),
      });
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      return res.json();
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (oppId: string) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/opportunities/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, opportunityId: oppId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });

  const opportunities = response?.data || [];

  const types = ["All", "Internship", "Job", "Hackathon", "Scholarship", "Competition"];

  // Filter top matches >= 60%
  const featured = opportunities.filter((o: any) => o.matchPercentage >= 60).slice(0, 3); 
  const remaining = opportunities.filter((o: any) => !featured.find((f: any) => f.id === o.id));

  // Deadlines widget
  const upcomingDeadlines = useMemo(() => {
    return [...opportunities]
      .filter(o => o.deadline && !isPast(new Date(o.deadline)))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 4);
  }, [opportunities]);

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
            Opportunities <span className="text-2xl">🎯</span>
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Personalized internships, jobs, and hackathons matched to your skills and career goals.
          </p>
        </div>

        {/* Categories / Filters Bar */}
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-10 border border-slate-200 min-w-0 overflow-x-auto flex gap-3">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-5 py-3 rounded-2xl text-sm font-extrabold whitespace-nowrap transition-all flex items-center gap-2 ${
                filterType === t 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {t === 'All' ? 'grid_view' : t === 'Internship' ? 'business_center' : t === 'Job' ? 'work' : t === 'Hackathon' ? 'code' : t === 'Scholarship' ? 'school' : 'emoji_events'}
              </span>
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-10 min-w-0">
            
            {/* Search & Sort Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
               <div className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input 
                    type="text" 
                    placeholder="Search titles, companies, skills..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00a878] outline-none transition-all"
                  />
               </div>
               <div className="flex gap-4">
                 <label className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 px-4 rounded-xl border border-slate-200 cursor-pointer">
                    <input type="checkbox" checked={filterRemote} onChange={(e) => setFilterRemote(e.target.checked)} className="rounded text-[#00a878] focus:ring-[#00a878]" />
                    Remote Only
                 </label>
                 <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00a878] cursor-pointer appearance-none pr-10"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
                  >
                    <option>Highest Match</option>
                    <option>Newest</option>
                    <option>Deadline Soon</option>
                 </select>
               </div>
            </div>

            {/* Featured Cards */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">local_fire_department</span> Top Matches For You
                  </h3>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
                  <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featured.map((opp: any) => (
                    <div key={opp.id} onClick={() => setSelectedOpp(opp)} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative group flex flex-col min-h-[260px]">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <CompanyLogo logo={opp.companyLogo} company={opp.company} size="medium" />
                          <div>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest rounded-lg mb-1 block w-max">{opp.type}</span>
                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {opp.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                           {(() => {
                              const matchVal = opp.matchPercentage || 0;
                              let badgeTheme = "bg-slate-50 text-slate-600 border-slate-200";
                              if (matchVal >= 90) badgeTheme = "bg-emerald-50 text-emerald-700 border-emerald-200";
                              else if (matchVal >= 80) badgeTheme = "bg-blue-50 text-blue-700 border-blue-200";
                              else if (matchVal >= 70) badgeTheme = "bg-amber-50 text-amber-700 border-amber-200";

                              return (
                                <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 mb-2 ${badgeTheme}`}>
                                   <span className="material-symbols-outlined text-[16px]">psychology</span>
                                   <span className="font-extrabold text-sm">{matchVal}%</span>
                                </div>
                              );
                           })()}
                           <button onClick={(e) => { e.stopPropagation(); bookmarkMutation.mutate(opp.id); }} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${opp.isBookmarked ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                             <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: opp.isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                           </button>
                        </div>
                      </div>

                      <h4 className="text-xl font-black text-slate-900 mb-1 leading-snug group-hover:text-[#00a878] transition-colors">{opp.title}</h4>
                      <p className="text-sm font-bold text-slate-500 mb-4">{opp.company}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {opp.requiredSkills?.slice(0, 3).map((skill: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg">{skill}</span>
                        ))}
                        {opp.requiredSkills?.length > 3 && (
                           <span className="px-2.5 py-1 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg">+{opp.requiredSkills.length - 3}</span>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">schedule</span> 
                          {opp.deadline ? `Deadline: ${formatDistanceToNow(new Date(opp.deadline), { addSuffix: true })}` : 'No Deadline'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* More Opportunities Table */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-900">Explore Opportunities</h3>
                <span className="text-sm font-bold text-slate-500">{remaining.length} Results</span>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Role & Company</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap hidden sm:table-cell">Type</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap hidden lg:table-cell">Location</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Match</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {remaining.map((opp: any) => (
                        <tr key={opp.id} onClick={() => setSelectedOpp(opp)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <CompanyLogo logo={opp.companyLogo} company={opp.company} size="small" />
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-900 group-hover:text-[#00a878] transition-colors truncate">{opp.title}</p>
                                <p className="text-xs font-bold text-slate-500 truncate">{opp.company}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] rounded-lg inline-block whitespace-nowrap">
                              {opp.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap"><span className="material-symbols-outlined text-[14px]">location_on</span> {opp.workMode}</span>
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                               const matchVal = opp.matchPercentage || 0;
                               let badgeTheme = "bg-slate-50 text-slate-600 border-slate-200";
                               if (matchVal >= 90) badgeTheme = "bg-emerald-50 text-emerald-700 border-emerald-200";
                               else if (matchVal >= 80) badgeTheme = "bg-blue-50 text-blue-700 border-blue-200";
                               else if (matchVal >= 70) badgeTheme = "bg-amber-50 text-amber-700 border-amber-200";

                               return (
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold rounded-lg border ${badgeTheme}`}>
                                    <span className="material-symbols-outlined text-[14px]">psychology</span> {matchVal}%
                                 </span>
                               );
                            })()}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center ml-auto group-hover:border-[#00a878] group-hover:text-[#00a878] transition-all">
                               <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                             </button>
                          </td>
                        </tr>
                      ))}
                      {remaining.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No additional opportunities found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-8 min-w-0">
            {/* Upcoming Deadlines Widget */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">event_busy</span> Upcoming Deadlines
              </h3>
              
              <div className="space-y-5">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((opp: any, idx: number) => {
                  const daysLeft = formatDistanceToNow(new Date(opp.deadline));
                  return (
                    <div key={idx} onClick={() => setSelectedOpp(opp)} className="flex gap-4 items-start group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors min-w-0">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-slate-900 group-hover:text-red-500 transition-colors truncate">{opp.title}</p>
                        <p className="text-xs font-bold text-slate-500 truncate mb-1">{opp.company} • {opp.type}</p>
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100/50 inline-block">
                          {daysLeft} left
                        </span>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-slate-500">No upcoming deadlines.</p>
                )}
              </div>
            </div>

            {/* Notifications Widget */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-sm min-w-0 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a878]/20 rounded-bl-full blur-3xl"></div>
               <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2 relative z-10">
                 <span className="material-symbols-outlined text-amber-400">notifications_active</span> Status Alerts
               </h3>
               
               <div className="space-y-4 relative z-10">
                 {opportunities.filter((o:any) => o.hasApplied).length > 0 ? (
                   opportunities.filter((o:any) => o.hasApplied).slice(0,3).map((opp: any) => (
                    <div key={opp.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-0 flex items-center gap-3">
                       <span className="material-symbols-outlined text-emerald-400 text-[20px] flex-shrink-0">check_circle</span>
                       <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">Applied to {opp.company}</p>
                          <p className="text-xs text-slate-400 truncate">{opp.title}</p>
                       </div>
                    </div>
                   ))
                 ) : (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">assignment</span>
                      <p className="text-sm font-bold text-slate-400">You haven't applied to any opportunities yet.</p>
                    </div>
                 )}
               </div>
            </div>

          </div>

        </div>

      </div>
      
      {/* Detail Modal */}
      {selectedOpp && (
        <OpportunityModal opp={selectedOpp} onClose={() => setSelectedOpp(null)} />
      )}
    </DashboardLayout>
  )
}
