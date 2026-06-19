import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/opportunities/')({
  component: OpportunitiesPage,
})

const MOCK_OPPORTUNITIES_DATA = {
  categories: [
    { id: 'all', label: 'All', count: 128, icon: 'widgets', active: true },
    { id: 'internships', label: 'Internships', count: 45, icon: 'business_center' },
    { id: 'jobs', label: 'Jobs', count: 38, icon: 'work' },
    { id: 'hackathons', label: 'Hackathons', count: 18, icon: 'code' },
    { id: 'scholarships', label: 'Scholarships', count: 17, icon: 'school' },
    { id: 'competitions', label: 'Competitions', count: 10, icon: 'emoji_events' }
  ],
  featured: [
    {
      id: 1,
      title: 'Software Developer Intern',
      company: 'Google',
      type: 'Internship',
      workMode: 'Remote',
      location: 'Remote',
      duration: '3 months',
      desc: 'Work on real-world projects and build scalable solutions.',
      deadline: '25 May 2025',
      logoText: 'google',
      logoColor: 'text-[#4285F4]',
      logoIcon: true
    },
    {
      id: 2,
      title: 'Frontend Developer Intern',
      company: 'Microsoft',
      type: 'Internship',
      workMode: 'Onsite',
      location: 'Hyderabad, India',
      duration: '6 months',
      desc: 'Build amazing user experiences with modern web technologies.',
      deadline: '30 May 2025',
      logoText: 'window',
      logoColor: 'text-[#00A4EF]',
      logoIcon: true
    },
    {
      id: 3,
      title: 'Data Analyst Intern',
      company: 'Infosys',
      type: 'Internship',
      workMode: 'Remote',
      location: 'Remote',
      duration: '4 months',
      desc: 'Analyze data and generate insights to drive decisions.',
      deadline: '20 May 2025',
      logoText: 'Infosys',
      logoColor: 'text-[#007CC3]',
      logoIcon: false
    }
  ],
  moreOps: [
    {
      id: 1,
      title: 'Backend Developer Intern',
      type: 'Internship',
      company: 'Amazon',
      companyIcon: 'shopping_cart',
      location: 'Remote',
      deadline: '28 May 2025',
      match: '92%'
    },
    {
      id: 2,
      title: 'AI/ML Research Intern',
      type: 'Internship',
      company: 'NVIDIA',
      companyIcon: 'memory',
      location: 'Bangalore',
      deadline: '01 Jun 2025',
      match: '90%'
    },
    {
      id: 3,
      title: 'Product Manager Intern',
      type: 'Internship',
      company: 'PayPal',
      companyIcon: 'payments',
      location: 'Remote',
      deadline: '05 Jun 2025',
      match: '88%'
    }
  ],
  recommendations: [
    { id: 1, title: 'Frontend Development Internship', company: 'Microsoft', match: '94%', icon: 'window', iconColor: 'text-[#00A4EF]' },
    { id: 2, title: 'React Hackathon 2026', company: 'HackAura', match: '92%', icon: 'code', iconColor: 'text-[#F4B400]' },
    { id: 3, title: 'Web Development Scholarship', company: 'Google Developers', match: '90%', icon: 'google', iconColor: 'text-[#4285F4]' }
  ],
  deadlines: [
    { id: 1, title: 'Google STEP Internship', type: 'Internship', date: '25 May', timeLeft: '3 days left', active: true },
    { id: 2, title: 'Smart India Hackathon', type: null, date: '31 May', timeLeft: null, active: false }
  ]
}

function OpportunitiesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading opportunities...</p>
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
           <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load opportunities</h3>
           <p className="text-slate-500 mb-6">{error}</p>
           <button onClick={() => window.location.reload()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
         </div>
       </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Header & Search */}
            <div className="min-w-0">
              <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
                  Opportunities <span className="material-symbols-outlined text-[#00a878]">work</span>
              </h2>
              <p className="text-[14px] text-slate-500 mb-6">Discover internships, jobs, scholarships, hackathons and more to accelerate your career.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 items-end gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-0">
                <div className="min-w-0">
                  <label className="text-[12px] font-bold text-slate-500 block mb-1">Search Opportunities</label>
                  <div className="relative min-w-0">
                    <input 
                      type="text" 
                      placeholder="Search by role, company, skill..." 
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:border-[#00a878] focus:ring-1 focus:ring-[#00a878]" 
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="text-[12px] font-bold text-slate-500 block mb-1">Type</label>
                  <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:border-[#00a878] focus:ring-1 focus:ring-[#00a878] appearance-none">
                    <option>All Types</option>
                  </select>
                </div>
                <div className="min-w-0">
                  <label className="text-[12px] font-bold text-slate-500 block mb-1">Category</label>
                  <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:border-[#00a878] focus:ring-1 focus:ring-[#00a878] appearance-none">
                    <option>All Categories</option>
                  </select>
                </div>
                <button className="bg-[#00a878] text-white px-5 py-2.5 rounded-xl text-[13px] font-extrabold hover:bg-[#008b63] transition-colors flex items-center justify-center gap-1.5 h-[46px] w-full">
                  Filters <span className="material-symbols-outlined text-[18px]">filter_list</span>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 min-w-0">
              {MOCK_OPPORTUNITIES_DATA.categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 min-w-0 transition-colors ${
                    activeCategory === cat.id 
                    ? 'bg-emerald-50 border-emerald-200 text-[#00a878]' 
                    : 'bg-white border-slate-100 text-slate-700 hover:border-[#00a878]/30'
                  }`}
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: activeCategory === cat.id ? "'FILL' 1" : "'FILL' 0" }}>
                    {cat.icon}
                  </span>
                  <div className="text-left min-w-0 w-full overflow-hidden">
                    <div className="text-[13px] font-extrabold leading-tight truncate">{cat.label}</div>
                    <div className={`text-[11px] font-medium mt-0.5 ${activeCategory === cat.id ? 'text-[#00a878]/80' : 'text-slate-400'}`}>
                      {cat.count}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Featured Opportunities */}
            <div className="min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#F4B400]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> Featured Opportunities
                </h3>
                <a className="text-[12px] font-bold text-[#00a878] flex items-center hover:underline" href="#">
                  View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
                {MOCK_OPPORTUNITIES_DATA.featured.map(job => (
                  <div key={job.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all min-w-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden min-w-0">
                        {job.logoIcon ? (
                          <span className={`material-symbols-outlined ${job.logoColor} text-[24px]`}>{job.logoText}</span>
                        ) : (
                          <span className={`font-extrabold ${job.logoColor} text-[13px] truncate w-full text-center px-1`}>{job.logoText}</span>
                        )}
                      </div>
                      <button className="text-slate-300 hover:text-[#00a878] transition-colors">
                        <span className="material-symbols-outlined">bookmark_border</span>
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-emerald-50 text-[#00a878] px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                        {job.type}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                        {job.workMode}
                      </span>
                    </div>
                    
                    <h4 className="text-[16px] font-extrabold text-slate-900 mb-1 leading-tight truncate">{job.title}</h4>
                    <p className="text-[13px] font-medium text-slate-500 mb-3">{job.company}</p>
                    
                    <div className="flex gap-4 text-[12px] font-semibold text-slate-500 mb-4">
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">location_on</span> {job.location}</span>
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {job.duration}</span>
                    </div>
                    
                    <p className="text-[13px] font-medium text-slate-600 line-clamp-2 mb-5 leading-relaxed">{job.desc}</p>
                    
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-red-500">Apply by {job.deadline}</span>
                      <button className="border border-[#00a878]/30 text-[#00a878] px-4 py-1.5 rounded-xl text-[12px] font-extrabold hover:bg-emerald-50 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* More Opportunities Table */}
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4">More Opportunities For You</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-w-0">
                <div className="overflow-x-auto min-w-0 w-full">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-4 px-5">Opportunity</th>
                        <th className="py-4 px-5">Type</th>
                        <th className="py-4 px-5">Company</th>
                        <th className="py-4 px-5">Location</th>
                        <th className="py-4 px-5">Deadline</th>
                        <th className="py-4 px-5">Match</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px]">
                      {MOCK_OPPORTUNITIES_DATA.moreOps.map((op, idx) => (
                        <tr key={op.id} className={`${idx !== MOCK_OPPORTUNITIES_DATA.moreOps.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-colors group`}>
                          <td className="py-4 px-5 font-extrabold text-slate-900">{op.title}</td>
                          <td className="py-4 px-5">
                            <span className="bg-emerald-50 text-[#00a878] px-2 py-1 rounded text-[10px] font-extrabold uppercase">
                              {op.type}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-slate-400">{op.companyIcon}</span> {op.company}
                          </td>
                          <td className="py-4 px-5 font-semibold text-slate-500">{op.location}</td>
                          <td className="py-4 px-5 font-bold text-red-500 text-[12px]">{op.deadline}</td>
                          <td className="py-4 px-5 font-black text-[#00a878]">{op.match}</td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <button className="text-[#00a878] font-extrabold hover:underline mr-4">Apply</button>
                            <button className="text-slate-300 hover:text-[#00a878] align-middle transition-colors">
                              <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 text-center border-t border-slate-100 bg-slate-50/50">
                  <a className="text-[12px] font-extrabold text-slate-600 hover:text-[#00a878] transition-colors flex items-center justify-center gap-1" href="#">
                    View All Opportunities <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (AI Insights) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* AI Recommended */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> AI Recommended
              </h3>
              <p className="text-[12px] font-medium text-slate-500 mb-6">Based on your profile, skills and career goal.</p>
              
              <div className="space-y-5">
                {MOCK_OPPORTUNITIES_DATA.recommendations.map(rec => (
                  <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:border-[#00a878]/30 transition-colors overflow-hidden">
                        <span className={`material-symbols-outlined ${rec.iconColor} text-[20px]`}>{rec.icon}</span>
                      </div>
                      <div className="min-w-0 w-full">
                        <h4 className="text-[14px] font-extrabold text-slate-900 leading-snug truncate group-hover:text-[#00a878] transition-colors">{rec.title}</h4>
                        <p className="text-[12px] font-medium text-slate-500 truncate">{rec.company}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-[#00a878] bg-emerald-50 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto border border-emerald-100/50">
                      {rec.match} Match
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center border-t border-slate-100 pt-4">
                <a className="text-[12px] font-extrabold text-[#00a878] hover:underline flex items-center justify-center gap-1" href="#">
                  View All Recommendations <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">schedule</span> Upcoming Deadlines
                </h3>
                <a className="text-[12px] font-extrabold text-[#00a878] hover:underline" href="#">View All</a>
              </div>
              
              <div className="relative space-y-0 before:absolute before:inset-0 before:ml-[11px] before:w-[2px] before:bg-slate-100 pl-8">
                {MOCK_OPPORTUNITIES_DATA.deadlines.map((deadline, idx) => (
                  <div key={deadline.id} className="relative pb-6 last:pb-0">
                    <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10
                      ${deadline.active ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300'}`}>
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
                    </div>
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className={`text-[14px] font-extrabold mb-1 ${deadline.active ? 'text-slate-900' : 'text-slate-600'}`}>{deadline.title}</h4>
                        {deadline.type && (
                          <span className="bg-emerald-50 text-[#00a878] px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">
                            {deadline.type}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-[13px] font-bold ${deadline.active ? 'text-slate-900' : 'text-slate-500'}`}>{deadline.date}</div>
                        {deadline.timeLeft && (
                          <div className="text-[11px] font-extrabold text-red-500 mt-0.5">{deadline.timeLeft}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts Box */}
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4 min-w-0">
              <span className="material-symbols-outlined text-[#00a878] text-2xl shrink-0">notifications_active</span>
              <div>
                <h4 className="text-[15px] font-extrabold text-slate-900 mb-1">Never Miss an Opportunity!</h4>
                <p className="text-[13px] font-medium text-slate-600 mb-4 leading-relaxed">Enable notifications to get alerts for new internships and jobs.</p>
                <button className="bg-white border border-emerald-200 text-slate-800 px-4 py-2 rounded-xl text-[12px] font-extrabold hover:bg-emerald-50 hover:text-[#00a878] transition-colors shadow-sm">
                  Enable Alerts
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
