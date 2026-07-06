import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useMutation } from '@tanstack/react-query'
import { authClient } from '../../../lib/auth-client'
import { toast } from 'sonner'
import { motion, animate, type Variants } from 'framer-motion'

export const Route = createFileRoute('/_authenticated/resume/')({
  component: ResumeAnalysisPage,
})

const API_URL = import.meta.env.VITE_API_URL

// ---------- Animation variants (reused across the results dashboard) ----------
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const listContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

const iconPopVariants: Variants = {
  hidden: { scale: 0, rotate: -45, opacity: 0 },
  visible: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 15 } },
}

const textRevealVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.15, duration: 0.25 } },
}

// ---------- Counts a number up from 0 to its final value ----------
const CountUpNumber: React.FC<{ value: number; suffix?: string; duration?: number; delay?: number }> = ({
  value,
  suffix = '',
  duration = 1.2,
  delay = 0,
}) => {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      delay,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [value])

  return <>{display}{suffix}</>
}

// ---------- Reveals a paragraph word by word, like it's being generated live ----------
const AnimatedSummary: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(' ')
  const stagger = Math.min(0.035, 1.2 / Math.max(words.length, 1))

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: 0.2 } } }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 4 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
          }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

// ---------- Particles pulled toward the center of the scanning document ----------
const ScannerParticles: React.FC = () => {
  const particles = Array.from({ length: 12 }, (_, i) => i)
  return (
    <>
      {particles.map((i) => {
        const angle = (i / particles.length) * 360
        const radius = 90
        const x = Math.cos((angle * Math.PI) / 180) * radius
        const y = Math.sin((angle * Math.PI) / 180) * radius
        return (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#00a878]"
            style={{ top: '50%', left: '50%', boxShadow: '0 0 6px rgba(0,168,120,0.8)' }}
            initial={{ x, y, opacity: 0 }}
            animate={{ x: [x, 0], y: [y, 0], opacity: [0, 1, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: (i / particles.length) * 1.6,
              ease: 'easeIn',
            }}
          />
        )
      })}
    </>
  )
}

// ---------- Holographic AI scanner shown while the resume is being analyzed ----------
const HolographicScanner: React.FC = () => (
  <div className="relative flex flex-col items-center justify-center w-full">
    {/* Ambient holographic glow */}
    <div
      className="absolute w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(0,168,120,0.6) 0%, transparent 70%)' }}
    />

    {/* Document card being scanned */}
    <div className="relative w-36 h-48 mb-6">
      <ScannerParticles />
      <div className="relative w-full h-full bg-white rounded-lg border border-emerald-200 shadow-md overflow-hidden">
        {/* Fake text lines to imply document content */}
        <div className="p-3 space-y-2">
          {[90, 70, 80, 60, 85, 50, 75].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-slate-100" style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Soft glow band trailing the scan line */}
        <motion.div
          className="absolute left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,168,120,0.35), transparent)' }}
          animate={{ top: ['-10%', '100%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Sharp scan line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-[#00a878] pointer-events-none"
          style={{ boxShadow: '0 0 10px 2px rgba(0,168,120,0.9)' }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>

    <motion.h3
      className="text-2xl font-extrabold text-slate-900 mb-2"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      Analyzing Resume Quality...
    </motion.h3>
    <p className="text-slate-500 font-medium">Extracting text and scoring structural elements.</p>
  </div>
)

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

  // Only holds a report that was generated from an upload done THIS visit.
  // It intentionally does NOT auto-load any previously saved report from the database,
  // so the page always starts at the Drag & Drop screen after a refresh.
  const [localAnalysis, setLocalAnalysis] = useState<any | null>(null)

  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  // Mutation
  const uploadMutation = useMutation({
    mutationFn: uploadAndAnalyzeResume,
    onSuccess: (data) => {
      setLocalAnalysis(data)
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
    if (!localAnalysis) return;
    const text = localAnalysis.improvements.join('\n');
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }

  const safeAnalysis = localAnalysis ? {
    ...localAnalysis,
    overallScore: localAnalysis.overallScore ?? 0,
    atsScore: localAnalysis.atsScore ?? 0,
    strengths: Array.isArray(localAnalysis.strengths) ? localAnalysis.strengths : [],
    weaknesses: Array.isArray(localAnalysis.weaknesses) ? localAnalysis.weaknesses : [],
    missingSections: Array.isArray(localAnalysis.missingSections) ? localAnalysis.missingSections : [],
    improvements: Array.isArray(localAnalysis.improvements) ? localAnalysis.improvements : [],
    structure: localAnalysis.structure ?? "N/A",
    writingQuality: localAnalysis.writingQuality ?? "N/A",
    formatting: localAnalysis.formatting ?? "N/A",
    recruiterImpression: localAnalysis.recruiterImpression ?? "N/A",
    summary: localAnalysis.summary ?? "No summary provided",
    executiveSummary: localAnalysis.executiveSummary ?? "N/A",
    keywordSuggestions: Array.isArray(localAnalysis.keywordSuggestions) ? localAnalysis.keywordSuggestions : [],
    finalVerdict: localAnalysis.finalVerdict ?? "N/A",
    analyzedAt: localAnalysis.analyzedAt ?? new Date().toISOString(),
    fileName: localAnalysis.fileName ?? "resume.pdf",
  } : null;

  const statCards: Array<{
    label: string
    color: string
    icon: string
    numericValue?: number
    suffix?: string
    custom?: string
  }> = safeAnalysis ? [
    { label: 'Overall Quality Score', numericValue: safeAnalysis.overallScore, suffix: '%', color: 'text-[#00a878]', icon: 'workspace_premium' },
    { label: 'ATS Parsability Score', numericValue: safeAnalysis.atsScore, suffix: '/100', color: 'text-purple-600', icon: 'fact_check' },
    { label: 'Recruiter Impression', color: 'text-blue-600', icon: 'auto_awesome', custom: safeAnalysis.recruiterImpression },
  ] : []


  // --- BEFORE UPLOAD STATE (also the default state right after a page refresh) ---
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
              <HolographicScanner />
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
      <motion.div
        className="min-w-0 w-full max-w-7xl mx-auto pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
        </motion.div>

        {/* Section 1: General Resume Quality */}
        <motion.div variants={itemVariants} className="mb-12">
          <h3 className="text-[18px] font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-6">General Resume Quality</h3>

          {/* Executive Summary & Final Verdict */}
          <motion.div variants={itemVariants} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 shadow-sm">
            <h4 className="text-[15px] font-extrabold text-indigo-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">subject</span> Executive Summary
            </h4>
            <p className="text-[14px] text-indigo-800 leading-relaxed mb-4">
              <AnimatedSummary text={safeAnalysis.executiveSummary} />
            </p>
            <div className="bg-white rounded-xl p-4 border border-indigo-100">
              <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber-500">gavel</span> Final Verdict
              </h4>
              <p className="text-[14px] text-slate-700 font-medium">{safeAnalysis.finalVerdict}</p>
            </div>
          </motion.div>

          {/* Top Summary Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 min-w-0"
            variants={containerVariants}
          >
            {statCards.map(stat => (
              <motion.div key={stat.label} variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                <motion.div
                  variants={iconPopVariants}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} bg-opacity-10 border border-current opacity-80 shrink-0`}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </motion.div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                  {stat.custom ? (
                    <p className="text-[13px] font-medium text-slate-600 leading-snug line-clamp-2" title={stat.custom}>{stat.custom}</p>
                  ) : (
                    <p className={`text-2xl font-black ${stat.color}`}>
                      <CountUpNumber value={stat.numericValue ?? 0} suffix={stat.suffix ?? ''} delay={0.3} />
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" variants={containerVariants}>
            <motion.div variants={itemVariants} className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
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
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <motion.div variants={itemVariants} className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <h4 className="text-[15px] font-extrabold text-[#00a878] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">trending_up</span> Formatting Strengths
                </h4>
                <motion.ul
                  className="space-y-3"
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {safeAnalysis.strengths.map((str: string, i: number) => (
                    <motion.li key={i} variants={listItemVariants} className="flex gap-3 text-slate-700 text-[14px]">
                      <motion.span variants={iconPopVariants} className="material-symbols-outlined text-[#00a878] text-[20px] shrink-0">check_circle</motion.span>
                      <motion.span variants={textRevealVariants}>{str}</motion.span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 shadow-sm">
                <h4 className="text-[15px] font-extrabold text-rose-600 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">trending_down</span> Weaknesses
                </h4>
                <motion.ul
                  className="space-y-3"
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {safeAnalysis.weaknesses.map((wk: string, i: number) => (
                    <motion.li key={i} variants={listItemVariants} className="flex gap-3 text-slate-700 text-[14px]">
                      <motion.span variants={iconPopVariants} className="material-symbols-outlined text-rose-500 text-[20px] shrink-0">cancel</motion.span>
                      <motion.span variants={textRevealVariants}>{wk}</motion.span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-[15px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">lightbulb</span> Actionable Improvements
                </h4>
                <motion.ul
                  className="space-y-3"
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {safeAnalysis.improvements.map((imp: string, i: number) => (
                    <motion.li key={i} variants={listItemVariants} className="flex gap-3 text-slate-700 text-[14px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <motion.span variants={iconPopVariants} className="material-symbols-outlined text-amber-500 text-[20px] shrink-0">tips_and_updates</motion.span>
                      <motion.span variants={textRevealVariants}>{imp}</motion.span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              {safeAnalysis.keywordSuggestions.length > 0 && (
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-[15px] font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">key</span> Keyword Suggestions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {safeAnalysis.keywordSuggestions.map((kw: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[13px] font-bold border border-blue-100">{kw}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>



      </motion.div>
    </DashboardLayout>
  )
}
