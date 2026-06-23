import { createFileRoute, useRouteContext, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/careers/')({
  component: CareersIndexPage,
})

function CareersIndexPage() {
  const [careers, setCareers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('match') // 'match' or 'name'

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const session = await fetch("http://localhost:3000/api/auth/get-session", {
          credentials: "include"
        }).then(r => r.json())

        const userId = session?.user?.id;

        const res = await fetch(`http://localhost:3000/api/careers${userId ? '?userId='+userId : ''}`, {
          credentials: "include"
        })
        const data = await res.json()
        if (data.success) {
          setCareers(data.data)
        }
      } catch (err) {
        console.error("Failed to load careers:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCareers()
  }, [])

  const filteredCareers = careers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  )

  const sortedCareers = [...filteredCareers].sort((a, b) => {
    if (sortBy === 'match') {
      return b.matchScore - a.matchScore
    } else {
      return a.name.localeCompare(b.name)
    }
  })

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-10">
        <section className="mb-8">
          <Link to="/recommendation" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[#00a878] mb-4 transition-colors">
            <span className="material-symbols-outlined text-[16px] mr-1">arrow_back</span>
            Back to Career Guidance
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Careers</h2>
          <p className="text-slate-500">Discover paths, salaries, and roadmaps to your dream job.</p>
        </section>

        <section className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Search careers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a878]/50"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-slate-600">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none"
            >
              <option value="match">Match Percentage</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#00a878]/20 border-t-[#00a878] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCareers.map(career => (
              <a 
                key={career.id} 
                href={`/careers/${career.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-50 text-[#00a878] rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">work</span>
                  </div>
                  {career.matchScore > 0 && (
                    <span className="bg-emerald-50 text-[#00a878] text-xs font-bold px-2 py-1 rounded-md">
                      {career.matchScore}% Match
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{career.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-grow">{career.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">{career.salaryRange?.split(' - ')[0] || '₹8L'}</span>
                  <span className="text-[#00a878] text-xs font-bold flex items-center hover:underline">
                    View Details <span className="material-symbols-outlined text-[14px] ml-1">arrow_forward</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
