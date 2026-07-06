import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { format } from 'date-fns'
import { motion, type Variants } from 'framer-motion'

export const Route = createFileRoute('/_authenticated/opportunities/')({
  component: OpportunitiesPage,
})

// ---------- Animation variants ----------
const cardContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const sweepVariants: Variants = {
  hidden: { x: '-120%', opacity: 0 },
  visible: { x: '120%', opacity: [0, 1, 0], transition: { duration: 0.7, ease: 'easeOut' } },
}

const badgeVariants: Variants = {
  hidden: { scale: 1 },
  visible: { scale: [1, 1.25, 1], transition: { duration: 0.5, ease: 'easeOut', delay: 0.15 } },
}

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
                {opp.type && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wide text-[10px] rounded-lg border border-emerald-100/50">{opp.type}</span>}
                {opp.workMode && <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold uppercase tracking-wide text-[10px] rounded-lg border border-blue-100/50">{opp.workMode}</span>}
                {opp.source && <span className="px-3 py-1 bg-purple-50 text-purple-700 font-extrabold uppercase tracking-wide text-[10px] rounded-lg border border-purple-100/50">Source: {opp.source}</span>}
              </div>
              <h2 className="text-2xl font-black text-slate-900">{opp.title}</h2>
              <p className="text-slate-500 font-medium">{opp.company} {opp.location && `• ${opp.location}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-8">
          <div className="flex flex-wrap gap-4 mb-8">
            {opp.stipend && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[120px]">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Stipend / Salary</p>
                 <p className="font-extrabold text-slate-800">{opp.stipend}</p>
              </div>
            )}
            {opp.duration && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[120px]">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Duration</p>
                 <p className="font-extrabold text-slate-800">{opp.duration}</p>
              </div>
            )}
            {opp.deadline && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[120px]">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Deadline</p>
                 <p className="font-extrabold text-red-500">{format(new Date(opp.deadline), 'MMM dd, yyyy')}</p>
              </div>
            )}
            
            {(() => {
               const matchVal = opp.matchPercentage || 0;
               let badgeTheme = "bg-slate-50 text-slate-600 border-slate-100";
               
               if (matchVal >= 90) badgeTheme = "bg-emerald-50 text-emerald-700 border-emerald-100";
               else if (matchVal >= 80) badgeTheme = "bg-blue-50 text-blue-700 border-blue-100";
               else if (matchVal >= 70) badgeTheme = "bg-amber-50 text-amber-700 border-amber-100";

               return (
                 <div className={`p-4 rounded-2xl border ${badgeTheme} min-w-[120px]`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">AI Match</p>
                    <p className="font-extrabold text-lg flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">psychology</span> {matchVal}%</p>
                 </div>
               );
            })()}
          </div>

          <div className="space-y-6 text-slate-600">
            {opp.description && (
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">Description</h3>
                <p className="leading-relaxed whitespace-pre-wrap">{opp.description}</p>
              </div>
            )}
            {opp.eligibility && (
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">Eligibility</h3>
                <p className="leading-relaxed">{opp.eligibility}</p>
              </div>
            )}
            {opp.requiredSkills && opp.requiredSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {opp.requiredSkills.map((s: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg border border-slate-200">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 transition-colors">Close</button>
          {opp.applyUrl && (
            <a href={opp.applyUrl} target="_blank" rel="noreferrer" className="px-8 py-3 bg-[#00a878] hover:bg-[#008f66] text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2">
              Apply Now <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          )}
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
  const [sortBy, setSortBy] = useState("Highest Match");
  
  const [selectedOpp, setSelectedOpp] = useState<any>(null);

  // ---------- Intro animation state ----------
  const headerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [arrowActive, setArrowActive] = useState(false);
  const [targetHit, setTargetHit] = useState(false);
  const [cardsReady, setCardsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const header = headerRef.current;
      const target = targetRef.current;
      if (!header || !target) return;
      const headerRect = header.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setTargetPos({
        x: targetRect.left + targetRect.width / 2 - headerRect.left,
        y: targetRect.top + targetRect.height / 2 - headerRect.top,
      });
      setArrowActive(true);
    }, 450); // let the title finish fading in first

    return () => clearTimeout(timer);
  }, []);

  const handleArrowArrived = () => {
    setArrowActive(false);
    setTargetHit(true);
    setCardsReady(true);
    setTimeout(() => setTargetHit(false), 1000);
  };

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['opportunities', userId, sortBy, searchQuery],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, search: searchQuery, sortBy }),
      });
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      return res.json();
    },
  });

  const opportunities = response?.data || [];

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Header */}
        <div ref={headerRef} className="mb-8 relative">
          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3"
          >
            Opportunities{' '}
            <motion.span
              ref={targetRef}
              className="text-2xl inline-block"
              animate={
                targetHit
                  ? {
                      scale: [1, 1.4, 0.95, 1.1, 1],
                      filter: [
                        'drop-shadow(0 0 0px rgba(0,168,120,0))',
                        'drop-shadow(0 0 10px rgba(0,168,120,0.9))',
                        'drop-shadow(0 0 10px rgba(0,168,120,0.9))',
                        'drop-shadow(0 0 4px rgba(0,168,120,0.5))',
                        'drop-shadow(0 0 0px rgba(0,168,120,0))',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              🎯
            </motion.span>
          </motion.h2>
          <p className="text-sm font-medium text-slate-500">
            Real opportunities fetched and personalized for you.
          </p>

          {/* Flying arrow */}
          {targetPos && arrowActive && (
            <motion.span
              className="material-symbols-outlined absolute text-[#00a878] pointer-events-none z-20"
              style={{ fontSize: 28, top: targetPos.y - 14, left: 0 }}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: targetPos.x - 14, opacity: [0, 1, 1] }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
              onAnimationComplete={handleArrowArrived}
            >
              arrow_forward
            </motion.span>
          )}

          {/* Impact ripple + particles */}
          {targetPos && targetHit && (
            <>
              <motion.span
                className="absolute rounded-full border-2 border-[#00a878] pointer-events-none"
                style={{ left: targetPos.x - 20, top: targetPos.y - 20, width: 40, height: 40 }}
                initial={{ scale: 0.3, opacity: 0.8 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
              {[0, 60, 120, 180, 240, 300].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const dx = Math.cos(rad) * 30;
                const dy = Math.sin(rad) * 30;
                return (
                  <motion.span
                    key={angle}
                    className="absolute w-1.5 h-1.5 rounded-full bg-[#00a878] pointer-events-none"
                    style={{ left: targetPos.x, top: targetPos.y, boxShadow: '0 0 6px rgba(0,168,120,0.8)' }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: dx, y: dy, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                );
              })}
            </>
          )}
        </div>

        <div className="space-y-10 min-w-0">
            
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
               <div className="flex gap-4 min-w-[200px]">
                 <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00a878] cursor-pointer appearance-none pr-10"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
                  >
                    <option>Highest Match</option>
                    <option>Latest</option>
                    <option>Company Name</option>
                 </select>
               </div>
            </div>

            {/* Opportunities Grid */}
            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
                  <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
                  <div className="h-64 bg-slate-100 animate-pulse rounded-3xl hidden lg:block"></div>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate={cardsReady ? 'visible' : 'hidden'}
                >
                  {opportunities.map((opp: any) => (
                    <motion.div
                      key={opp.id}
                      variants={cardItemVariants}
                      onClick={() => setSelectedOpp(opp)}
                      className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group flex flex-col min-h-[260px]"
                    >
                      {/* Soft green glow sweeping across the card as it unlocks */}
                      <motion.div
                        variants={sweepVariants}
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(100deg, transparent 30%, rgba(0,168,120,0.18) 50%, transparent 70%)' }}
                      />

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <CompanyLogo logo={opp.companyLogo} company={opp.company} size="medium" />
                          <div className="min-w-0">
                            <div className="flex gap-1 mb-1">
                               <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest rounded-lg block w-max truncate">{opp.type}</span>
                               {opp.source && <span className="px-2.5 py-1 bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-extrabold uppercase tracking-widest rounded-lg block w-max truncate">{opp.source}</span>}
                            </div>
                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1 truncate"><span className="material-symbols-outlined text-[14px]">location_on</span> {opp.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 ml-2">
                           {(() => {
                              const matchVal = opp.matchPercentage || 0;
                              let badgeTheme = "bg-slate-50 text-slate-600 border-slate-200";
                              if (matchVal >= 90) badgeTheme = "bg-emerald-50 text-emerald-700 border-emerald-200";
                              else if (matchVal >= 80) badgeTheme = "bg-blue-50 text-blue-700 border-blue-200";
                              else if (matchVal >= 70) badgeTheme = "bg-amber-50 text-amber-700 border-amber-200";

                              return (
                                <motion.div variants={badgeVariants} className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 mb-2 ${badgeTheme}`}>
                                   <span className="material-symbols-outlined text-[16px]">psychology</span>
                                   <span className="font-extrabold text-sm">{matchVal}%</span>
                                </motion.div>
                              );
                           })()}
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
                        {opp.deadline && (
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">schedule</span> 
                            Deadline: {format(new Date(opp.deadline), 'MMM dd')}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {!isLoading && opportunities.length === 0 && (
                     <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                        <h4 className="text-lg font-bold text-slate-700">No opportunities found.</h4>
                        <p className="text-sm text-slate-500 mt-1">Try changing your search query or career goal.</p>
                     </div>
                  )}
                </motion.div>
              )}
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
