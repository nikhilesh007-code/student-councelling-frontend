import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/resources/')({
  component: ResourcesPage,
})

const MOCK_RESOURCES_DATA = {
  header: {
    targetCareer: 'Software Engineer',
    focusAreas: ['React', 'Git & GitHub', 'System Design', 'DSA'],
    totalRecommended: 24,
    weeklyGoal: '8 hrs / week'
  },
  courses: [
    {
      id: 1,
      title: 'React for Beginners - Build Real World Projects',
      provider: 'Udemy',
      rating: 4.8,
      reviews: '12.4K',
      level: 'Beginner',
      duration: '12 hours',
      language: 'English',
      iconType: 'react',
      iconBg: '#20232a',
    },
    {
      id: 2,
      title: 'Complete Git & GitHub Bootcamp',
      provider: 'Coursera',
      rating: 4.7,
      reviews: '8.9K',
      level: 'Beginner',
      duration: '6 hours',
      language: 'English',
      iconType: 'git',
      iconBg: '#F05340',
    }
  ],
  certifications: [
    {
      id: 1,
      title: 'Google IT Support Professional Certificate',
      provider: 'Coursera',
      rating: 4.8,
      reviews: '22K',
      level: 'Beginner',
      duration: '3-6 months',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaP9RzZu8XpiKFQlsqPnYi3jy1cHBAYwAzZkMAz2f4N8ADR3LRn8eeKxpANCiWvBr9lxasZ5pCswbTCgcx_OB0tZHj9pWOVJ6vriz7ZN5ICDXBEX0jYbMgr2YcBYZIQuUirPKWLDDqXgbDxKeqQS9cOa__-37WNKMQ3hpI-ytzljGX_OB_mP-I2zHkHhmcPqBNID3TUTzJClcacPbgvSxalmOv7zlqKTz1wJi2pPtKXDs4_G7HdHfzlisoaB4CJJq3tyAt3EzL7VA'
    },
    {
      id: 2,
      title: 'AWS Cloud Practitioner Essentials',
      provider: 'AWS Training',
      rating: 4.7,
      reviews: '18K',
      level: 'Beginner',
      duration: '2-3 months',
      type: 'text',
      text: 'AWS',
      bg: '#232F3E',
    },
    {
      id: 3,
      title: 'Microsoft Azure Fundamentals (AZ-900)',
      provider: 'Microsoft Learn',
      rating: 4.6,
      reviews: '9K',
      level: 'Beginner',
      duration: '6-8 weeks',
      type: 'icon',
      bg: '#00A4EF',
    }
  ],
  categories: {
    studyMaterials: [
      { name: 'PDF Notes', icon: 'picture_as_pdf' },
      { name: 'E-books', icon: 'menu_book' },
      { name: 'Practice Sheets', icon: 'assignment' },
      { name: 'Interview Questions', icon: 'quiz' }
    ],
    practicePlatforms: [
      { name: 'LeetCode', icon: 'code' },
      { name: 'GeeksforGeeks', icon: 'terminal' },
      { name: 'HackerRank', icon: 'developer_board' },
      { name: 'CodeChef', icon: 'bug_report' }
    ],
    videoPlatforms: [
      { name: 'YouTube', icon: 'play_circle', color: 'text-red-500' },
      { name: 'NPTEL', icon: 'school', color: 'text-blue-500' },
      { name: 'Coursera', icon: 'copyright', color: 'text-blue-700' },
      { name: 'Udemy', icon: 'u_turn_right', color: 'text-purple-600' }
    ],
    helpfulWebsites: [
      { name: 'MDN Web Docs', iconText: 'M', style: 'text-center' },
      { name: 'freeCodeCamp', iconText: '(A)', style: 'text-center' },
      { name: 'Stack Overflow', icon: 'layers', color: 'text-orange-500' },
      { name: 'Dev.to', iconText: 'DEV', style: 'bg-slate-900 text-white px-0.5 rounded' }
    ]
  },
  recommendations: [
    { id: 1, title: 'Learn React to build modern web apps', priority: 'High Priority', color: 'bg-emerald-100 text-[#00a878]' },
    { id: 2, title: 'Master Git & GitHub for version control', priority: 'High Priority', color: 'bg-emerald-100 text-[#00a878]' },
    { id: 3, title: 'Practice DSA to improve problem solving', priority: 'Medium Priority', color: 'bg-amber-100 text-amber-700' },
    { id: 4, title: 'Build 2-3 projects for your portfolio', priority: 'Medium Priority', color: 'bg-amber-100 text-amber-700' },
    { id: 5, title: 'Learn System Design for scaling apps', priority: 'Low Priority', color: 'bg-slate-100 text-slate-600' }
  ],
  progress: [
    { id: 1, title: 'React for Beginners', icon: 'code', iconColor: 'text-blue-500', percent: 70, status: '8.4 / 12 hours completed' },
    { id: 2, title: 'Git & GitHub Bootcamp', icon: 'commit', iconColor: 'text-red-500', percent: 40, status: '2.4 / 6 hours completed' },
    { id: 3, title: 'DSA - Problem Solving', customIcon: '</>', percent: 25, status: '5.0 / 20 hours completed' }
  ],
  weeklyPlan: [
    { day: 'Mon', status: 'done', height: '100%' },
    { day: 'Tue', status: 'done', height: '70%' },
    { day: 'Wed', status: 'today', height: '50%' },
    { day: 'Thu', status: 'future', height: '0%' },
    { day: 'Fri', status: 'future', height: '0%' },
    { day: 'Sat', status: 'future', height: '0%' },
    { day: 'Sun', status: 'future', height: '0%' }
  ]
}

function ResourcesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading personalized resources...</p>
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
           <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load resources</h3>
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
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Learning Resources</h2>
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Curated resources to help you learn in-demand skills and grow faster.
          </p>
        </div>

        {/* Context Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 flex flex-wrap gap-8 items-center border border-slate-100 min-w-0">
          <div className="flex items-center gap-4 flex-1 min-w-[250px]">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-[#00a878]">
              <span className="material-symbols-outlined">code</span>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Target Career</p>
              <p className="text-[16px] font-extrabold text-slate-900 truncate">{MOCK_RESOURCES_DATA.header.targetCareer}</p>
            </div>
          </div>
          <div className="hidden lg:block w-px h-12 bg-slate-100"></div>
          
          <div className="flex-1 min-w-[280px]">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-bold">Focus Areas (Based on Skill Gaps)</p>
            <div className="flex gap-2 flex-wrap">
              {MOCK_RESOURCES_DATA.header.focusAreas.map(area => (
                <span key={area} className="px-3 py-1 bg-slate-50 text-slate-700 text-xs rounded-full font-bold border border-slate-100">
                  {area}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden xl:block w-px h-12 bg-slate-100"></div>
          
          <div className="flex gap-8 flex-wrap">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Total Recommended</p>
              <p className="text-[16px] font-extrabold text-[#00a878]">{MOCK_RESOURCES_DATA.header.totalRecommended} Resources</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span> Weekly Goal
              </p>
              <p className="text-[16px] font-extrabold text-slate-900">{MOCK_RESOURCES_DATA.header.weeklyGoal}</p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Recommended Courses Section */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-slate-900">Recommended Courses</h3>
                <a className="text-[12px] font-bold text-[#00a878] hover:underline flex items-center gap-1" href="#">
                  View All Courses <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_RESOURCES_DATA.courses.map(course => (
                  <div key={course.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 bg-slate-50/50 cursor-pointer group transition-all">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: course.iconBg }}>
                        {course.iconType === 'react' ? (
                          <svg className="w-8 h-8 text-[#61dafb]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.96 4c-3.1 0-5.8.58-7.82 1.57-1.92.93-3.14 2.2-3.14 3.53s1.22 2.6 3.14 3.53c2 .99 4.72 1.57 7.82 1.57s5.82-.58 7.82-1.57c1.92-.93 3.14-2.2 3.14-3.53s-1.22-2.6-3.14-3.53C21.78 4.58 19.06 4 15.96 4zM11.96 6.54c2.8 0 5.2.47 6.94 1.28 1.62.75 2.5 1.63 2.5 2.28s-.88 1.53-2.5 2.28c-1.74.81-4.14 1.28-6.94 1.28s-5.2-.47-6.94-1.28c-1.62-.75-2.5-1.63-2.5-2.28s.88-1.53 2.5-2.28C6.76 7.01 9.16 6.54 11.96 6.54zm-2.82 3.66a2.82 2.82 0 1 0 0 5.64 2.82 2.82 0 0 0 0-5.64z"></path></svg>
                        ) : (
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.24 13.96c-.33 1.05-1.12 1.83-2.17 2.16-1.05.33-2.2.33-3.25 0-1.05-.33-1.84-1.11-2.17-2.16-.33-1.05-.33-2.2 0-3.25.33-1.05 1.12-1.84 2.17-2.17 1.05-.33 2.2-.33 3.25 0 1.05.33 1.84 1.12 2.17 2.17.33 1.05.33 2.2 0 3.25z"></path></svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-extrabold text-slate-900 line-clamp-2 mb-1 group-hover:text-[#00a878] transition-colors">{course.title}</h4>
                        <p className="text-xs font-medium text-slate-500 mb-2">{course.provider}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-xs font-bold text-slate-700">{course.rating}</span>
                            <span className="text-xs font-medium text-slate-500">({course.reviews})</span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-[#00a878] border border-emerald-100 text-[10px] font-extrabold rounded">
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-500">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {course.duration}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">language</span> {course.language}</span>
                      </div>
                      <button className="text-slate-400 hover:text-[#00a878] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications Section */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-slate-900">Certifications to Boost Your Profile</h3>
                <a className="text-[12px] font-bold text-[#00a878] hover:underline flex items-center gap-1" href="#">
                  View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {MOCK_RESOURCES_DATA.certifications.map(cert => (
                  <div key={cert.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 bg-slate-50/50 flex flex-col h-full transition-all cursor-pointer group">
                    <div className="flex items-start gap-3 mb-3">
                      {cert.img && <img alt="Logo" className="w-8 h-8 object-contain shrink-0" src={cert.img} />}
                      {cert.type === 'text' && (
                        <div className="w-8 h-8 flex items-center justify-center font-extrabold text-[10px] text-white rounded shrink-0" style={{ backgroundColor: cert.bg }}>
                          {cert.text}
                        </div>
                      )}
                      {cert.type === 'icon' && (
                        <div className="w-8 h-8 flex items-center justify-center rounded shrink-0" style={{ backgroundColor: cert.bg }}>
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"></path></svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-extrabold text-slate-900 leading-snug group-hover:text-[#00a878] transition-colors line-clamp-2">{cert.title}</h4>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">{cert.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-4 mt-auto">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold text-slate-700">{cert.rating}</span>
                        <span className="text-xs font-medium text-slate-500">({cert.reviews})</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#00a878] border border-emerald-100 text-[10px] font-extrabold rounded">
                        {cert.level}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_month</span> {cert.duration}</span>
                      <button className="text-slate-400 hover:text-[#00a878] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Resource Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              
              {/* Study Materials */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
                <h4 className="text-[15px] font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">Study Materials</h4>
                <ul className="space-y-3 flex-1">
                  {MOCK_RESOURCES_DATA.categories.studyMaterials.map((item, idx) => (
                    <li key={idx}>
                      <a className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-[#00a878] transition-colors" href="#">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">{item.icon}</span> {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 text-center">
                  <a className="text-[11px] font-extrabold text-[#00a878] hover:underline" href="#">View All →</a>
                </div>
              </div>

              {/* Practice Platforms */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
                <h4 className="text-[15px] font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">Practice Platforms</h4>
                <ul className="space-y-3 flex-1">
                  {MOCK_RESOURCES_DATA.categories.practicePlatforms.map((item, idx) => (
                    <li key={idx}>
                      <a className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-[#00a878] transition-colors" href="#">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">{item.icon}</span> {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 text-center">
                  <a className="text-[11px] font-extrabold text-[#00a878] hover:underline" href="#">View All →</a>
                </div>
              </div>

              {/* Video Platforms */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
                <h4 className="text-[15px] font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">Video Platforms</h4>
                <ul className="space-y-3 flex-1">
                  {MOCK_RESOURCES_DATA.categories.videoPlatforms.map((item, idx) => (
                    <li key={idx}>
                      <a className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-[#00a878] transition-colors" href="#">
                        <span className={`material-symbols-outlined text-[16px] ${item.color}`}>{item.icon}</span> {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 text-center">
                  <a className="text-[11px] font-extrabold text-[#00a878] hover:underline" href="#">View All →</a>
                </div>
              </div>

              {/* Helpful Websites */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full">
                <h4 className="text-[15px] font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">Helpful Websites</h4>
                <ul className="space-y-3 flex-1">
                  {MOCK_RESOURCES_DATA.categories.helpfulWebsites.map((item, idx) => (
                    <li key={idx}>
                      <a className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-[#00a878] transition-colors" href="#">
                        {item.icon ? (
                          <span className={`material-symbols-outlined text-[16px] ${item.color}`}>{item.icon}</span>
                        ) : (
                          <span className={`font-extrabold font-mono text-[10px] w-4 text-center ${item.style}`}>{item.iconText}</span>
                        )}
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 text-center">
                  <a className="text-[11px] font-extrabold text-[#00a878] hover:underline" href="#">View All →</a>
                </div>
              </div>

            </div>

            {/* Skill-gap Information */}
            <div className="bg-gradient-to-r from-emerald-50 to-white rounded-2xl p-6 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between mt-4 shadow-sm gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#00a878] border border-emerald-50 shrink-0">
                  <span className="material-symbols-outlined">track_changes</span>
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-slate-900 mb-1">Focus on Skill Gaps</h4>
                  <p className="text-[12px] font-medium text-slate-500">Prioritize learning the missing skills identified in your assessment to accelerate your career growth.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-8 min-w-0">
            
            {/* AI Recommended For You */}
            <div className="bg-emerald-50/50 rounded-3xl p-6 relative overflow-hidden border border-emerald-100">
              <div className="absolute top-4 right-4 text-emerald-100/50 text-3xl">✦</div>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="text-[17px] font-extrabold text-slate-900">AI Recommended For You</h3>
              </div>
              <div className="space-y-4">
                {MOCK_RESOURCES_DATA.recommendations.map((rec, idx) => (
                  <div key={rec.id} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 shadow-sm
                      ${idx === 0 ? 'bg-[#00a878] text-white' : 
                        idx === 1 ? 'bg-emerald-100 text-[#00a878]' : 
                        idx < 4 ? 'bg-emerald-50 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                      {rec.id}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800 mb-1.5 hover:text-[#00a878] cursor-pointer leading-snug">{rec.title}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide border border-black/5 ${rec.color}`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 border border-[#00a878]/30 text-[#00a878] rounded-xl text-[12px] font-extrabold hover:bg-[#00a878] hover:text-white transition-colors bg-white/50 backdrop-blur-sm">
                  View Full Recommendation Plan →
              </button>
            </div>

            {/* Your Learning Progress */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm min-w-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[17px] font-extrabold text-slate-900">Your Learning Progress</h3>
                <a className="text-[11px] font-bold text-[#00a878] hover:underline" href="#">View All →</a>
              </div>
              <div className="space-y-6">
                {MOCK_RESOURCES_DATA.progress.map((prog, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[13px] mb-2">
                      <div className="flex items-center gap-2">
                        {prog.icon ? (
                          <span className={`material-symbols-outlined text-[16px] ${prog.iconColor}`}>{prog.icon}</span>
                        ) : (
                          <div className="w-4 h-4 bg-slate-800 text-white flex items-center justify-center rounded text-[8px] font-mono">{prog.customIcon}</div>
                        )}
                        <span className="font-extrabold text-slate-800">{prog.title}</span>
                      </div>
                      <span className="font-black text-slate-900">{prog.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00a878] rounded-full" style={{ width: `${prog.percent}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mt-1.5 text-right">{prog.status}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 text-center">
                <a className="text-[12px] font-extrabold text-[#00a878] hover:underline flex items-center justify-center gap-1" href="#">
                    Go to My Learning <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Weekly Learning Plan Widget */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm min-w-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[17px] font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-slate-400">calendar_month</span> Weekly Plan
                </h3>
                <a className="text-[11px] font-bold text-[#00a878] hover:underline" href="#">View Calendar →</a>
              </div>
              
              <div className="flex justify-between items-end gap-1 mb-6 h-24">
                {MOCK_RESOURCES_DATA.weeklyPlan.map((day, idx) => (
                  <div key={idx} className={`flex flex-col items-center gap-1.5 ${day.status === 'future' ? 'opacity-60' : ''}`}>
                    <span className={`text-[10px] ${day.status === 'today' ? 'text-slate-800 font-extrabold' : 'text-slate-400 font-bold'}`}>{day.day}</span>
                    <div className={`w-8 h-16 rounded-t-md relative overflow-hidden ${day.status === 'future' ? 'bg-slate-50' : day.status === 'today' ? 'bg-slate-100' : 'bg-emerald-50'}`}>
                      <div className="absolute bottom-0 w-full bg-[#00a878] rounded-sm transition-all" style={{ height: day.height }}></div>
                    </div>
                    {day.status === 'done' ? (
                      <span className="material-symbols-outlined text-[14px] text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    ) : day.status === 'today' ? (
                      <div className="w-2 h-2 bg-[#00a878] rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-transparent"></div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="bg-amber-50 text-amber-700 text-[11px] p-3 rounded-xl text-center border border-amber-100 font-bold">
                  ⭐ Consistency is key. Keep learning! 🚀
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
