import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/roadmap/')({
  component: RoadmapPage,
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Total time the "AI activation" beam takes to travel from Phase 1 to the last phase
const BEAM_DURATION = 2.6

function RoadmapPage() {
  const context = useRouteContext({ strict: false }) as any;
  const sessionUser = context?.sessionUser;
  const userId = sessionUser?.id;
  const profileData = context?.profile;

  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { data: roadmapData, isLoading: isRoadmapLoading, error: roadmapError, refetch: refetchRoadmap } = useQuery({
    queryKey: ['roadmap', userId, profileData?.updatedAt],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID found");
      const res = await fetch(`${API_URL}/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to fetch roadmap data");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to generate roadmap");
      return json;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
    retry: false,
    refetchInterval: (query: any) => {
        const data = query.state?.data as any;
        return data?._meta?.isRefreshing ? 3000 : false;
    }
  });

  const { data: progressRes, isLoading: isProgressLoading, refetch: refetchProgress } = useQuery({
    queryKey: ['roadmapProgress', userId, roadmapData?.career],
    queryFn: async () => {
      if (!userId || !roadmapData?.career) throw new Error("No user ID or career found");
      const res = await fetch(`${API_URL}/roadmap/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, career: roadmapData.career }),
      });
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
    enabled: !!userId && !!roadmapData?.career,
  });

  const { data: analysisDataRes, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['roadmapAnalysis', userId, roadmapData?.career],
    queryFn: async () => {
      if (!userId || !roadmapData?.career) throw new Error("No user ID found");
      const res = await fetch(`${API_URL}/roadmap/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to fetch roadmap analysis");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to analyze roadmap");
      return json.analysis;
    },
    enabled: !!userId && !!roadmapData?.career,
  });

  const progressRecords = progressRes?.progress || [];
  const aiAnalysis = analysisDataRes;

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`${API_URL}/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, regenerate: true }),
      });
      const json = await res.json();
      if (json.success) {
        queryClient.setQueryData(['roadmap', userId, profileData?.updatedAt], json);
        await queryClient.invalidateQueries({ queryKey: ['roadmapProgress'] });
        await queryClient.invalidateQueries({ queryKey: ['roadmapAnalysis'] });
        await queryClient.invalidateQueries({ queryKey: ['progressData'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const updatePhaseStatus = async (phaseId: number, status: string, phaseTitle: string) => {
    try {
      const res = await fetch(`${API_URL}/roadmap/phase/${phaseId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, career: roadmapData.career, status }),
      });
      
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ['roadmap', userId] });
        // The API returns the updated global progress summary. Update the context cache too if needed.
        // For simplicity, we just invalidate progressData so the wrapper refetches.
        await queryClient.invalidateQueries({ queryKey: ['progressData'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        if (status === 'COMPLETED') {
          showToast(`Phase ${phaseId + 1} completed successfully! 🎉`);
          setExpandedPhases(prev => ({ ...prev, [phaseId + 1]: true }));
        } else if (status === 'IN_PROGRESS') {
          showToast(`Started Phase ${phaseId + 1}!`);
        }
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const togglePhase = (index: number) => {
    setExpandedPhases(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const { timeline, overallProgress, currentStageText, nextAction } = useMemo(() => {
    if (!roadmapData?.phases) return { timeline: [], overallProgress: 0, currentStageText: 'N/A', nextAction: aiAnalysis?.nextAction };

    let completedCount = 0;
    let firstIncompleteIndex = -1;

    // 1. Merge AI roadmap phases with roadmap_progress
    const computedTimeline = roadmapData.phases.map((phase: any, index: number) => {
      const record = progressRecords?.find((p: any) => p.phaseId === index);
      // Fallback to phase.status if record doesn't exist yet, else NOT_STARTED
      const status = record?.status || phase.status || 'NOT_STARTED';

      if (status === 'COMPLETED') {
        completedCount++;
      } else if (firstIncompleteIndex === -1) {
        firstIncompleteIndex = index;
      }

      // 2. Expose status, progress, isCompleted
      return {
        ...phase,
        id: index,
        status: status,
        progress: status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0,
        isCompleted: status === 'COMPLETED',
        isInProgress: status === 'IN_PROGRESS',
        isLocked: status === 'LOCKED',
        items: (phase.skills || []).map((s: string) => ({
          name: s,
          done: status === 'COMPLETED'
        }))
      };
    });

    if (firstIncompleteIndex === -1 && computedTimeline.length > 0) {
      firstIncompleteIndex = computedTimeline.length - 1;
    }

    // 4. Overall Progress
    const calculatedProgress = computedTimeline.length > 0 ? Math.round((completedCount / computedTimeline.length) * 100) : 0;
    
    // 5. Current Stage should always be the first incomplete phase.
    const currentStage = computedTimeline.length > 0 ? `Phase ${firstIncompleteIndex + 1} of ${computedTimeline.length}` : 'Not Started';

    // 6. Next Best Action should also point to the first incomplete phase.
    let computedNextAction = aiAnalysis?.nextAction;
    if (firstIncompleteIndex !== -1 && computedTimeline[firstIncompleteIndex]) {
      const activePhase = computedTimeline[firstIncompleteIndex];
      computedNextAction = {
        title: activePhase.title || computedNextAction?.title || "Continue your journey",
        reason: activePhase.objective || activePhase.description || computedNextAction?.reason || "Work on your next roadmap phase.",
        duration: activePhase.duration || computedNextAction?.duration || "1 week",
        priority: "High"
      };
    }

    return {
      timeline: computedTimeline,
      overallProgress: calculatedProgress,
      currentStageText: currentStage,
      nextAction: computedNextAction
    };
  }, [roadmapData, progressRecords, aiAnalysis]);

  const isRefreshing = roadmapData?._meta?.isRefreshing;

  if ((isRoadmapLoading && !roadmapData) || isProgressLoading || (isAnalysisLoading && !aiAnalysis)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">AI is generating your personalized career roadmap...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (roadmapError) {
    return (
       <DashboardLayout>
         <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">error</span>
           </div>
           <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load roadmap</h3>
           <p className="text-slate-500 mb-6">{(roadmapError as any)?.message}</p>
           <button onClick={() => refetchRoadmap()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
         </div>
       </DashboardLayout>
    )
  }

  if (!roadmapData || !roadmapData.phases || !aiAnalysis) {
      return (
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <p className="text-slate-500 font-medium">No roadmap data available. Try generating one.</p>
             <button onClick={handleRegenerate} className="mt-4 bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Generate Roadmap</button>
          </div>
        </DashboardLayout>
      )
  }

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#00a878] text-white px-6 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 z-50 animate-bounce">
          <span className="material-symbols-outlined">emoji_events</span>
          {toastMessage}
        </div>
      )}

      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10 relative">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Career Roadmap
              <span className="material-symbols-outlined text-[#00a878] text-[28px]">map</span>
              {isRefreshing && (
                  <span className="ml-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                      <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                      AI is refreshing roadmap in background...
                  </span>
              )}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Step-by-step plan to achieve your dream career as a <span className="font-bold text-slate-700">{roadmapData.career}</span>.
            </p>
          </div>
          <button 
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm bg-white shrink-0 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRegenerating ? 'animate-spin' : ''}`}>refresh</span>
            {isRegenerating ? 'Regenerating...' : 'Regenerate Roadmap'}
          </button>
        </div>

        {/* AI Summary Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-[#00a878]/10 border border-emerald-100 p-6 rounded-2xl shadow-sm mb-8 relative overflow-hidden">
          <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> 
            AI Roadmap Summary
          </h3>
          <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
            {roadmapData.summary || aiAnalysis.summary || "Your personalized step-by-step career roadmap."}
          </p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 min-w-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#00a878] shrink-0">
              <span className="material-symbols-outlined">code</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Target Career</p>
              <p className="text-[15px] font-extrabold text-slate-900 truncate">{roadmapData.career}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Total Duration</p>
              <p className="text-[15px] font-extrabold text-slate-900 truncate">{aiAnalysis.estimatedDuration}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <span className="material-symbols-outlined">flag</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Current Stage</p>
              <p className="text-[15px] font-extrabold text-slate-900 truncate">{currentStageText}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#00a878] shrink-0">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall</p>
                <span className="text-[15px] font-black text-[#00a878]">{overallProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00a878] rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
          
          {/* Left Column: The Roadmap */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
            <div className="flex flex-wrap gap-6 sm:gap-8 border-b border-slate-100 mb-8 pb-0">
              <button className="text-sm font-extrabold text-[#00a878] border-b-2 border-[#00a878] pb-3 -mb-[2px]">Roadmap Phases</button>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 space-y-6 sm:ml-4">

              {/* AI Timeline Activation — one-time energy beam that travels down the line */}
              {timeline.length > 0 && (
                <>
                  <motion.div
                    aria-hidden="true"
                    className="absolute left-0 top-0 w-[2px] bg-gradient-to-b from-[#00a878] via-[#00a878]/70 to-transparent pointer-events-none"
                    initial={{ height: '0%', opacity: 1 }}
                    animate={{ height: '100%', opacity: [1, 1, 0] }}
                    transition={{ duration: BEAM_DURATION, ease: 'easeInOut', times: [0, 0.85, 1] }}
                  />
                  <motion.div
                    aria-hidden="true"
                    className="absolute -left-[7px] w-3.5 h-3.5 rounded-full bg-[#00a878] pointer-events-none"
                    style={{ boxShadow: '0 0 14px 4px rgba(0,168,120,0.55)' }}
                    initial={{ top: '0%', opacity: 1, scale: 1 }}
                    animate={{ top: '100%', opacity: [1, 1, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: BEAM_DURATION, ease: 'easeInOut', times: [0, 0.85, 1] }}
                  />
                </>
              )}

              {timeline.map((phase: any) => {
                const { isCompleted, isInProgress, isLocked } = phase;
                const activationDelay = timeline.length > 1
                  ? (phase.id / (timeline.length - 1)) * (BEAM_DURATION - 0.5)
                  : 0;
                
                return (
                <motion.div
                  key={phase.id}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.015, 1] }}
                  transition={{ duration: 0.6, delay: activationDelay, ease: 'easeOut' }}
                  className={`relative rounded-xl border p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start transition-all
                  ${isCompleted ? 'bg-white border-slate-100 hover:shadow-sm' : 
                    isInProgress ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 
                    isLocked ? 'bg-slate-50 border-slate-100 opacity-60' :
                    'bg-white border-slate-100 hover:shadow-sm'}`}
                >
                  {/* Soft green activation flash as the beam passes this phase */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-xl bg-[#00a878] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.14, 0] }}
                    transition={{ duration: 0.6, delay: activationDelay, ease: 'easeInOut' }}
                  />

                  <div className={`absolute -left-[35px] sm:-left-[43px] top-5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white
                    ${isCompleted ? 'bg-[#00a878] text-white' : 
                      isInProgress ? 'bg-blue-500 text-white' : 
                      'bg-slate-200 text-slate-500'}`}
                  >
                    <span className="material-symbols-outlined text-[14px] font-bold">
                      {isCompleted ? 'check' : isInProgress ? 'rocket_launch' : 'circle'}
                    </span>
                  </div>

                  <div className="w-full sm:w-32 flex-shrink-0">
                    <p className="text-[15px] font-extrabold text-slate-900">Phase {phase.phase}</p>
                    <p className={`text-[12px] font-bold uppercase tracking-wide mb-2
                      ${isCompleted ? 'text-[#00a878]' : 
                        isInProgress ? 'text-blue-600' : 
                        'text-slate-500'}`}
                    >
                      {phase.status.replace('_', ' ')}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                      <span className="material-symbols-outlined text-[10px] mr-1">schedule</span>
                      {phase.duration || "N/A"}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <h4 className="text-[16px] font-extrabold text-slate-900 mb-2">{phase.title}</h4>
                    <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                      <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wide mb-1">Objective</p>
                      <p className="text-[13px] font-medium text-slate-600">{phase.objective || phase.description || "Complete core skills."}</p>
                    </div>
                    
                    {expandedPhases[phase.id] && (
                      <div className="space-y-4 mb-4">
                        {/* Skills */}
                        {phase.items && phase.items.length > 0 && (
                          <div>
                            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-2">Technologies & Skills</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                              {phase.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${item.done ? 'text-[#00a878]' : 'text-slate-300'}`} style={{ fontVariationSettings: item.done ? "'FILL' 1" : "'FILL' 0" }}>
                                    {item.done ? 'check_circle' : 'radio_button_unchecked'}
                                  </span>
                                  <span className={`text-[13px] font-medium leading-tight ${item.done ? 'text-slate-700' : 'text-slate-600'}`}>
                                    {item.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {phase.projects && phase.projects.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-2">Milestone Projects</p>
                            <ul className="space-y-1.5">
                              {phase.projects.map((proj: string, pIdx: number) => (
                                <li key={pIdx} className="text-[13px] text-slate-700 flex items-start gap-2">
                                  <span className="material-symbols-outlined text-[14px] text-indigo-400 mt-0.5">build</span>
                                  {proj}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Completion Criteria */}
                        {phase.completion && (
                          <div className="pt-2 border-t border-slate-100">
                            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-1">Expected Outcome</p>
                            <p className="text-[13px] font-medium text-slate-600">{phase.completion}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {!isCompleted && (
                         <button 
                           onClick={() => updatePhaseStatus(phase.id, 'COMPLETED', phase.title)}
                           className="text-[12px] font-bold bg-[#00a878] text-white px-4 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                         >
                           <span className="material-symbols-outlined text-[14px]">done_all</span> Mark as Complete
                         </button>
                      )}
                      {isCompleted && (
                         <button 
                           onClick={() => updatePhaseStatus(phase.id, 'NOT_STARTED', phase.title)}
                           className="text-[12px] font-bold bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1"
                         >
                           <span className="material-symbols-outlined text-[14px]">undo</span> Mark Incomplete
                         </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-start w-full sm:w-auto justify-between sm:justify-start mt-4 sm:mt-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full
                      ${isCompleted ? 'bg-[#00a878]/10 text-[#00a878]' : 
                        isInProgress ? 'bg-blue-100 text-blue-600' : 
                        'bg-slate-100 text-slate-500'}`}
                    >
                      {phase.progress}%
                    </span>
                    <button onClick={() => togglePhase(phase.id)} className="text-slate-400 hover:text-[#00a878] p-1 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="material-symbols-outlined">{expandedPhases[phase.id] ? 'expand_less' : 'expand_more'}</span>
                    </button>
                  </div>
                </motion.div>
              )})}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 min-w-0">
            
            {/* Next Action */}
            {nextAction && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
                <h3 className="text-[17px] font-extrabold text-slate-900 mb-5">Next Best Action</h3>
                <div className="flex gap-4 items-start mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-blue-500 text-[26px]">smart_toy</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-extrabold text-slate-900 mb-1.5 leading-tight">{nextAction.title}</h4>
                    <p className="text-[13px] font-medium text-slate-500 mb-3 leading-relaxed">
                      {nextAction.reason}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-bold">
                        <span className="material-symbols-outlined text-[16px]">schedule</span> {nextAction.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-red-500 text-[12px] font-bold">
                        <span className="material-symbols-outlined text-[16px]">flag</span> {nextAction.priority} Priority
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden min-w-0">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[140px] text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2 mb-5 relative z-10">
                <span className="material-symbols-outlined text-[#00a878] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI Roadmap Insights
              </h3>
              <ul className="space-y-4 relative z-10">
                  {(roadmapData.insights?.length > 0 ? roadmapData.insights : aiAnalysis.insights)?.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#00a878] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{insight}</p>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Milestone Predictions */}
            {aiAnalysis.milestonePrediction && (
              <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 text-white min-w-0">
                <h3 className="text-[17px] font-extrabold flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-purple-400">psychology</span>
                  Milestone Prediction
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-[13px] text-slate-400 font-bold uppercase tracking-wider">Internship Ready</span>
                    <span className="text-[15px] font-black text-emerald-400">{aiAnalysis.milestonePrediction.internshipReady}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-[13px] text-slate-400 font-bold uppercase tracking-wider">Placement Ready</span>
                    <span className="text-[15px] font-black text-blue-400">{aiAnalysis.milestonePrediction.placementReady}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[13px] text-slate-400 font-bold uppercase tracking-wider">AI Confidence</span>
                    <span className="text-[15px] font-black text-amber-400">{aiAnalysis.milestonePrediction.confidence}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Projects */}
            {aiAnalysis.suggestedProjects && aiAnalysis.suggestedProjects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
                <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-indigo-500">build_circle</span>
                  Suggested Projects
                </h3>
                <div className="space-y-4">
                  {aiAnalysis.suggestedProjects?.map((project: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-[14px] font-extrabold text-slate-900">{project.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 uppercase tracking-wide shrink-0 ml-2">
                          {project.difficulty}
                        </span>
                      </div>
                      <p className="text-[12px] font-medium text-slate-600 mb-3 leading-relaxed">{project.reason}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.skills?.map((skill: string, sIdx: number) => (
                          <span key={sIdx} className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
