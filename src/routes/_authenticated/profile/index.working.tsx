import { createFileRoute, useRouteContext, useRouter } from '@tanstack/react-router'
import { authClient } from '../../../lib/auth-client'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { calculateProfileCompletion } from '../../../lib/profile-utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Button } from "../../../components/ui/button"
import { Separator } from "../../../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { toast } from "sonner"
import { ChipInput } from '../../../components/ui/chip-input'
import { 
  UploadCloud, Plus, Trash2, Check, ChevronsUpDown, 
  User, Briefcase, GraduationCap, Sparkles, Code, 
  Link as LinkIcon, Target, Trophy, FileText, Award, Layers 
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../components/ui/command"

export const Route = createFileRoute('/_authenticated/profile/index/working')({
  component: ProfilePage,
})

const CAREER_GOALS = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "AI Engineer", 
  "Machine Learning Engineer", "Data Scientist", "DevOps Engineer", "Cloud Engineer", 
  "Mobile App Developer", "Cybersecurity Engineer", "Product Manager", "Not Sure Yet"
];

const DOMAINS = [
  "AI / Machine Learning", "Web Development", "Mobile Development", "Data Science", 
  "Cybersecurity", "Cloud Computing", "DevOps", "Blockchain", "Game Development", "Open Source"
];

type Project = { id: string, name: string, description: string, technologies: string }

type ProfileData = {
  name?: string;
  userType: 'Student' | 'Working Professional';
  experienceLevel: string;
  preferredDomains: string[];
  projects: Project[];
  branch: string;
  year: string;
  cgpa: string;
  currentJobTitle: string;
  companyName: string;
  yearsOfExperience: string;
  industry: string;
  desiredRole: string;
  currentSalary: string;
  expectedSalary: string;
  phone: string;
  skills: string[];
  interests: string[];
  careerGoal: string;
  linkedin: string;
  github: string;
  bio: string;
}

const defaultProfile: ProfileData = {
  name: '', userType: 'Student', experienceLevel: '', preferredDomains: [], projects: [],
  branch: '', year: '', cgpa: '', currentJobTitle: '', companyName: '', yearsOfExperience: '',
  industry: '', desiredRole: '', currentSalary: '', expectedSalary: '',
  phone: '', skills: [], interests: [], careerGoal: '', linkedin: '', github: '', bio: ''
}

function ProfilePage() {
  const context = useRouteContext({ strict: false }) as any;
  const router = useRouter()
  const queryClient = useQueryClient();
  
  const { data: sessionData } = authClient.useSession()
  const userName = sessionData?.user?.name || context?.sessionUser?.name || 'User'
  const userEmail = sessionData?.user?.email || context?.sessionUser?.email || 'username@example.com'

  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [formData, setFormData] = useState<ProfileData>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(!context?.profile)
  const [isSaving, setIsSaving] = useState(false)
  const [careerGoalOpen, setCareerGoalOpen] = useState(false)

  // Resume Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch Career Snapshot Data
  const { data: snapshotData, isLoading: isSnapshotLoading } = useQuery({
    queryKey: ['career-snapshot', sessionData?.user?.id, profile?.name], // Using profile name as a generic dependency for refetch on load
    queryFn: async () => {
       if (!sessionData?.user?.id) return null;
       const [careersRes, skillGapRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/careers?userId=${sessionData.user.id}`, { credentials: "include" }).catch(() => null),
          fetch(`${import.meta.env.VITE_API_URL}/skill-gap/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId: sessionData.user.id }),
          }).catch(() => null)
       ]);
       
       let topMatch = "Awaiting Analysis";
       let matchScore = 0;
       let skillGapScore = 0;

       if (careersRes?.ok) {
           const careers = await careersRes.json();
           if (careers?.data?.[0]) {
               topMatch = careers.data[0].name;
               matchScore = careers.data[0].matchScore || careers.data[0].readinessScore || 0;
           }
       }
       if (skillGapRes?.ok) {
           const skillGap = await skillGapRes.json();
           skillGapScore = skillGap?.readinessScore || matchScore; // Fallback to matchscore if readiness not present
           if (topMatch === "Awaiting Analysis" && skillGap?.career) {
               topMatch = skillGap.career;
           }
       }
       
       return {
         topMatch,
         matchScore,
         skillGapScore,
         roadmapProgress: Math.min(matchScore + 10, 100) // Mocking progress based on match for now
       }
    },
    enabled: !!sessionData?.user?.id && !isLoading
  });

  useEffect(() => {
    if (context?.profile) {
      const p = context.profile;
      const skillsArray = typeof p.skills === 'string' ? p.skills.split(',').map((s:string) => s.trim()).filter(Boolean) : (p.skills || []);
      const interestsArray = typeof p.interests === 'string' ? p.interests.split(',').map((s:string) => s.trim()).filter(Boolean) : (p.interests || []);
      
      const loadedProfile = {
        ...defaultProfile,
        ...p,
        skills: skillsArray,
        interests: interestsArray,
        userType: p.userType || 'Student',
        preferredDomains: p.preferredDomains || [],
        projects: p.projects || [],
      };

      setProfile(loadedProfile)
      setFormData(loadedProfile)
      setIsLoading(false)
    }
  }, [context?.profile])

  const completionPercentage = calculateProfileCompletion(profile, { name: userName, email: userEmail }) || 0;

  const handleSave = async () => {
    if (formData.userType === 'Student') {
      if (!formData.branch || !formData.year || !formData.careerGoal) {
        toast.error('Branch, Year, and Career Goal are required for Students.')
        return
      }
    } else {
      if (!formData.currentJobTitle || !formData.careerGoal) {
        toast.error('Current Job Title and Career Goal are required for Professionals.')
        return
      }
    }

    setIsSaving(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: sessionData?.user?.id,
          ...formData
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error("Profile update failed");

      setProfile({ ...defaultProfile, ...result.data, skills: formData.skills, interests: formData.interests });
      setFormData({ ...defaultProfile, ...result.data, skills: formData.skills, interests: formData.interests });
      
      await queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      await queryClient.invalidateQueries({ queryKey: ['assessment-data'] });
      await queryClient.invalidateQueries({ queryKey: ['career-snapshot'] });

      setIsEditing(false)
      toast.success('Profile updated successfully!')
      router.invalidate() 
    } catch (err) {
      toast.error('An error occurred while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true)
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("resume", file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/resume`, {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Failed to parse resume");

      const { extractedSkills, suggestedSkills, userType, yearsOfExperience } = result.data;

      const newSkills = Array.from(new Set([...formData.skills, ...extractedSkills]));
      
      setFormData(prev => ({
        ...prev,
        skills: newSkills,
        userType: userType === 'Working Professional' ? 'Working Professional' : prev.userType,
        yearsOfExperience: yearsOfExperience ? String(yearsOfExperience) : prev.yearsOfExperience
      }))

      toast.success("Resume parsed successfully!", {
        description: `Found ${extractedSkills.length} skills. Suggested ${suggestedSkills.length} skills to add.`
      });

      if (suggestedSkills.length > 0) {
        toast("Suggested Skills", {
           description: suggestedSkills.join(", "),
           action: {
             label: "Add All",
             onClick: () => setFormData(prev => ({ ...prev, skills: Array.from(new Set([...prev.skills, ...suggestedSkills])) }))
           }
        })
      }

    } catch (error) {
      toast.error("Resume parsing failed", { description: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now().toString(), name: '', description: '', technologies: '' }]
    }))
  }

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }))
  }

  const removeProject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }))
  }

  const toggleDomain = (domain: string) => {
    setFormData(prev => {
      if (prev.preferredDomains.includes(domain)) {
        return { ...prev, preferredDomains: prev.preferredDomains.filter(d => d !== domain) }
      }
      return { ...prev, preferredDomains: [...prev.preferredDomains, domain] }
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full max-w-full min-w-0 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <User className="w-8 h-8 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage your personal and professional identity.</p>
          </div>
          {!isEditing ? (
            <Button size="lg" className="shadow-md hover:shadow-lg transition-all" onClick={() => setIsEditing(true)}>
              <FileText className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg" onClick={() => { setIsEditing(false); setFormData(profile); }}>Cancel</Button>
              <Button size="lg" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card & Snapshot Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Profile Info */}
          <Card className="xl:col-span-2 border-slate-200/60 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600/10 via-primary/5 to-emerald-600/10 w-full" />
            <CardContent className="p-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
                <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center border-4 border-background shadow-md shrink-0 ring-1 ring-slate-200">
                  <span className="text-4xl font-bold text-primary">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 space-y-1.5 pb-2">
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <Input value={formData.name || ''} onChange={(e: any) => setFormData({...formData, name: e.target.value})} className="text-xl font-bold max-w-[300px] h-10" placeholder="Your Name" />
                    ) : (
                      <h2 className="text-2xl font-bold tracking-tight">{profile.name || userName}</h2>
                    )}
                    <Badge variant={formData.userType === 'Student' ? 'default' : 'secondary'} className="px-3 py-1 shadow-sm">
                      {formData.userType}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {userEmail}
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-2xl font-bold text-slate-700">{profile.skills.length}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1 mt-1"><Sparkles className="w-3 h-3"/> Skills</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-2xl font-bold text-slate-700">{profile.interests.length}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1 mt-1"><Target className="w-3 h-3"/> Interests</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-2xl font-bold text-slate-700">{profile.projects.length}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1 mt-1"><Code className="w-3 h-3"/> Projects</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
                  <span className="text-xs text-primary/80 font-semibold uppercase tracking-wider flex items-center gap-1 mt-1"><Trophy className="w-3 h-3"/> Completion</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Snapshot Sidebar */}
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
             <CardHeader className="pb-3 border-b border-slate-100/50">
               <CardTitle className="flex items-center gap-2 text-lg">
                 <Target className="w-5 h-5 text-indigo-500" />
                 Career Snapshot
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                {!isSnapshotLoading && snapshotData ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-1.5"><Award className="w-4 h-4 text-emerald-500"/> Top AI Match</p>
                      <p className="font-semibold text-lg text-slate-800 leading-tight">{snapshotData.topMatch}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">Match Score</p>
                        <span className="text-sm font-bold text-emerald-600">{snapshotData.matchScore}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${snapshotData.matchScore}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">Skill Gap</p>
                        <span className="text-sm font-bold text-amber-500">{100 - snapshotData.skillGapScore}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${100 - snapshotData.skillGapScore}%` }} />
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-slate-100">
                       <Button variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => router.navigate({ to: '/recommendation' })}>
                         View Full Analysis
                       </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 animate-pulse">
                     <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                     <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                     <div className="h-2.5 bg-slate-200 rounded w-full mt-6"></div>
                     <div className="h-2.5 bg-slate-200 rounded w-full mt-4"></div>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* AI Resume Upload Banner */}
        {isEditing && (
          <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg shrink-0">
                   <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-900 tracking-tight">Smart Resume Parsing</h3>
                  <p className="text-indigo-700/80 mt-1 max-w-xl">Upload your latest resume to automatically extract your skills, domains, and professional experience using Gemini AI.</p>
                </div>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <input type="file" accept=".pdf,.docx" className="hidden" ref={fileInputRef} onChange={handleResumeUpload} />
                <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {isUploading ? "Extracting..." : "Upload Resume (PDF/DOCX)"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Identity & Basic Info */}
          <Card className="shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-slate-500" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase text-slate-500">I am a...</Label>
                      <Select value={formData.userType} onValueChange={(v: any) => setFormData({...formData, userType: v})}>
                        <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Working Professional">Working Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase text-slate-500">Experience Level</Label>
                      <Select value={formData.experienceLevel} onValueChange={(v: string) => setFormData({...formData, experienceLevel: v})}>
                        <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner (0-2 years)</SelectItem>
                          <SelectItem value="Intermediate">Intermediate (3-5 years)</SelectItem>
                          <SelectItem value="Advanced">Advanced (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase text-slate-500">Career Goal</Label>
                      <Popover open={careerGoalOpen} onOpenChange={setCareerGoalOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={careerGoalOpen} className="w-full justify-between bg-slate-50">
                            {formData.careerGoal ? formData.careerGoal : "Select career goal..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search career goal..." />
                            <CommandList>
                              <CommandEmpty>No goal found.</CommandEmpty>
                              <CommandGroup>
                                {CAREER_GOALS.map((goal) => (
                                  <CommandItem key={goal} value={goal} onSelect={(currentValue: any) => {
                                      const actualGoal = CAREER_GOALS.find(g => g.toLowerCase() === currentValue) || goal;
                                      setFormData({...formData, careerGoal: actualGoal})
                                      setCareerGoalOpen(false)
                                    }}>
                                    <Check className={`mr-2 h-4 w-4 ${formData.careerGoal === goal ? "opacity-100" : "opacity-0"}`} />
                                    {goal}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">User Type</p>
                      <Badge variant="outline" className="bg-slate-50">{profile.userType}</Badge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Experience Level</p>
                      <Badge variant="outline" className="bg-slate-50">{profile.experienceLevel || 'Not specified'}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Primary Career Goal</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium">
                      <Target className="w-4 h-4" />
                      {profile.careerGoal || 'Not specified'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education / Job Details */}
          <Card className="shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                {formData.userType === 'Student' ? (
                  <><GraduationCap className="w-5 h-5 text-slate-500" /> Education Details</>
                ) : (
                  <><Briefcase className="w-5 h-5 text-slate-500" /> Current Position</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {formData.userType === 'Student' ? (
                  isEditing ? (
                    <>
                      <div className="space-y-2"><Label className="text-xs font-semibold uppercase text-slate-500">Branch / Specialization</Label><Input className="bg-slate-50" value={formData.branch} onChange={(e: any) => setFormData({...formData, branch: e.target.value})} placeholder="e.g. Computer Science" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-xs font-semibold uppercase text-slate-500">Graduation Year</Label><Input className="bg-slate-50" value={formData.year} onChange={(e: any) => setFormData({...formData, year: e.target.value})} placeholder="2026" /></div>
                        <div className="space-y-2"><Label className="text-xs font-semibold uppercase text-slate-500">CGPA</Label><Input className="bg-slate-50" value={formData.cgpa} onChange={(e: any) => setFormData({...formData, cgpa: e.target.value})} placeholder="8.5" /></div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Branch / Course</p>
                        <p className="font-medium text-slate-800">{profile.branch || 'Not specified'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Graduation Year</p>
                          <Badge variant="secondary">{profile.year || 'N/A'}</Badge>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Current CGPA</p>
                          <Badge variant="secondary">{profile.cgpa || 'N/A'}</Badge>
                        </div>
                      </div>
                    </div>
                  )
              ) : (
                  isEditing ? (
                    <>
                      <div className="space-y-2"><Label className="text-xs font-semibold uppercase text-slate-500">Current Job Title</Label><Input className="bg-slate-50" value={formData.currentJobTitle} onChange={(e: any) => setFormData({...formData, currentJobTitle: e.target.value})} placeholder="Software Engineer" /></div>
                      <div className="space-y-2"><Label className="text-xs font-semibold uppercase text-slate-500">Company Name</Label><Input className="bg-slate-50" value={formData.companyName} onChange={(e: any) => setFormData({...formData, companyName: e.target.value})} placeholder="Google" /></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label className="text-xs font-semibold uppercase text-slate-500">Years of Experience</Label><Input className="bg-slate-50" value={formData.yearsOfExperience} onChange={(e: any) => setFormData({...formData, yearsOfExperience: e.target.value})} type="number" placeholder="3" /></div>
                          <div className="space-y-2"><Label className="text-xs font-semibold uppercase text-slate-500">Current Salary</Label><Input className="bg-slate-50" value={formData.currentSalary} onChange={(e: any) => setFormData({...formData, currentSalary: e.target.value})} placeholder="₹15,00,000" /></div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Job Title</p>
                        <p className="font-medium text-slate-800 text-lg">{profile.currentJobTitle || 'Not specified'}</p>
                        {profile.companyName && <p className="text-slate-500 mt-0.5">at <span className="font-medium text-slate-700">{profile.companyName}</span></p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Experience</p>
                          <Badge variant="secondary">{profile.yearsOfExperience ? `${profile.yearsOfExperience} Years` : 'Not specified'}</Badge>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Salary</p>
                          <Badge variant="secondary">{profile.currentSalary || 'Confidential'}</Badge>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </CardContent>
          </Card>

          {/* Core Competencies (Skills & Interests) */}
          <Card className="lg:col-span-2 shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-amber-500" /> Core Competencies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Code className="w-4 h-4 text-blue-500" /> Technical Skills</Label>
                  {!isEditing && <Badge variant="outline" className="bg-slate-50">{profile.skills.length}</Badge>}
                </div>
                {isEditing ? (
                  <ChipInput value={formData.skills} onChange={skills => setFormData({...formData, skills})} placeholder="Add skill (e.g. React)..." badgeClassName="bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent font-medium" />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? profile.skills.map(s => (
                      <Badge key={s} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200/50 shadow-sm">{s}</Badge>
                    )) : <span className="text-muted-foreground text-sm italic">No skills listed</span>}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Professional Interests</Label>
                  {!isEditing && <Badge variant="outline" className="bg-slate-50">{profile.interests.length}</Badge>}
                </div>
                {isEditing ? (
                  <ChipInput value={formData.interests} onChange={interests => setFormData({...formData, interests})} placeholder="Add interest (e.g. AI)..." badgeClassName="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent font-medium" className="ring-emerald-500/20" />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.length > 0 ? profile.interests.map(s => (
                      <Badge key={s} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200/50 shadow-sm">{s}</Badge>
                    )) : <span className="text-muted-foreground text-sm italic">No interests listed</span>}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-4">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-500" /> Preferred Domains</Label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {DOMAINS.map(domain => (
                      <Badge 
                        key={domain} 
                        variant={formData.preferredDomains.includes(domain) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${formData.preferredDomains.includes(domain) ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
                        onClick={() => toggleDomain(domain)}
                      >
                        {domain}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredDomains.length > 0 ? profile.preferredDomains.map(d => (
                      <Badge key={d} variant="outline" className="bg-slate-50 text-slate-700">{d}</Badge>
                    )) : <span className="text-muted-foreground text-sm italic">No domains selected</span>}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Projects Portfolio */}
          <Card className="lg:col-span-2 shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg"><Code className="w-5 h-5 text-slate-500" /> Portfolio Projects</CardTitle>
                <CardDescription className="mt-1">Showcase your hands-on experience and code</CardDescription>
              </div>
              {isEditing && (
                <Button variant="outline" size="sm" onClick={addProject} className="shrink-0"><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isEditing ? (
                formData.projects.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-slate-300 rounded-xl text-slate-500 bg-slate-50/50">
                      No projects added yet. Click 'Add Project' to showcase your work.
                    </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.projects.map((proj, idx) => (
                      <div key={proj.id} className="p-5 border border-slate-200 rounded-xl space-y-4 relative bg-slate-50/50 shadow-sm">
                        <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-red-500 hover:bg-red-100 hover:text-red-600 w-8 h-8 rounded-full" onClick={() => removeProject(proj.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="space-y-1.5 max-w-[85%]"><Label className="text-xs font-semibold uppercase text-slate-500">Project Name</Label><Input className="bg-white font-medium" value={proj.name} onChange={(e: any) => updateProject(proj.id, 'name', e.target.value)} placeholder="e.g. E-Commerce Backend" /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase text-slate-500">Description</Label><Input className="bg-white" value={proj.description} onChange={(e: any) => updateProject(proj.id, 'description', e.target.value)} placeholder="Built a scalable microservices architecture..." /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase text-slate-500">Technologies Used</Label><Input className="bg-white font-mono text-sm" value={proj.technologies} onChange={(e: any) => updateProject(proj.id, 'technologies', e.target.value)} placeholder="Node.js, Docker, MongoDB" /></div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                profile.projects.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl text-slate-500 bg-slate-50/30">
                      No projects have been added to this profile yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.projects.map(proj => (
                        <div key={proj.id} className="p-5 border border-slate-200 rounded-xl space-y-3 bg-white shadow-sm hover:border-primary/30 transition-colors">
                          <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Code className="w-4 h-4 text-slate-400" />
                            {proj.name || 'Untitled Project'}
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{proj.description}</p>
                          {proj.technologies && (
                            <div className="pt-3 mt-1 border-t border-slate-100">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tech Stack</p>
                              <div className="flex flex-wrap gap-1.5">
                                {proj.technologies.split(',').map(tech => (
                                  <Badge key={tech} variant="secondary" className="bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200">{tech.trim()}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="lg:col-span-2 shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg"><LinkIcon className="w-5 h-5 text-slate-500" /> Links & Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">LinkedIn Profile</Label>
                {isEditing ? <Input className="bg-slate-50" value={formData.linkedin} onChange={(e: any) => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." /> : <p className="text-sm">{profile.linkedin ? <a href={profile.linkedin} target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline font-medium break-all">{profile.linkedin}</a> : <span className="text-slate-400 italic">Not added</span>}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">GitHub Profile</Label>
                {isEditing ? <Input className="bg-slate-50" value={formData.github} onChange={(e: any) => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." /> : <p className="text-sm">{profile.github ? <a href={profile.github} target="_blank" className="text-slate-700 hover:text-slate-900 hover:underline font-medium break-all">{profile.github}</a> : <span className="text-slate-400 italic">Not added</span>}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Phone Number</Label>
                {isEditing ? <Input className="bg-slate-50" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} placeholder="+91..." /> : <p className="text-sm font-medium text-slate-700">{profile.phone || <span className="text-slate-400 italic font-normal">Not added</span>}</p>}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  )
}
