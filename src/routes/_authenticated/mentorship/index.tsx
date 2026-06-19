import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/mentorship/')({
  component: MentorshipPage,
})

const MOCK_MENTORSHIP_DATA = {
  featured: [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      role: 'Staff ML Engineer',
      company: 'Google',
      experience: '12+ Yrs',
      rating: 4.9,
      reviews: 124,
      bio: 'Specializing in deep learning and large language models. Passionate about helping students break into AI.',
      skills: ['Machine Learning', 'Python', 'TensorFlow'],
      availability: 'Available this week',
      avatar: 'https://i.pravatar.cc/150?u=sarahchen'
    },
    {
      id: 2,
      name: 'David Kumar',
      role: 'Senior Product Mgr',
      company: 'Microsoft',
      experience: '8 Yrs',
      rating: 4.8,
      reviews: 89,
      bio: 'I help engineers transition into product management. Focus on strategy, user empathy, and agile.',
      skills: ['Product Strategy', 'Agile', 'UI/UX'],
      availability: 'Next available: Nov 2',
      avatar: 'https://i.pravatar.cc/150?u=davidk'
    }
  ],
  recommended: [
    {
      id: 3,
      name: 'James Wilson',
      role: 'Senior Frontend Dev',
      company: 'Netflix',
      match: '98%',
      skills: ['React', 'Performance', 'Architecture'],
      bio: 'Ex-Amazon. I specialize in building highly scalable frontends and cracking frontend interviews.',
      avatar: 'https://i.pravatar.cc/150?u=jamesw'
    },
    {
      id: 4,
      name: 'Anita Patel',
      role: 'Backend Engineer',
      company: 'Stripe',
      match: '95%',
      skills: ['Node.js', 'System Design', 'APIs'],
      bio: 'Love talking about distributed systems and payments architecture.',
      avatar: 'https://i.pravatar.cc/150?u=anitap'
    }
  ],
  categories: [
    { id: 'se', name: 'Software Engineering', icon: 'code', count: 450 },
    { id: 'ds', name: 'Data Science', icon: 'query_stats', count: 320 },
    { id: 'ai', name: 'AI/ML', icon: 'psychology', count: 280 },
    { id: 'pm', name: 'Product Management', icon: 'view_kanban', count: 190 },
    { id: 'ui', name: 'UI/UX Design', icon: 'palette', count: 150 },
    { id: 'cy', name: 'Cybersecurity', icon: 'security', count: 110 }
  ],
  upcomingSessions: [
    { id: 1, date: 'Oct 24', time: '10:00 AM', mentor: 'Dr. Sarah Chen', topic: 'System Design Interview Prep', status: 'Confirmed' }
  ],
  pastSessions: [
    { id: 1, date: 'Sep 15', mentor: 'David Kumar', summary: 'Reviewed React portfolio and optimized components.', feedback: 'Excellent' }
  ],
  discussions: [
    { id: 1, topic: 'How to transition from QA to Backend Development?', replies: 24, views: '1.2K', tags: ['Career Advice', 'Backend'] },
    { id: 2, topic: 'Best resources for learning System Design in 2025', replies: 56, views: '3.4K', tags: ['System Design', 'Interview Prep'] },
    { id: 3, topic: 'Mock Interview Exchange Thread - November', replies: 128, views: '5.1K', tags: ['Interviews', 'Networking'] }
  ],
  aiSuggestions: [
    'Based on your target of Software Engineer, we recommend booking a session with a Senior Frontend Dev to review your React projects.',
    'Your skill gap analysis shows missing System Design skills. We highly recommend Dr. Sarah Chen for this topic.'
  ]
}

function MentorshipPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('se')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading mentors...</p>
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
           <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load</h3>
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Mentorship <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </h2>
            <p className="text-[14px] text-slate-500">Connect with industry experts for 1-on-1 guidance, mock interviews, and career advice.</p>
          </div>
          <button className="bg-[#00a878] text-white px-6 py-3 rounded-xl text-[13px] font-extrabold hover:bg-[#008b63] transition-colors shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[18px]">search</span> Find a Mentor
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Category Filters */}
            <div className="min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 mb-3">Explore by Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 min-w-0">
                {MOCK_MENTORSHIP_DATA.categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center justify-center gap-2 border rounded-xl p-3 min-w-0 transition-all ${
                      activeCategory === cat.id 
                      ? 'bg-emerald-50 border-emerald-200 text-[#00a878] shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-[#00a878]/30 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined shrink-0 text-[28px]" style={{ fontVariationSettings: activeCategory === cat.id ? "'FILL' 1" : "'FILL' 0" }}>
                      {cat.icon}
                    </span>
                    <div className="text-center min-w-0 w-full overflow-hidden">
                      <div className="text-[11px] font-extrabold leading-tight truncate px-1">{cat.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Recommended Mentors */}
            <div className="min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> Recommended For You
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                {MOCK_MENTORSHIP_DATA.recommended.map(mentor => (
                  <div key={mentor.id} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all min-w-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#00a878] text-white px-3 py-1 rounded-bl-xl text-[10px] font-extrabold">
                      {mentor.match} Match
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={mentor.avatar} alt={mentor.name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-50" />
                      <div className="min-w-0">
                        <h4 className="text-[16px] font-extrabold text-slate-900 truncate">{mentor.name}</h4>
                        <p className="text-[12px] font-bold text-slate-500 truncate">{mentor.role} at <span className="text-slate-700">{mentor.company}</span></p>
                      </div>
                    </div>
                    <p className="text-[13px] font-medium text-slate-600 line-clamp-2 mb-4 leading-relaxed">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {mentor.skills.map(skill => (
                        <span key={skill} className="bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-extrabold">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto border-t border-slate-100 pt-4">
                      <button className="w-full bg-emerald-50 text-[#00a878] py-2 rounded-xl text-[12px] font-extrabold hover:bg-emerald-100 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Mentors */}
            <div className="min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#F4B400]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> Featured Mentors
                </h3>
              </div>
              
              <div className="space-y-4 min-w-0">
                {MOCK_MENTORSHIP_DATA.featured.map(mentor => (
                  <div key={mentor.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all min-w-0">
                    <img src={mentor.avatar} alt={mentor.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-slate-50 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <div className="min-w-0">
                          <h4 className="text-[17px] font-extrabold text-slate-900 truncate">{mentor.name}</h4>
                          <p className="text-[13px] font-bold text-slate-500 truncate">{mentor.role} at <span className="text-slate-800">{mentor.company}</span> • {mentor.experience}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 shrink-0 self-start">
                          <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-[12px] font-extrabold text-amber-700">{mentor.rating}</span>
                          <span className="text-[10px] font-bold text-amber-600/70">({mentor.reviews})</span>
                        </div>
                      </div>
                      
                      <p className="text-[13px] font-medium text-slate-600 mb-3 leading-relaxed">{mentor.bio}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.skills.map(skill => (
                          <span key={skill} className="bg-slate-50 text-slate-600 px-2 py-1 rounded text-[10px] font-extrabold">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                        <span className="text-[12px] font-bold text-[#00a878] flex items-center gap-1.5 w-full sm:w-auto">
                          <span className="material-symbols-outlined text-[16px]">event_available</span> {mentor.availability}
                        </span>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button className="flex-1 sm:flex-none border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[12px] font-extrabold hover:bg-slate-50 transition-colors">
                            Message
                          </button>
                          <button className="flex-1 sm:flex-none bg-[#00a878] text-white px-4 py-2 rounded-xl text-[12px] font-extrabold hover:bg-[#008b63] transition-colors">
                            Book Session
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Discussions */}
            <div className="min-w-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500">forum</span> Community Discussions
                </h3>
                <a className="text-[12px] font-bold text-[#00a878] hover:underline" href="#">View All</a>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-w-0">
                {MOCK_MENTORSHIP_DATA.discussions.map((disc, idx) => (
                  <div key={disc.id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${idx !== MOCK_MENTORSHIP_DATA.discussions.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[14px] font-extrabold text-slate-900 mb-2 truncate group-hover:text-[#00a878]">{disc.topic}</h4>
                      <div className="flex flex-wrap gap-2">
                        {disc.tags.map(tag => (
                          <span key={tag} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-extrabold">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] font-bold text-slate-400 shrink-0">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span> {disc.replies} Replies</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">visibility</span> {disc.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 min-w-0">
              <button className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:border-[#00a878]/30 hover:bg-emerald-50/30 transition-all text-center group flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">calendar_month</span>
                <span className="text-[12px] font-extrabold text-slate-700">Book Session</span>
              </button>
              <button className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:border-[#00a878]/30 hover:bg-emerald-50/30 transition-all text-center group flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-purple-500 bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">mail</span>
                <span className="text-[12px] font-extrabold text-slate-700">Messages</span>
              </button>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-[#00a878]">event</span> Upcoming Sessions
              </h3>
              
              {MOCK_MENTORSHIP_DATA.upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {MOCK_MENTORSHIP_DATA.upcomingSessions.map(session => (
                    <div key={session.id} className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-[#00a878] text-white px-2 py-0.5 rounded text-[10px] font-extrabold">{session.status}</span>
                        <div className="text-right">
                          <p className="text-[12px] font-extrabold text-slate-900">{session.date}</p>
                          <p className="text-[11px] font-bold text-slate-500">{session.time}</p>
                        </div>
                      </div>
                      <h4 className="text-[14px] font-extrabold text-slate-900 mb-1">{session.topic}</h4>
                      <p className="text-[12px] font-medium text-slate-600 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">person</span> with {session.mentor}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-lg text-[11px] font-extrabold hover:bg-slate-50">Reschedule</button>
                        <button className="flex-1 bg-[#00a878] text-white py-1.5 rounded-lg text-[11px] font-extrabold hover:bg-[#008b63]">Join Call</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">event_busy</span>
                  <p className="text-[13px] font-medium text-slate-500">No upcoming sessions.</p>
                </div>
              )}
            </div>

            {/* AI Mentor Suggestions */}
            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl shadow-sm border border-emerald-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> AI Insights
              </h3>
              <ul className="space-y-4">
                {MOCK_MENTORSHIP_DATA.aiSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00a878] mt-1.5 shrink-0"></div>
                    <p className="text-[12px] font-medium text-slate-700 leading-relaxed">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Past Sessions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">history</span> Past Sessions
                </h3>
              </div>
              <div className="space-y-4">
                {MOCK_MENTORSHIP_DATA.pastSessions.map(session => (
                  <div key={session.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[13px] font-extrabold text-slate-900">{session.mentor}</p>
                      <span className="text-[11px] font-bold text-slate-400">{session.date}</span>
                    </div>
                    <p className="text-[12px] font-medium text-slate-600 mb-2 line-clamp-2">{session.summary}</p>
                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                      Feedback: {session.feedback}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
