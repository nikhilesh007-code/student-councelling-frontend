import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'


export const Route = createFileRoute('/_authenticated/roadmap/')({
  component: RoadmapPage,
})

const MOCK_ROADMAP_DATA = {
  header: {
    targetCareer: 'Software Engineer',
    targetDate: 'June 2028',
    currentStage: 'Phase 3 of 6',
    progress: 60
  },
  timeline: [
    {
      id: 1,
      phase: 'Phase 1',
      status: 'Completed',
      title: 'Programming Fundamentals',
      desc: 'Build strong programming foundation.',
      items: [
        { name: 'Python Basics', done: true },
        { name: 'C Programming', done: true },
        { name: 'OOP Concepts', done: true },
        { name: 'Basic Problem Solving', done: true }
      ],
      progress: 100,
      active: false
    },
    {
      id: 2,
      phase: 'Phase 2',
      status: 'Completed',
      title: 'Web Development Basics',
      desc: 'Learn the building blocks of web.',
      items: [
        { name: 'HTML', done: true },
        { name: 'CSS', done: true },
        { name: 'JavaScript', done: true },
        { name: 'Responsive Design', done: true }
      ],
      progress: 100,
      active: false
    },
    {
      id: 3,
      phase: 'Phase 3',
      status: 'In Progress',
      title: 'Frontend Development',
      desc: 'Master modern frontend technologies.',
      items: [
        { name: 'React Basics', done: true },
        { name: 'React Projects', done: false },
        { name: 'API Integration', done: false }
      ],
      progress: 60,
      active: true
    },
    {
      id: 4,
      phase: 'Phase 4',
      status: 'Upcoming',
      title: 'Backend Development',
      desc: 'Learn server-side development.',
      items: [
        { name: 'Node.js', done: false },
        { name: 'Express.js', done: false },
        { name: 'Databases (MongoDB, SQL)', done: false },
        { name: 'REST APIs', done: false }
      ],
      progress: 0,
      active: false
    }
  ],
  nextAction: {
    title: 'Complete React Projects',
    desc: 'Building projects will strengthen your skills and improve your portfolio.',
    time: '2 Weeks',
    priority: 'High'
  },
  milestones: [
    { id: 1, name: 'Frontend Dev', icon: 'code', state: 'past' },
    { id: 2, name: 'Get Internship', icon: 'work', state: 'current' },
    { id: 3, name: 'Full Stack', icon: 'dns', state: 'future' },
    { id: 4, name: 'Software Eng', icon: 'emoji_events', state: 'future' }
  ],
  insights: [
    'You are on track! Keep learning consistently.',
    'Focus more on React Projects to strengthen your portfolio.',
    'After completing Phase 3, you will be 75% closer to your goal.'
  ]
}

function RoadmapPage() {
  const context = useRouteContext({ strict: false }) as any;
  const completionPercentage = context?.completionPercentage || 0;

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: true,
    4: false
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const togglePhase = (id: number) => {
    setExpandedPhases(prev => ({ ...prev, [id]: !prev[id] }))
  }



  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading your personalized roadmap...</p>
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
           <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load roadmap</h3>
           <p className="text-slate-500 mb-6">{error}</p>
           <button onClick={() => window.location.reload()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
         </div>
       </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
            Career Roadmap
            <span className="material-symbols-outlined text-[#00a878] text-[28px]">map</span>
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Step-by-step plan to achieve your dream career as a {MOCK_ROADMAP_DATA.header.targetCareer}.
          </p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 min-w-0">
          {/* Target Career */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#00a878] shrink-0">
              <span className="material-symbols-outlined">code</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Target Career</p>
              <p className="text-[15px] font-extrabold text-slate-900 truncate">{MOCK_ROADMAP_DATA.header.targetCareer}</p>
            </div>
          </div>

          {/* Target Achievement Date */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Achievement Date</p>
              <p className="text-[15px] font-extrabold text-slate-900 truncate">{MOCK_ROADMAP_DATA.header.targetDate}</p>
            </div>
          </div>

          {/* Current Stage */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <span className="material-symbols-outlined">flag</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">Current Stage</p>
              <p className="text-[15px] font-extrabold text-slate-900 truncate">{MOCK_ROADMAP_DATA.header.currentStage}</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#00a878] shrink-0">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall</p>
                <span className="text-[15px] font-black text-[#00a878]">{MOCK_ROADMAP_DATA.header.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00a878] rounded-full" style={{ width: `${MOCK_ROADMAP_DATA.header.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
          
          {/* Left Column: The Roadmap */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
            {/* Tabs */}
            <div className="flex flex-wrap gap-6 sm:gap-8 border-b border-slate-100 mb-8 pb-0">
              <button className="text-sm font-extrabold text-[#00a878] border-b-2 border-[#00a878] pb-3 -mb-[2px]">Roadmap</button>
              <button className="text-sm font-bold text-slate-500 hover:text-[#00a878] transition-colors pb-3">Milestones</button>
              <button className="text-sm font-bold text-slate-500 hover:text-[#00a878] transition-colors pb-3">Timeline View</button>
              <button className="text-sm font-bold text-slate-500 hover:text-[#00a878] transition-colors pb-3">Recommendations</button>
            </div>

            {/* Timeline Content */}
            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 space-y-6 sm:ml-4">
              {MOCK_ROADMAP_DATA.timeline.map((phase) => (
                <div key={phase.id} className={`relative rounded-xl border p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start transition-all
                  ${phase.status === 'Completed' ? 'bg-white border-slate-100 hover:shadow-sm' : 
                    phase.status === 'In Progress' ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 
                    'bg-white border-slate-100 opacity-60 hover:opacity-100'}`}
                >
                  {/* Timeline Node */}
                  <div className={`absolute -left-[35px] sm:-left-[43px] top-5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white
                    ${phase.status === 'Completed' ? 'bg-[#00a878] text-white' : 
                      phase.status === 'In Progress' ? 'bg-blue-500 text-white' : 
                      'bg-slate-200 text-slate-500'}`}
                  >
                    <span className="material-symbols-outlined text-[14px] font-bold">
                      {phase.status === 'Completed' ? 'check' : phase.status === 'In Progress' ? 'rocket_launch' : 'lock'}
                    </span>
                  </div>

                  <div className="w-full sm:w-32 flex-shrink-0">
                    <p className="text-[15px] font-extrabold text-slate-900">{phase.phase}</p>
                    <p className={`text-[12px] font-bold uppercase tracking-wide
                      ${phase.status === 'Completed' ? 'text-[#00a878]' : 
                        phase.status === 'In Progress' ? 'text-blue-600' : 'text-slate-500'}`}
                    >
                      {phase.status}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <h4 className="text-[16px] font-extrabold text-slate-900 mb-1 truncate">{phase.title}</h4>
                    <p className="text-[13px] font-medium text-slate-500 mb-4">{phase.desc}</p>
                    
                    {expandedPhases[phase.id] && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
                        {phase.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className={`material-symbols-outlined text-[18px] shrink-0 ${item.done ? 'text-[#00a878]' : 'text-slate-300'}`} style={{ fontVariationSettings: item.done ? "'FILL' 1" : "'FILL' 0" }}>
                              {item.done ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span className={`text-[13px] font-medium leading-tight ${item.done ? 'text-slate-700' : 'text-slate-500'}`}>
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-start w-full sm:w-auto justify-between sm:justify-start mt-2 sm:mt-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full
                      ${phase.status === 'Completed' ? 'bg-[#00a878]/10 text-[#00a878]' : 
                        phase.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                        'bg-slate-100 text-slate-500'}`}
                    >
                      {phase.progress}%
                    </span>
                    <button onClick={() => togglePhase(phase.id)} className="text-slate-400 hover:text-[#00a878] p-1 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="material-symbols-outlined">{expandedPhases[phase.id] ? 'expand_less' : 'expand_more'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              View Full Timeline <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Right Column: Actions & Insights */}
          <div className="space-y-6 min-w-0">
            
            {/* Next Best Action Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
              <h3 className="text-[17px] font-extrabold text-slate-900 mb-5">Next Best Action</h3>
              <div className="flex gap-4 items-start mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-500 text-[26px]">smart_toy</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-extrabold text-slate-900 mb-1.5 leading-tight">{MOCK_ROADMAP_DATA.nextAction.title}</h4>
                  <p className="text-[13px] font-medium text-slate-500 mb-3 leading-relaxed">
                    {MOCK_ROADMAP_DATA.nextAction.desc}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-bold">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {MOCK_ROADMAP_DATA.nextAction.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-red-500 text-[12px] font-bold">
                      <span className="material-symbols-outlined text-[16px]">flag</span> {MOCK_ROADMAP_DATA.nextAction.priority} Priority
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full bg-[#00a878] text-white py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-[#008b63] transition-colors shadow-sm shadow-emerald-200">
                  Start Now <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Milestones Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[17px] font-extrabold text-slate-900">Milestones</h3>
                <button className="text-[#00a878] text-[13px] font-bold hover:underline">View All</button>
              </div>
              
              <div className="flex justify-between relative px-2">
                {/* Connecting Line */}
                <div className="absolute top-6 left-8 right-8 h-[2px] bg-slate-100 -z-10"></div>
                
                {MOCK_ROADMAP_DATA.milestones.map(ms => (
                  <div key={ms.id} className="flex flex-col items-center gap-2.5 bg-white">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[4px] border-white
                      ${ms.state === 'past' ? 'bg-[#00a878] text-white' : 
                        ms.state === 'current' ? 'bg-blue-50 text-blue-600 shadow-sm' : 
                        'bg-slate-50 text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{ms.icon}</span>
                    </div>
                    <div className={`text-center ${ms.state === 'future' ? 'opacity-50' : ''}`}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Milestone {ms.id}</p>
                      <p className="text-[11px] font-extrabold text-slate-700 leading-tight">{ms.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Roadmap Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden min-w-0">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[140px] text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2 mb-5 relative z-10">
                <span className="material-symbols-outlined text-[#00a878] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI Roadmap Insights
              </h3>
              <ul className="space-y-4 relative z-10">
                {MOCK_ROADMAP_DATA.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[18px] text-[#00a878] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Need Help Banner */}
            <div className="bg-orange-50/50 rounded-2xl p-5 flex items-center gap-4 border border-orange-100 min-w-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-slate-900 text-[14px] mb-0.5 truncate">Need Help?</h4>
                <p className="text-[12px] font-medium text-slate-600 truncate">Get guidance from our AI.</p>
              </div>
              <button className="text-[#00a878] text-[13px] font-extrabold whitespace-nowrap flex items-center gap-1 hover:underline">
                Ask CareerAI <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
