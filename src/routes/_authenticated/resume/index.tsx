import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '../../../lib/auth-client'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/resume/')({
  component: ResumeAnalysisPage,
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Fetch the existing analysis from DB
async function fetchResumeAnalysis() {
  const session = await authClient.getSession();
  const userId = session?.data?.user?.id;
  if (!userId) return null;

  const res = await fetch(`${API_URL}/resume/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) return null;
    throw new Error('Failed to fetch analysis')
  }
  return res.json()
}



// Upload and analyze
async function uploadAndAnalyzeResume(file: File) {
  const session = await authClient.getSession();
  const userId = session?.data?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // Step 1: Upload and Extract Text
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('userId', userId)

  const uploadRes = await fetch(`${API_URL}/resume/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to extract text from resume')
  }

  const uploadData = await uploadRes.json();

  // Step 2: Analyze Text
  const analyzeRes = await fetch(`${API_URL}/resume/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      resumeText: uploadData.resumeText,
      fileName: uploadData.fileName,
      fileSizeMb: uploadData.fileSizeMb,
    })
  });

  if (!analyzeRes.ok) {
    const errorData = await analyzeRes.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze resume text')
  }

  return analyzeRes.json();
}

function ResumeAnalysisPage() {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  // Queries
  const { data: analysis, isLoading: isFetching, error } = useQuery({
    queryKey: ['resumeAnalysis', userId],
    queryFn: fetchResumeAnalysis,
    enabled: !!userId,
  })



  // Mutations
  const uploadMutation = useMutation({
    mutationFn: uploadAndAnalyzeResume,
    onSuccess: async (data) => {
      if (userId) {
        queryClient.setQueryData(['resumeAnalysis', userId], data)
      }
      toast.success("Resume analyzed successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to analyze resume")
    }
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size is 5MB.")
      return;
    }
    if (file.type !== 'application/pdf') {
      toast.error("Currently only PDF files are supported.")
      return;
    }
    uploadMutation.mutate(file)
  }

  const handleCopySuggestions = () => {
    if (!analysis) return;
    const text = analysis.improvements.join('\n');
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }

  if (isFetching && !uploadMutation.isPending) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !analysis) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load</h3>
          <p className="text-slate-500 mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
        </div>
      </DashboardLayout>
    )
  }

  const safeAnalysis = analysis ? {
    ...analysis,
    overallScore: analysis.overallScore ?? 0,
    atsScore: analysis.atsScore ?? 0,
    strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
    missingSections: Array.isArray(analysis.missingSections) ? analysis.missingSections : [],
    improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
    structure: analysis.structure ?? "N/A",
    writingQuality: analysis.writingQuality ?? "N/A",
    formatting: analysis.formatting ?? "N/A",
    recruiterImpression: analysis.recruiterImpression ?? "N/A",
    summary: analysis.summary ?? "No summary provided",
    executiveSummary: analysis.executiveSummary ?? "N/A",
    keywordSuggestions: Array.isArray(analysis.keywordSuggestions) ? analysis.keywordSuggestions : [],
    finalVerdict: analysis.finalVerdict ?? "N/A",
    analyzedAt: analysis.analyzedAt ?? new Date().toISOString(),
    fileName: analysis.fileName ?? "resume.pdf",
  } : null;


  // --- BEFORE UPLOAD STATE ---
  if (!safeAnalysis || uploadMutation.isPending) {
    return (
      <DashboardLayout>
        <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Resume Analysis <span className="material-symbols-outlined text-[#00a878]">description</span>
            </h2>
            <p className="text-[14px] text-slate-500">Get an AI-powered, professional review of your resume and instantly match it to your Target Career.</p>
          </div>

          <div
            className={`bg-white rounded-3xl p-12 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center min-h-[400px] shadow-sm mb-12
              ${isDragging ? 'border-[#00a878] bg-emerald-50/50 scale-[1.01]' : 'border-slate-200 hover:border-emerald-300'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadMutation.isPending ? (
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-emerald-100 rounded-full animate-ping opacity-50"></div>
                  <div className="absolute inset-0 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[#00a878]">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Analyzing Resume Quality...</h3>
                <p className="text-slate-500 font-medium">Extracting text and scoring structural elements.</p>
              </div>
            ) : (
              <>
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-[#00a878] mb-6 shadow-sm border border-emerald-100 transform transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-5xl">upload_file</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Drag & Drop your Resume</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-md">Upload your resume to get an instant AI review. Supported formats: PDF. Max size: 5MB.</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#00a878] text-white px-8 py-3.5 rounded-xl font-extrabold hover:bg-[#008b63] transition-all shadow-md shadow-emerald-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined">attach_file</span> Browse Files
                </button>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // --- AFTER UPLOAD STATE (DASHBOARD) ---
  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              AI Resume Report <span className="material-symbols-outlined text-[#00a878]">verified</span>
            </h2>
            <p className="text-[14px] text-slate-500 flex items-center gap-2">
              Analyzed {new Date(safeAnalysis.analyzedAt).toLocaleDateString()}
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-bold">{safeAnalysis.fileName}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf"
              className="hidden"
            />
            <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-[13px] font-extrabold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">upload_file</span> New Scan
            </button>
            <button onClick={handleCopySuggestions} className="bg-[#00a878] text-white px-4 py-2.5 rounded-xl text-[13px] font-extrabold hover:bg-[#008b63] transition-colors flex items-center justify-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">content_copy</span> Copy Suggestions
            </button>
          </div>
        </div>

        {/* Section 1: General Resume Quality */}
        <div className="mb-12">
          <h3 className="text-[18px] font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-6">General Resume Quality</h3>

          {/* Executive Summary & Final Verdict */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 shadow-sm">
            <h4 className="text-[15px] font-extrabold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">subject</span> Executive Summary
            </h4>
            <p className="text-[14px] text-indigo-800 leading-relaxed mb-4">{safeAnalysis.executiveSummary}</p>
            <div className="bg-white rounded-xl p-4 border border-indigo-100">
              <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber-500">gavel</span> Final Verdict
              </h4>
              <p className="text-[14px] text-slate-700 font-medium">{safeAnalysis.finalVerdict}</p>
            </div>
          </div>

          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 min-w-0">
            {[
              { label: 'Overall Quality Score', value: `${safeAnalysis.overallScore}%`, color: 'text-[#00a878]', icon: 'workspace_premium' },
              { label: 'ATS Parsability Score', value: `${safeAnalysis.atsScore}/100`, color: 'text-purple-600', icon: 'fact_check' },
              { label: 'Recruiter Impression', value: "View Insights", color: 'text-blue-600', icon: 'auto_awesome', custom: safeAnalysis.recruiterImpression }
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} bg-opacity-10 border border-current opacity-80 shrink-0`}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                  {stat.custom ? (
                    <p className="text-[13px] font-medium text-slate-600 leading-snug line-clamp-2" title={stat.custom}>{stat.custom}</p>
                  ) : (
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <div>
                <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1 text-[#00a878]">Structure</h4>
                <p className="text-[14px] text-slate-600 leading-relaxed">{safeAnalysis.structure}</p>
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1 text-purple-600">Writing Quality</h4>
                <p className="text-[14px] text-slate-600 leading-relaxed">{safeAnalysis.writingQuality}</p>
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1 text-blue-600">Formatting</h4>
                <p className="text-[14px] text-slate-600 leading-relaxed">{safeAnalysis.formatting}</p>
              </div>
              {safeAnalysis.missingSections.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[13px] font-extrabold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">warning</span> Missing Sections
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {safeAnalysis.missingSections.map((sec: string, idx: number) => (
                      <span key={idx} className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[12px] font-bold border border-amber-200">{sec}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <h4 className="text-[15px] font-extrabold text-[#00a878] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">trending_up</span> Formatting Strengths
                </h4>
                <ul className="space-y-3">
                  {safeAnalysis.strengths.map((str: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-700 text-[14px]">
                      <span className="material-symbols-outlined text-[#00a878] text-[20px] shrink-0">check_circle</span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 shadow-sm">
                <h4 className="text-[15px] font-extrabold text-rose-600 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">trending_down</span> Weaknesses
                </h4>
                <ul className="space-y-3">
                  {safeAnalysis.weaknesses.map((wk: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-700 text-[14px]">
                      <span className="material-symbols-outlined text-rose-500 text-[20px] shrink-0">cancel</span>
                      {wk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-[15px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">lightbulb</span> Actionable Improvements
                </h4>
                <ul className="space-y-3">
                  {safeAnalysis.improvements.map((imp: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-700 text-[14px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-amber-500 text-[20px] shrink-0">tips_and_updates</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>

              {safeAnalysis.keywordSuggestions.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-[15px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">key</span> Keyword Suggestions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {safeAnalysis.keywordSuggestions.map((kw: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[13px] font-bold border border-blue-100">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>



      </div>
    </DashboardLayout>
  )
}
