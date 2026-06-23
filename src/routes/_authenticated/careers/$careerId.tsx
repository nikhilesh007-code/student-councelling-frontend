import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/careers/$careerId')({
  component: CareerDetailsPage,
})

function CareerDetailsPage() {
  const { careerId } = Route.useParams()
  const router = useRouter()
  const [career, setCareer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleBack = () => {
    if (window.history.length > 2) {
      router.history.back()
    } else {
      router.navigate({ to: '/recommendation' })
    }
  }

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/careers/${careerId}`, {
          credentials: "include"
        })
        const data = await res.json()
        if (data.success) {
          setCareer(data.data)
        } else {
          setError(data.message || "Failed to load career details")
        }
      } catch (err) {
        console.error("Failed to load career:", err)
        setError("Network error. Failed to load career details.")
      } finally {
        setLoading(false)
      }
    }
    fetchCareer()
  }, [careerId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#00a878]/20 border-t-[#00a878] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !career) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <span className="material-symbols-outlined text-[48px] text-red-500 mb-4">error</span>
          <h2 className="text-xl font-bold mb-2">Error loading career</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <a href="/careers" className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Back to Careers</a>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-20">
        <button onClick={handleBack} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[#00a878] mb-6 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[16px] mr-1">arrow_back</span>
          Back
        </button>

        {/* Hero Section */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-20 h-20 bg-emerald-50 text-[#00a878] rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[40px]">work</span>
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">{career.name}</h1>
            <p className="text-lg text-slate-600 mb-6">{career.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Average Salary</p>
                  <p className="text-sm font-extrabold text-slate-900">{career.salaryRange || '₹8L - ₹15L'}</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Demand Level</p>
                  <p className="text-sm font-extrabold text-slate-900">High</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Roadmap */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">Learning Roadmap</h2>
              {career.roadmap && career.roadmap.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                  {career.roadmap.map((step: any, index: number) => (
                    <div key={index} className="relative flex items-start gap-6">
                      <div className={`w-9 h-9 shrink-0 ${step.color || 'bg-slate-800'} text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10 ring-4 ring-white`}>
                        {step.step || index + 1}
                      </div>
                      <div className="pt-1 pb-4">
                        <h3 className="text-base font-extrabold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No roadmap available for this career yet.</p>
              )}
            </section>

            {/* Projects to Build */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-xl">🚀</span> Projects to Build
              </h2>
              {career.projects && career.projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {career.projects.map((project: string, index: number) => (
                    <div key={index} className="border border-slate-200 p-4 rounded-xl hover:border-[#00a878] transition-colors cursor-default">
                      <h4 className="text-sm font-extrabold text-slate-900">{project}</h4>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No specific projects recommended yet.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Required Skills */}
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {career.requiredSkills?.map((skill: string, index: number) => (
                  <span key={index} className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Recommended Resources */}
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">Recommended Resources</h3>
              {career.resources && career.resources.length > 0 ? (
                <div className="space-y-3">
                  {career.resources.map((res: any, index: number) => (
                    <a key={index} href={res.url} target="_blank" rel="noreferrer" className="block group">
                      <div className="p-3 border border-slate-200 rounded-xl group-hover:bg-slate-50 transition-colors">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-1">{res.type}</p>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#00a878] transition-colors">{res.title}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No external resources available.</p>
              )}
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
