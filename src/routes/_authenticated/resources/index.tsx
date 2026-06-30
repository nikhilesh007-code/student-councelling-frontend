import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/resources/')({
  component: ResourcesPage,
})

function ResourceSkeleton() {
  return (
    <div className="border border-slate-100 rounded-2xl p-5 bg-white animate-pulse flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-20 h-6 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="w-3/4 h-5 bg-slate-100 rounded-md mb-2"></div>
      <div className="w-1/2 h-4 bg-slate-100 rounded-md mb-4 flex-grow"></div>
      <div className="w-full h-12 bg-slate-50 rounded-xl mb-4"></div>
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
        <div className="w-16 h-4 bg-slate-100 rounded-md"></div>
        <div className="w-16 h-4 bg-slate-100 rounded-md"></div>
      </div>
    </div>
  )
}

function ResourceGroup({ title, items, icon, colorClass, defaultExpanded = true }: { title: string, items: any[], icon: string, colorClass: string, defaultExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10`}>
            <span className={`material-symbols-outlined text-[24px] ${colorClass}`}>{icon}</span>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-extrabold text-slate-900 leading-none mb-1">{title}</h3>
            <p className="text-sm font-medium text-slate-500">{items.length} resource{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
        </div>
      </button>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-6 pt-2 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
        {items.map((resource: any, idx: number) => {
          let badgeColor = "text-slate-600 bg-slate-100 border-transparent";
          if (resource.type === "Official Docs") badgeColor = "text-blue-600 bg-blue-50/60 border-blue-100/50";
          else if (resource.type === "Course") badgeColor = "text-indigo-600 bg-indigo-50/60 border-indigo-100/50";
          else if (resource.type === "Video") badgeColor = "text-red-600 bg-red-50/60 border-red-100/50";
          else if (resource.type === "Roadmap") badgeColor = "text-emerald-600 bg-emerald-50/60 border-emerald-100/50";

          return (
            <div key={idx} className="border border-slate-200 rounded-[20px] bg-white hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 group transition-all duration-300 flex flex-col h-full relative overflow-hidden">
              {resource.thumbnail && (
                <div className="w-full h-40 bg-slate-100 overflow-hidden relative">
                   <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                   {resource.duration && resource.type === "Video" && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                         {resource.duration}
                      </div>
                   )}
                </div>
              )}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg border h-7 flex items-center ${badgeColor}`}>
                    {resource.type}
                  </span>
                </div>
                
                <h4 className="text-[22px] font-bold text-slate-900 mb-2 leading-snug line-clamp-2">{resource.title}</h4>
                <p className="text-sm font-medium text-slate-500 mb-6">{resource.provider}</p>
                
                <div className="flex items-center gap-4 mb-8">
                   <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">speed</span> {resource.difficulty}
                   </span>
                   {resource.duration && (
                     <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span> {resource.duration}
                     </span>
                   )}
                </div>
                
                <div className="bg-slate-50/50 rounded-xl p-3 mt-auto border border-slate-100/50">
                  <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic line-clamp-3">
                    "{resource.description}"
                  </p>
                </div>
              </div>
              
              <div className="px-6 pb-6 mt-auto">
                 <a href={resource.url} target="_blank" rel="noreferrer" className="w-full bg-[#00a878] hover:bg-[#008f66] text-white h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-500/20 active:scale-[0.98]">
                   Open Resource <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                 </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourcesPage() {
  const context = useRouteContext({ strict: false }) as any;
  const sessionUser = context?.sessionUser;
  const profileData = context?.profile;
  const userId = sessionUser?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const { data: resourcesData, isLoading, error, refetch } = useQuery({
    queryKey: ['resources', userId, profileData?.updatedAt],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID found");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/learning-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to fetch resources");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json;
    },
    enabled: !!userId,
  });

  const { header, resources } = resourcesData || {};
  const targetCareer = header?.targetCareer || 'Your Career';

  const mappedResources = useMemo(() => {
    if (!resources) return [];
    return resources.map((r: any) => ({
      ...r,
      description: r.shortReason || r.description,
      url: r.officialUrl || r.url,
    }));
  }, [resources]);

  const filteredResources = useMemo(() => {
    if (!mappedResources) return [];
    return mappedResources.filter((r: any) => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "All" || r.type === filterType;
      const matchesDifficulty = filterDifficulty === "All" || r.difficulty === filterDifficulty;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }, [mappedResources, searchQuery, filterType, filterDifficulty]);

  // Get unique types and difficulties for filters
  const uniqueTypes = useMemo(() => ["All", ...Array.from(new Set((mappedResources || []).map((r: any) => r.type)))], [mappedResources]);
  const uniqueDifficulties = useMemo(() => ["All", ...Array.from(new Set((mappedResources || []).map((r: any) => r.difficulty)))], [mappedResources]);

  // Summary Metrics
  const totalResources = mappedResources.length;
  const totalVideos = mappedResources.filter((r: any) => r.type === "Video").length;
  const totalCourses = mappedResources.filter((r: any) => r.type === "Course").length;
  const totalDocs = mappedResources.filter((r: any) => r.type === "Official Docs").length;

  const groupedResources = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredResources.forEach((r: any) => {
      if (!groups[r.topic]) groups[r.topic] = [];
      groups[r.topic].push(r);
    });
    return groups;
  }, [filteredResources]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
          <div className="mb-8">
            <div className="w-64 h-10 bg-slate-200 animate-pulse rounded-xl mb-3"></div>
            <div className="w-96 h-5 bg-slate-100 animate-pulse rounded-md"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
             {[1, 2, 3, 4, 5, 6].map(i => <ResourceSkeleton key={i} />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || (!resourcesData && !isLoading)) {
    return (
       <DashboardLayout>
         <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl border border-slate-200 p-10 max-w-2xl mx-auto mt-10 shadow-sm text-center">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl">error</span>
           </div>
           <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Failed to load resources</h3>
           <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">We couldn't generate your learning materials. Please try again or check your connection.</p>
           <button onClick={() => refetch()} className="bg-[#00a878] hover:bg-[#008f66] transition-colors text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 mx-auto">
             <span className="material-symbols-outlined text-[20px]">refresh</span>
             Try Again
           </button>
         </div>
       </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Learning Resources</h2>
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Curated official documentation and verified tutorials targeting your specific skill gaps.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-[#00a878]">
              <span className="material-symbols-outlined">library_books</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Resources</p>
              <p className="text-xl font-extrabold text-slate-900">{totalResources}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Courses</p>
              <p className="text-xl font-extrabold text-slate-900">{totalCourses}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Documentation</p>
              <p className="text-xl font-extrabold text-slate-900">{totalDocs}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
              <span className="material-symbols-outlined">smart_display</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Videos</p>
              <p className="text-xl font-extrabold text-slate-900">{totalVideos}</p>
            </div>
          </div>
        </div>

        {/* Context Bar & Filters */}
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-8 border border-slate-200 min-w-0 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
          
          <div className="flex items-center gap-4 min-w-[250px]">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <span className="material-symbols-outlined text-[24px]">track_changes</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5 font-extrabold">Target Career</p>
              <p className="text-lg font-extrabold text-slate-900 truncate">{targetCareer}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[250px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Search resources, skills..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a878] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00a878] cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
              >
                {uniqueTypes.map((type: any, i) => <option key={i} value={type}>{type === "All" ? "All Types" : type}</option>)}
              </select>
              <select 
                value={filterDifficulty} 
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#00a878] cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
              >
                {uniqueDifficulties.map((diff: any, i) => <option key={i} value={diff}>{diff === "All" ? "All Levels" : diff}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Target Career Resources */}
        {groupedResources[targetCareer] && groupedResources[targetCareer].length > 0 && (
          <div className="mb-10">
            <ResourceGroup 
              title={`🎯 ${targetCareer}`}
              items={groupedResources[targetCareer]} 
              icon="star" 
              colorClass="text-amber-500" 
              defaultExpanded={true} 
            />
          </div>
        )}

        {/* Dynamic Resources Grid (Other Topics) */}
        <div className="space-y-4">
          {Object.entries(groupedResources)
            .filter(([topic]) => topic !== targetCareer)
            .map(([topic, items], idx) => {
              // Assign some distinct colors based on index to keep it colorful
              const colors = ["text-rose-500", "text-indigo-500", "text-emerald-500", "text-blue-500", "text-purple-500"];
              const colorClass = colors[idx % colors.length];
              return (
                <ResourceGroup 
                  key={topic} 
                  title={topic} 
                  items={items} 
                  icon="topic" 
                  colorClass={colorClass} 
                  defaultExpanded={true} 
                />
              );
          })}
          
          {(!filteredResources || filteredResources.length === 0) && (
             <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl text-slate-400">search_off</span>
                 </div>
                 <h3 className="text-2xl font-extrabold text-slate-900 mb-3">No matching resources</h3>
                 <p className="text-base text-slate-500 font-medium max-w-md mx-auto">We couldn't find any resources matching your current filters. Try adjusting your search terms or filter criteria.</p>
                 
                 {(searchQuery !== "" || filterType !== "All" || filterDifficulty !== "All") && (
                   <button 
                     onClick={() => { setSearchQuery(""); setFilterType("All"); setFilterDifficulty("All"); }}
                     className="mt-8 text-[#00a878] font-bold hover:underline"
                   >
                     Clear all filters
                   </button>
                 )}
             </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
