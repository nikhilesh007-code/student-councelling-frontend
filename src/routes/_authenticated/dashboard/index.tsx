import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: Dashboard,
})

const userName = 'Student'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'person', label: 'Profile' },
  { icon: 'explore', label: 'Career Guidance' },
  { icon: 'analytics', label: 'Skill Gap Analysis' },
  { icon: 'map', label: 'Career Roadmap' },
  { icon: 'menu_book', label: 'Learning Resources' },
  { icon: 'work', label: 'Opportunities' },
  { icon: 'description', label: 'Resume Analysis' },
  { icon: 'groups', label: 'Mentorship' },
  { icon: 'psychology', label: 'AI Chat Assistant' },
  { icon: 'school', label: 'Placement Preparation' },
  { icon: 'trending_up', label: 'Progress Tracking' },
  { icon: 'calendar_today', label: 'Study Planner' },
]

const stats = [
  {
    icon: 'track_changes',
    label: 'Career Match',
    value: '92%',
    sub: 'Excellent Match',
    color: '#00a878',
    bg: 'rgba(0,168,120,0.1)',
    progress: 92,
  },
  {
    icon: 'menu_book',
    label: 'Skills Learned',
    value: '12',
    sub: 'Keep Learning!',
    color: '#2563eb',
    bg: '#dbeafe',
    progress: null,
  },
  {
    icon: 'business_center',
    label: 'Internships',
    value: '8',
    sub: 'New opportunities',
    color: '#f97316',
    bg: '#ffedd5',
    progress: null,
  },
  {
    icon: 'trending_up',
    label: 'Progress',
    value: '80%',
    sub: 'Almost there!',
    color: '#9333ea',
    bg: '#f3e8ff',
    progress: 80,
  },
]

const careers = [
  { icon: 'code', label: 'Software Engineer', sub: 'High demand â€¢ Great career growth', match: '95%', iconColor: '#00a878', bg: 'rgba(0,168,120,0.1)' },
  { icon: 'bar_chart', label: 'Data Analyst', sub: 'High demand â€¢ Good salary', match: '90%', iconColor: '#3b82f6', bg: '#eff6ff' },
  { icon: 'design_services', label: 'UI/UX Designer', sub: 'High growth â€¢ Creative field', match: '85%', iconColor: '#f97316', bg: '#fff7ed' },
]

const tasks = [
  { label: 'Complete Resume', sub: 'Add your latest projects and skills', due: 'Due Today', dueColor: '#ba1a1a', done: true },
  { label: 'Learn React Basics', sub: 'Continue learning to improve your skills', due: 'Due in 2 days', dueColor: '#f97316', done: false },
  { label: 'Apply for Internship', sub: 'Frontend Developer Intern', due: 'Due in 5 days', dueColor: '#50606f', done: false },
  { label: 'Aptitude Practice', sub: 'Practice quantitative aptitude', due: 'Due in 7 days', dueColor: '#50606f', done: false },
]

const progressBars = [
  { label: 'Skills', value: 85 },
  { label: 'Courses', value: 78 },
  { label: 'Internships', value: 70 },
  { label: 'Projects', value: 88 },
]

const opportunities = [
  {
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6hZ9csPqic1uckyCdyqFtZpa7IxzBtvmayJxVTJuNlcLRm7MuRftDu5YTkTd-90uA-mKK8QtWy4TRn9SU719cx-55KPYuGB4rZNwLPLT1aDYhHEURrH859LlPH_p3-vYxCc2blS-FYjZTk78lr76-5sGcLELKNkxfMPvf4IgCJUfXITOzIZQQuhZ-QseQ_-rt0WTHE3M7QQ48IKKziQAl6xs5H2Q0kwHH136VwGboafEW-8vzhPSMhtB8ni2vVUMXWzB6hZq_Paje',
    alt: 'TCS Logo',
    title: 'TCS Digital Internship',
    role: 'Software Development Intern',
    tags: [{ icon: 'location_on', label: 'Remote' }, { icon: 'payments', label: 'Stipend' }],
    applyBy: '25 May 2024',
  },
  {
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2rWi4eu_zOQkhg2ajZL0m-gejg8VkqxjNJM1hYVDEa_hG0CfaanFcCpA8j2jLzQitCrYTJ2QWvdua0fvtaGoY8wYFJZvvaYL2hjfgU-XSwC52OSRGzkv9D948yzdFHS0Q84Zr10oj6NMJincNwg6ymchLj2jQB9TbEM7rhdzkI4Z-iR-rdGtzZbWu5YOgF7VPQMpG8YWabzyeLkTh6RfMLIssQ0TQBabWrYiVjCuap4tHkPtlD7vIQJ-wXpwBRynOa3YQE_gwivSC',
    alt: 'Infosys Logo',
    title: 'Infosys Springboard',
    role: 'Student Training Program',
    tags: [{ icon: 'language', label: 'Online' }, { icon: 'workspace_premium', label: 'Certificate' }],
    applyBy: '30 May 2024',
  },
]

function Dashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#f8fafd' }} className="text-[#1c1b1b]">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-style: normal;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .hover-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Sidebar */}
      <aside
        style={{ backgroundColor: '#fcf9f8', width: 260 }}
        className="h-screen fixed left-0 top-0 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col py-6 px-4 z-20"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00a878' }}>
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">Career<span style={{ color: '#00a878' }}>AI</span></h1>
            <p className="text-[10px] text-[#50606f] tracking-tight">Your Future, Our Guidance</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-colors ${
                activeNav === item.label
                  ? 'text-[#006c4c] font-bold border-l-4 border-[#006c4c] bg-[#00a878]/10 rounded-r-lg'
                  : 'text-[#50606f] hover:text-[#006c4c] hover:bg-[#f6f3f2]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={activeNav === item.label ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-[#bccac0]/20 mt-4 space-y-1">
          {['settings', 'logout'].map((icon) => (
            <button key={icon} className="w-full flex items-center gap-3 px-4 py-2.5 text-[#50606f] hover:text-[#006c4c] hover:bg-[#f6f3f2] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span className="text-sm capitalize">{icon}</span>
            </button>
          ))}
        </div>

        {/* Premium CTA */}
        <div className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: 'rgba(0,168,120,0.1)', borderColor: 'rgba(0,168,120,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#006c4c] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
            <span className="font-bold text-[12px] text-[#006c4c]">Go Premium</span>
          </div>
          <p className="text-[11px] text-[#50606f] leading-tight mb-3">Unlock advanced features and personalized support.</p>
          <button className="w-full py-1.5 bg-white text-[#006c4c] text-[12px] font-bold rounded-lg border border-[#006c4c]/20 shadow-sm hover:bg-[#006c4c] hover:text-white transition-all">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header
        style={{ left: 260, backgroundColor: '#fcf9f8' }}
        className="h-16 fixed top-0 right-0 z-10 flex justify-between items-center px-6 border-b border-[#bccac0]/30"
      >
        <div className="flex items-center gap-6 flex-1">
          <button className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="relative w-full max-w-md">
            <input
              className="w-full bg-[#f6f3f2] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#00a878]"
              placeholder="Search careers, skills, internships..."
              type="text"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#50606f] text-[20px]">search</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00a878] border-2 border-white rounded-full"></span>
          </button>
          <button className="text-[#50606f] hover:bg-[#e5e2e1] rounded-full p-2 transition-all">
            <span className="material-symbols-outlined">mail</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-[#bccac0]/30">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgWym7DldXnEhbwrZfOC_NtONNlu4wbur2YuUXlTYUj6VmxMEZO2HJWwSPYYQTXzRX7-PmkDBpwV_75e7fNpjESS8isWeROPalBEFI9HiCOwn-e2oZilJQCE3Kzbce13jlDDGk1vo1w5E7QIsPvJA687oWsXRDVYT-EUbDZWp4665oxoMeLY4aY6nJI_yrC_P5JnSo2qzObHk6mAqNTs8B3J8zJxzOZD4k7SgXV-Uty1g0yAf_Yq8cTiLkyqdOxyB7xfFEzPzlT_bp"
              alt="User Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-bold text-sm">{userName}</span>
            <span className="material-symbols-outlined text-[#50606f] text-[18px]">keyboard_arrow_down</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ marginLeft: 260 }} className="mt-16 p-8 min-h-screen">

        {/* Welcome */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold">Hello, {userName} ðŸ‘‹</h2>
            <p className="text-[#50606f] text-base">What would you like to achieve today?</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] max-w-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <span className="material-symbols-outlined text-[60px] text-[#006c4c]">format_quote</span>
            </div>
            <p className="text-[13px] italic text-[#3d4a42] leading-relaxed">"The future depends on what you do today."</p>
            <p className="text-[11px] font-bold mt-2 text-[#50606f]">â€” Mahatma Gandhi</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex items-center gap-4 hover-card transition-transform">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                <span className="material-symbols-outlined" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-[11px] text-[#50606f] uppercase tracking-wider font-semibold">{stat.label}</p>
                <span className="text-2xl font-bold" style={{ color: stat.progress ? stat.color : '#1c1b1b' }}>{stat.value}</span>
                {stat.progress && (
                  <div className="w-24 h-1.5 bg-[#eae7e7] rounded-full mt-1">
                    <div className="h-full rounded-full" style={{ width: `${stat.progress}%`, backgroundColor: stat.color }}></div>
                  </div>
                )}
                <p className="text-[10px] font-medium mt-1" style={{ color: stat.color }}>{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">

          {/* Recommended Careers */}
          <div className="col-span-4 bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Recommended Careers for You</h3>
              <a className="text-[#006c4c] font-bold text-[12px] hover:underline" href="#">View All</a>
            </div>
            <div className="space-y-4">
              {careers.map((c) => (
                <div key={c.label} className="flex items-center justify-between p-3 rounded-xl bg-[#f6f3f2]/50 hover:bg-[#f6f3f2] transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                      <span className="material-symbols-outlined" style={{ color: c.iconColor }}>{c.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{c.label}</h4>
                      <p className="text-[11px] text-[#50606f]">{c.sub}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#006c4c]">{c.match}</span>
                    <p className="text-[10px] text-[#50606f]">Match</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 text-[#006c4c] font-bold text-sm flex items-center justify-center gap-2 border border-[#006c4c]/20 rounded-xl hover:bg-[#006c4c]/5 transition-all">
              Explore More Careers <span className="material-symbols-outlined text-[18px]">trending_flat</span>
            </button>
          </div>

          {/* Upcoming Tasks */}
          <div className="col-span-4 bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
              <a className="text-[#006c4c] font-bold text-[12px] hover:underline" href="#">View All</a>
            </div>
            <div className="space-y-5">
              {tasks.map((task) => (
                <div key={task.label} className="flex items-start gap-4">
                  <div className="mt-1">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer"
                      style={{ borderColor: task.done ? '#006c4c' : '#bccac0' }}>
                      {task.done && <span className="material-symbols-outlined text-[#006c4c] text-[14px]">check</span>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm leading-tight">{task.label}</h4>
                    <p className="text-[11px] text-[#50606f]">{task.sub}</p>
                  </div>
                  <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: task.dueColor }}>{task.due}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ask CareerAI */}
          <div className="col-span-4 p-8 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center border border-[#00a878]/10"
            style={{ backgroundColor: '#f0fff9' }}>
            <div className="relative mb-6">
              <div className="absolute -top-4 -right-4 bg-white p-2 rounded-xl shadow-md">
                <span className="material-symbols-outlined text-[#00a878]">more_horiz</span>
              </div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_PLTwL_08nuCbEyXrppfmYXHncSTjIqzUPwwE7it_zDd2O2eKmYetFB4mMaR2BPco5mzF4ZDlmDyijlxA_AjO_HPQGlfSnP_DgeexrT3N6ue6DDVxSqHt9vrfYaRnq-ABejS_aHoOqGcmJ1TRZUqUvyMpYqEr4BZiS4T-sNS_FRbzIR8cSQisq9UnBkHULAPNAkQCH1waFL1zYL2_advWcRCD5A58pmiUWFA8Pu2iOaK1auORrscSMO1eheOSf3NI9Z3Bggd-5oht"
                  alt="AI Assistant"
                  className="w-20 h-20 object-contain rounded-full"
                />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Ask CareerAI</h3>
            <p className="text-sm text-[#3d4a42] mb-6 px-4">Your AI Career Assistant. Ask anything about careers, skills, jobs and more...</p>
            <button className="text-white font-bold py-3 px-10 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              style={{ backgroundColor: '#00a878', boxShadow: '0 10px 15px -3px rgba(0,168,120,0.2)' }}>
              Start Chat <span className="material-symbols-outlined">trending_flat</span>
            </button>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Progress Overview */}
          <div className="col-span-6 bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold">Your Progress Overview</h3>
              <a className="text-[#006c4c] font-bold text-[12px] hover:underline" href="#">View Details</a>
            </div>
            <div className="flex items-center gap-12">
              {/* Circle */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" fill="transparent" r="70" stroke="#eae7e7" strokeWidth="12" />
                  <circle cx="80" cy="80" fill="transparent" r="70" stroke="#00a878" strokeDasharray="440" strokeDashoffset="88" strokeLinecap="round" strokeWidth="12" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">80%</span>
                  <span className="text-[10px] text-[#50606f] uppercase font-bold tracking-widest">Overall</span>
                </div>
              </div>
              {/* Bars */}
              <div className="flex-1 space-y-5">
                {progressBars.map((bar) => (
                  <div key={bar.label} className="space-y-1.5">
                    <div className="flex justify-between text-[12px] font-bold">
                      <span>{bar.label}</span>
                      <span>{bar.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#eae7e7] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${bar.value}%`, backgroundColor: '#00a878' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Opportunities */}
          <div className="col-span-6 bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Upcoming Opportunities</h3>
              <a className="text-[#006c4c] font-bold text-[12px] hover:underline" href="#">View All</a>
            </div>
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <div key={opp.title} className="flex items-center justify-between p-4 rounded-2xl border border-[#bccac0]/20 hover:border-[#00a878]/40 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-[#f0eded] flex items-center justify-center p-2">
                      <img src={opp.logo} alt={opp.alt} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{opp.title}</h4>
                      <p className="text-[12px] text-[#50606f]">{opp.role}</p>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-[#50606f]">
                        {opp.tags.map((tag) => (
                          <span key={tag.label} className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">{tag.icon}</span>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#50606f] font-medium">Apply by</p>
                    <p className="text-sm font-bold text-[#006c4c]">{opp.applyBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

