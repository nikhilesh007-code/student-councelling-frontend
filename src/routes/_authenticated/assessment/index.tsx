import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'


export const Route = createFileRoute('/_authenticated/assessment/')({
  component: AssessmentPage,
})

const MOCK_SKILL_GAP_DATA = {
  profile: {
    interests: ['Web Development', 'AI & ML', 'Problem Solving'],
    topSkills: ['Python', 'HTML', 'CSS', 'SQL', 'C']
  },
  careers: [
    { title: 'Software Engineer', match: 92, icon: 'code', active: true, color: 'emerald' },
    { title: 'Data Analyst', match: 88, icon: 'bar_chart', active: false, color: 'blue' },
    { title: 'AI/ML Engineer', match: 85, icon: 'smart_toy', active: false, color: 'purple' }
  ],
  comparison: {
    targetCareer: 'Software Engineer',
    matchScore: 92,
    skills: [
      { current: 'Python', required: 'Python', status: 'Match' },
      { current: 'HTML/CSS', required: 'HTML, CSS, JavaScript', status: 'Partial' },
      { current: 'Not learned yet', required: 'React.js', status: 'Missing' },
      { current: 'Not learned yet', required: 'Git & GitHub', status: 'Missing' },
      { current: 'SQL', required: 'SQL', status: 'Match' },
      { current: 'Not learned yet', required: 'System Design', status: 'Missing' }
    ]
  },
  insights: {
    missingSkills: ['React.js', 'Git & GitHub', 'System Design'],
    progress: {
      have: 70,
      partial: 22,
      missing: 8
    }
  },
  actionPlan: [
    { step: 1, title: 'Master React.js', priority: 'High Priority', est: 'Est. 4 Weeks', action: 'Explore Courses', color: 'red' },
    { step: 2, title: 'Understand System Design Concepts', priority: 'High Priority', est: 'Est. 3 Weeks', action: 'Explore Resources', color: 'red' },
    { step: 3, title: 'Learn Git & GitHub Basics', priority: 'Medium Priority', est: 'Est. 1 Week', action: 'Start Tutorial', color: 'yellow' }
  ]
}

function AssessmentPage() {
  const context = useRouteContext({ strict: false }) as any;
  const completionPercentage = context?.completionPercentage || 0;
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Analyzing your skills and generating gap report...</p>
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
                {MOCK_SKILL_GAP_DATA.profile.interests.map(interest => (
                  <span key={interest} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-700">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Your Top Skills</p>
              <div className="flex flex-wrap gap-2">
                {MOCK_SKILL_GAP_DATA.profile.topSkills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommended Top Careers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 min-w-0">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6">AI Recommended Top Careers for You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MOCK_SKILL_GAP_DATA.careers.map((career, idx) => (
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
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1 truncate">{career.title}</h4>
                  <p className={`text-xs font-bold ${career.active ? 'text-[#00a878]' : 'text-slate-500'}`}>{career.match}% Match</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="material-symbols-outlined text-lg text-blue-500">info</span>
              Based on your interests, skills and academic background
            </div>
          </div>

        </div>

        {/* Row 2: Skills Comparison & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 min-w-0">
          
          {/* Skills Comparison Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 min-w-0 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                Skills Comparison: You vs Required
                <span className="inline-block px-2.5 py-1 bg-[#00a878]/10 text-[#00a878] rounded-md text-xs border border-[#00a878]/20 whitespace-nowrap">92% Match</span>
              </h3>
              <div className="flex gap-4 text-xs font-bold text-slate-600 shrink-0">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#00a878]"></div> Match</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div> Partial</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Missing</div>
              </div>
            </div>
            
            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Your Current Skills</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Required for {MOCK_SKILL_GAP_DATA.comparison.targetCareer}</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Skill Gap</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {MOCK_SKILL_GAP_DATA.comparison.skills.map((skill, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 pr-4">
                        {skill.current === 'Not learned yet' ? (
                          <span className="text-slate-400 italic font-medium">{skill.current}</span>
                        ) : (
                          <div className="flex items-center gap-2 font-semibold text-slate-700">
                            <span className="material-symbols-outlined text-[#00a878] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 
                            {skill.current}
                          </div>
                        )}
                      </td>
                      <td className={`py-3.5 pr-4 font-semibold ${skill.status === 'Missing' ? 'text-red-600' : 'text-slate-900'}`}>
                        {skill.required}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide
                          ${skill.status === 'Match' ? 'bg-[#00a878]/10 text-[#00a878] border border-[#00a878]/20' : 
                            skill.status === 'Partial' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200/50' : 
                            'bg-red-50 text-red-600 border border-red-100'}`}
                        >
                          {skill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                  Based on your profile, you are almost there! Bridging these skill gaps will significantly increase your chances of getting shortlisted.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-red-500 mb-3 uppercase tracking-wider">Top Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {MOCK_SKILL_GAP_DATA.insights.missingSkills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 rounded-md font-bold text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Match Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-5">Overall Progress</h3>
              <div className="flex items-center gap-6">
                
                {/* Fake Radial Progress */}
                <div className="relative w-[100px] h-[100px] shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-slate-100" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="10"></circle>
                    <circle className="text-[#00a878]" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="20.096" strokeLinecap="round" strokeWidth="10"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl text-slate-900 font-black leading-none">{MOCK_SKILL_GAP_DATA.insights.progress.have + MOCK_SKILL_GAP_DATA.insights.progress.partial}%</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3.5">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5"><span className="text-slate-700">Skills You Have</span><span className="text-slate-500">{MOCK_SKILL_GAP_DATA.insights.progress.have}%</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-[#00a878] h-1.5 rounded-full" style={{ width: `${MOCK_SKILL_GAP_DATA.insights.progress.have}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5"><span className="text-slate-700">Partial Skills</span><span className="text-slate-500">{MOCK_SKILL_GAP_DATA.insights.progress.partial}%</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${MOCK_SKILL_GAP_DATA.insights.progress.partial}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5"><span className="text-slate-700">Missing Skills</span><span className="text-slate-500">{MOCK_SKILL_GAP_DATA.insights.progress.missing}%</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${MOCK_SKILL_GAP_DATA.insights.progress.missing}%` }}></div></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Row 3: Action Plan Bottom Row */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-lg font-extrabold text-slate-900">Recommended Action Plan</h3>
            <a className="text-[#00a878] font-bold text-sm flex items-center gap-1 hover:underline shrink-0" href="#">
                View Full Learning Plan <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {MOCK_SKILL_GAP_DATA.actionPlan.map(plan => (
              <div key={plan.step} className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0
                  ${plan.color === 'red' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-200/50'}`}>
                  {plan.step}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1 truncate">{plan.title}</h4>
                  <p className="font-medium text-slate-500 text-xs mb-3">{plan.priority} • {plan.est}</p>
                  <button className="text-xs bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors font-bold text-slate-700">
                    {plan.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
