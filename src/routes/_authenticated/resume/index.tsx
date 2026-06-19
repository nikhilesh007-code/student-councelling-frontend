import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/resume/')({
  component: ResumeAnalysisPage,
})

const MOCK_RESUME_DATA = {
  summary: {
    fileName: 'Pavithra_Resume_2025.pdf',
    uploadDate: 'May 18, 2025',
    fileSize: '1.2 MB',
    status: 'Analysis Complete'
  },
  score: {
    overall: 82,
    strength: 'Strong Candidate',
    atsScore: 90
  },
  skills: {
    detected: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git', 'MongoDB'],
    missing: ['Docker', 'AWS', 'System Design'],
    industryMatch: '85%'
  },
  ats: {
    formatting: 'Excellent - Clean structure',
    keywords: 'Optimized for Software Engineer roles'
  },
  strengths: [
    'Quantifiable achievements in experience section',
    'Strong academic background',
    'Clear and concise project descriptions'
  ],
  improvements: [
    { id: 1, text: 'Add link to GitHub repository for your projects', priority: 'High' },
    { id: 2, text: 'Include more action verbs (e.g., Led, Developed)', priority: 'Medium' },
    { id: 3, text: 'Reduce the summary section to 3-4 lines maximum', priority: 'Low' }
  ],
  careerMatch: [
    { id: 1, role: 'Frontend Developer', match: 92 },
    { id: 2, role: 'Full Stack Engineer', match: 85 },
    { id: 3, role: 'Software Engineer', match: 80 }
  ],
  sections: [
    { id: 1, name: 'Education', status: 'Good', icon: 'school', feedback: 'Clear institution names and dates.' },
    { id: 2, name: 'Skills', status: 'Needs Improvement', icon: 'code', feedback: 'Categorize skills into Languages, Tools, Frameworks.' },
    { id: 3, name: 'Projects', status: 'Excellent', icon: 'integration_instructions', feedback: 'Great use of metrics to show impact.' },
    { id: 4, name: 'Experience', status: 'Good', icon: 'work', feedback: 'Consider adding more quantifiable results.' },
    { id: 5, name: 'Certifications', status: 'Good', icon: 'workspace_premium', feedback: 'Relevant to target roles.' }
  ],
  insights: [
    'Your resume is highly optimized for Frontend roles.',
    'Adding Cloud certifications would boost your Full Stack match score.',
    'ATS parsing completed successfully with no errors.'
  ]
}

function ResumeAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUploaded, setHasUploaded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initial loading simulation
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

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
      simulateUpload()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload()
    }
  }

  const simulateUpload = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setHasUploaded(true)
    }, 2000) // Simulate a 2-second AI analysis delay
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading...</p>
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

  // --- EMPTY STATE (UPLOAD AREA) ---
  if (!hasUploaded) {
    return (
      <DashboardLayout>
        <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Resume Analysis <span className="material-symbols-outlined text-[#00a878]">description</span>
            </h2>
            <p className="text-[14px] text-slate-500">Upload your resume to get an AI-powered review of your skills, ATS compatibility, and career match.</p>
          </div>

          <div 
            className={`bg-white rounded-3xl p-12 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center min-h-[400px]
              ${isDragging ? 'border-[#00a878] bg-emerald-50/50' : 'border-slate-200'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isAnalyzing ? (
               <div className="flex flex-col items-center">
                 <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-100 rounded-full animate-ping opacity-50"></div>
                    <div className="absolute inset-0 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[#00a878]">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                 </div>
                 <h3 className="text-xl font-extrabold text-slate-900 mb-2">Analyzing your resume...</h3>
                 <p className="text-slate-500 font-medium">Extracting skills and checking ATS compatibility.</p>
               </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-[#00a878] mb-6 shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Upload your Resume</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-md">Drag and drop your resume file here, or click to browse. Supported formats: PDF, DOCX (Max 5MB).</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept=".pdf,.doc,.docx" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#00a878] text-white px-8 py-3 rounded-xl font-extrabold hover:bg-[#008b63] transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2"
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

  // --- ANALYSIS RESULTS STATE ---
  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-7xl mx-auto pb-10">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Analysis Results <span className="material-symbols-outlined text-[#00a878]">task_alt</span>
            </h2>
            <p className="text-[14px] text-slate-500">Your resume has been successfully analyzed. Here are your personalized insights.</p>
          </div>
          <button onClick={() => setHasUploaded(false)} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[13px] font-extrabold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">upload_file</span> Re-upload
          </button>
        </div>

        {/* Top Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 min-w-0">
          {/* File Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-0 md:col-span-2">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-extrabold text-slate-900 truncate mb-1">{MOCK_RESUME_DATA.summary.fileName}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium text-slate-500">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {MOCK_RESUME_DATA.summary.uploadDate}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">hard_drive</span> {MOCK_RESUME_DATA.summary.fileSize}</span>
                <span className="text-[#00a878] font-bold bg-emerald-50 px-2 py-0.5 rounded-md">{MOCK_RESUME_DATA.summary.status}</span>
              </div>
            </div>
            <button className="hidden sm:flex text-slate-400 hover:text-slate-700 shrink-0 border border-slate-200 w-10 h-10 items-center justify-center rounded-xl transition-colors">
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-6 min-w-0">
            {/* Circular Progress */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#00a878] drop-shadow-sm" strokeDasharray={`${MOCK_RESUME_DATA.score.overall}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[16px] font-black text-slate-900">{MOCK_RESUME_DATA.score.overall}</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Overall Score</p>
              <p className="text-[15px] font-extrabold text-slate-900 truncate">{MOCK_RESUME_DATA.score.strength}</p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          
          {/* Left Column (Main Content) - 8 columns */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            
            {/* Skills & ATS Match */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              {/* Skill Analysis */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex flex-col">
                <h3 className="text-[16px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">psychology</span> Skill Analysis
                </h3>
                
                <div className="mb-4">
                  <p className="text-[12px] font-bold text-slate-500 mb-2">Detected Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_RESUME_DATA.skills.detected.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-auto">
                  <p className="text-[12px] font-bold text-slate-500 mb-2 flex justify-between">
                    <span>Missing Skills</span>
                    <span className="text-amber-500">Industry Match: {MOCK_RESUME_DATA.skills.industryMatch}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_RESUME_DATA.skills.missing.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-md border border-amber-100 border-dashed">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ATS Compatibility */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">fact_check</span> ATS Compatibility
                  </h3>
                  <div className="bg-purple-50 px-2 py-1 rounded-md border border-purple-100 text-[12px] font-black text-purple-600">
                    {MOCK_RESUME_DATA.score.atsScore}%
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Formatting Check</p>
                    <p className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#00a878]">check_circle</span>
                      {MOCK_RESUME_DATA.ats.formatting}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Keyword Optimization</p>
                    <p className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#00a878]">check_circle</span>
                      {MOCK_RESUME_DATA.ats.keywords}
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button className="text-[12px] font-extrabold text-purple-600 hover:underline">View Detailed ATS Report →</button>
                </div>
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[17px] font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span> 
                Improvement Suggestions
              </h3>
              
              <div className="space-y-3">
                {MOCK_RESUME_DATA.improvements.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0
                      ${item.priority === 'High' ? 'text-red-500' : item.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                      {item.priority === 'High' ? 'error' : item.priority === 'Medium' ? 'warning' : 'info'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 leading-snug">{item.text}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-1
                        ${item.priority === 'High' ? 'text-red-500' : item.priority === 'Medium' ? 'text-amber-600' : 'text-blue-500'}">
                        {item.priority} Priority
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section by Section Review */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[17px] font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">segment</span> 
                Section Review
              </h3>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden min-w-0">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {MOCK_RESUME_DATA.sections.map((sec, idx) => (
                      <tr key={sec.id} className={`${idx !== MOCK_RESUME_DATA.sections.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-colors`}>
                        <td className="py-3 px-4 font-extrabold text-slate-900 flex items-center gap-2 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">{sec.icon}</span> {sec.name}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {sec.status === 'Excellent' || sec.status === 'Good' ? (
                            <span className="bg-emerald-50 text-[#00a878] px-2 py-1 rounded text-[10px] font-extrabold uppercase border border-emerald-100">
                              {sec.status}
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-[10px] font-extrabold uppercase border border-amber-100">
                              {sec.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600 min-w-[200px]">{sec.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column (Side Panels) - 4 columns */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            
            {/* Strengths */}
            <div className="bg-[#00a878] rounded-2xl p-6 shadow-sm border border-[#008b63] min-w-0 text-white relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
              </div>
              <h3 className="text-[16px] font-extrabold flex items-center gap-2 mb-4 relative z-10">
                <span className="material-symbols-outlined">verified</span> Key Strengths
              </h3>
              <ul className="space-y-3 relative z-10">
                {MOCK_RESUME_DATA.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-200 mt-0.5">check</span>
                    <p className="text-[13px] font-medium leading-relaxed">{strength}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Career Match Analysis */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500">target</span> Career Match
                </h3>
              </div>
              <div className="space-y-5">
                {MOCK_RESUME_DATA.careerMatch.map(role => (
                  <div key={role.id}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="font-extrabold text-slate-800">{role.role}</span>
                      <span className="font-black text-indigo-600">{role.match}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${role.match}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 text-center pt-4 border-t border-slate-100">
                <a className="text-[12px] font-extrabold text-indigo-600 hover:underline flex items-center justify-center gap-1" href="#">
                  Explore Matched Roles <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* AI Insights Summary */}
            <div className="bg-emerald-50/50 rounded-2xl p-6 shadow-sm border border-emerald-100 min-w-0">
              <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> 
                AI Insights
              </h3>
              <ul className="space-y-4">
                {MOCK_RESUME_DATA.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00a878] mt-1.5 shrink-0"></div>
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
