import { createFileRoute, useRouteContext, useRouter } from '@tanstack/react-router'
import { authClient } from '../../../lib/auth-client'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import { UploadCloud, Plus, Trash2, X, Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../components/ui/command"

export const Route = createFileRoute('/_authenticated/profile/index/backup')({
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

      // Merge skills
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

      // You could display suggested skills in a separate UI, for now we just log them or add them
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
      <div className="flex flex-col xl:flex-row gap-8 w-full max-w-full min-w-0 pb-12">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal and professional information.</p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(profile); }}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-4 border-background shrink-0">
                  <span className="text-3xl font-bold text-muted-foreground">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <Input value={formData.name || ''} onChange={(e: any) => setFormData({...formData, name: e.target.value})} className="text-xl font-bold max-w-[300px]" placeholder="Your Name" />
                    ) : (
                      <h2 className="text-2xl font-bold">{profile.name || userName}</h2>
                    )}
                    <Badge variant={formData.userType === 'Student' ? 'default' : 'secondary'}>
                      {formData.userType}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{userEmail}</div>
                </div>

                <div className="hidden md:block border-l pl-8 text-center">
                   <p className="text-sm text-muted-foreground font-medium mb-1">Profile Completion</p>
                   <p className="text-2xl font-bold text-primary">{completionPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-primary">Smart Resume Parsing</h3>
                  <p className="text-sm text-muted-foreground">Upload your resume to automatically extract skills and experience.</p>
                </div>
                <div>
                  <input type="file" accept=".pdf,.docx" className="hidden" ref={fileInputRef} onChange={handleResumeUpload} />
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    {isUploading ? "Extracting..." : "Upload Resume"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                   <>
                     <div className="space-y-2">
                        <Label>I am a...</Label>
                        <Select value={formData.userType} onValueChange={(v: any) => setFormData({...formData, userType: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Working Professional">Working Professional</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                       <Label>Experience Level</Label>
                       <Select value={formData.experienceLevel} onValueChange={(v: string) => setFormData({...formData, experienceLevel: v})}>
                          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label>Career Goal</Label>
                        <Popover open={careerGoalOpen} onOpenChange={setCareerGoalOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={careerGoalOpen} className="w-full justify-between">
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
                                    <CommandItem key={goal} value={goal} onSelect={(currentValue) => {
                                        // command component lowercases the value
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
                  <div className="space-y-4">
                    <div><Label className="text-muted-foreground">User Type</Label><p className="font-medium">{profile.userType}</p></div>
                    <div><Label className="text-muted-foreground">Experience Level</Label><p className="font-medium">{profile.experienceLevel || 'Not specified'}</p></div>
                    <div><Label className="text-muted-foreground">Career Goal</Label><p className="font-medium text-primary">{profile.careerGoal || 'Not specified'}</p></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{formData.userType === 'Student' ? 'Education' : 'Current Job'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.userType === 'Student' ? (
                   isEditing ? (
                     <>
                        <div className="space-y-2"><Label>Branch / Course</Label><Input value={formData.branch} onChange={(e: any) => setFormData({...formData, branch: e.target.value})} placeholder="Computer Science" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Graduation Year</Label><Input value={formData.year} onChange={(e: any) => setFormData({...formData, year: e.target.value})} placeholder="2026" /></div>
                          <div className="space-y-2"><Label>CGPA</Label><Input value={formData.cgpa} onChange={(e: any) => setFormData({...formData, cgpa: e.target.value})} placeholder="8.5" /></div>
                        </div>
                     </>
                   ) : (
                     <div className="space-y-4">
                        <div><Label className="text-muted-foreground">Branch</Label><p className="font-medium">{profile.branch || 'Not specified'}</p></div>
                        <div className="grid grid-cols-2">
                          <div><Label className="text-muted-foreground">Year</Label><p className="font-medium">{profile.year || 'Not specified'}</p></div>
                          <div><Label className="text-muted-foreground">CGPA</Label><p className="font-medium">{profile.cgpa || 'Not specified'}</p></div>
                        </div>
                     </div>
                   )
                ) : (
                   isEditing ? (
                     <>
                        <div className="space-y-2"><Label>Current Job Title</Label><Input value={formData.currentJobTitle} onChange={(e: any) => setFormData({...formData, currentJobTitle: e.target.value})} placeholder="Software Engineer" /></div>
                        <div className="space-y-2"><Label>Company Name</Label><Input value={formData.companyName} onChange={(e: any) => setFormData({...formData, companyName: e.target.value})} placeholder="Google" /></div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2"><Label>Years of Experience</Label><Input value={formData.yearsOfExperience} onChange={(e: any) => setFormData({...formData, yearsOfExperience: e.target.value})} type="number" placeholder="3" /></div>
                           <div className="space-y-2"><Label>Current Salary</Label><Input value={formData.currentSalary} onChange={(e: any) => setFormData({...formData, currentSalary: e.target.value})} placeholder="₹15,00,000" /></div>
                        </div>
                     </>
                   ) : (
                      <div className="space-y-4">
                        <div><Label className="text-muted-foreground">Job Title</Label><p className="font-medium">{profile.currentJobTitle || 'Not specified'} {profile.companyName && `at ${profile.companyName}`}</p></div>
                        <div className="grid grid-cols-2">
                          <div><Label className="text-muted-foreground">Experience</Label><p className="font-medium">{profile.yearsOfExperience ? `${profile.yearsOfExperience} Years` : 'Not specified'}</p></div>
                          <div><Label className="text-muted-foreground">Salary</Label><p className="font-medium">{profile.currentSalary || 'Confidential'}</p></div>
                        </div>
                      </div>
                   )
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Technical Skills</Label>
                  {isEditing ? (
                    <ChipInput value={formData.skills} onChange={skills => setFormData({...formData, skills})} placeholder="Type a skill and press Enter..." />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.length > 0 ? profile.skills.map(s => <Badge key={s} variant="secondary">{s}</Badge>) : <span className="text-muted-foreground text-sm">No skills added</span>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Interests</Label>
                  {isEditing ? (
                    <ChipInput value={formData.interests} onChange={interests => setFormData({...formData, interests})} placeholder="Type an interest and press Enter..." className="ring-blue-500/20" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.length > 0 ? profile.interests.map(s => <Badge key={s} variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">{s}</Badge>) : <span className="text-muted-foreground text-sm">No interests added</span>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Preferred Domains</Label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {DOMAINS.map(domain => (
                        <Badge 
                          key={domain} 
                          variant={formData.preferredDomains.includes(domain) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleDomain(domain)}
                        >
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.preferredDomains.length > 0 ? profile.preferredDomains.map(d => <Badge key={d}>{d}</Badge>) : <span className="text-muted-foreground text-sm">No domains selected</span>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Showcase your hands-on experience</CardDescription>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={addProject}><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  formData.projects.length === 0 ? (
                     <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">No projects added yet. Click 'Add Project' to start.</div>
                  ) : (
                    formData.projects.map((proj, idx) => (
                      <div key={proj.id} className="p-4 border rounded-lg space-y-4 relative bg-slate-50/50">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeProject(proj.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="space-y-2 max-w-[90%]"><Label>Project Name</Label><Input value={proj.name} onChange={(e: any) => updateProject(proj.id, 'name', e.target.value)} placeholder="e.g. E-Commerce Backend" /></div>
                        <div className="space-y-2"><Label>Description</Label><Input value={proj.description} onChange={(e: any) => updateProject(proj.id, 'description', e.target.value)} placeholder="Built a scalable microservices architecture..." /></div>
                        <div className="space-y-2"><Label>Technologies Used</Label><Input value={proj.technologies} onChange={(e: any) => updateProject(proj.id, 'technologies', e.target.value)} placeholder="Node.js, Docker, MongoDB" /></div>
                      </div>
                    ))
                  )
                ) : (
                  profile.projects.length === 0 ? (
                     <div className="text-muted-foreground text-sm">No projects added yet.</div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {profile.projects.map(proj => (
                         <div key={proj.id} className="p-4 border rounded-lg space-y-2 bg-card">
                           <h4 className="font-semibold">{proj.name || 'Untitled Project'}</h4>
                           <p className="text-sm text-muted-foreground">{proj.description}</p>
                           {proj.technologies && (
                             <p className="text-xs font-medium text-primary mt-2">Tech: {proj.technologies}</p>
                           )}
                         </div>
                       ))}
                     </div>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Links & Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  {isEditing ? <Input value={formData.linkedin} onChange={(e: any) => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." /> : <p className="text-sm">{profile.linkedin ? <a href={profile.linkedin} target="_blank" className="text-blue-500 hover:underline">{profile.linkedin}</a> : '-'}</p>}
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  {isEditing ? <Input value={formData.github} onChange={(e: any) => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." /> : <p className="text-sm">{profile.github ? <a href={profile.github} target="_blank" className="text-blue-500 hover:underline">{profile.github}</a> : '-'}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  {isEditing ? <Input value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} placeholder="+91..." /> : <p className="text-sm">{profile.phone || '-'}</p>}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
