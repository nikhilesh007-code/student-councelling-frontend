import { createFileRoute, useRouteContext, useRouter } from '@tanstack/react-router'
import { authClient } from '../../../lib/auth-client'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useState, useEffect } from 'react'
import { calculateProfileCompletion } from '../../../lib/profile-utils'
import { updateMockProfile } from '../../../lib/mock-data'

export const Route = createFileRoute('/_authenticated/profile/')({
  component: ProfilePage,
})

type ProfileData = {
  branch: string;
  year: string;
  phone: string;
  skills: string[] | string;
  interests: string[] | string;
  careerGoal: string;
  linkedin: string;
  github: string;
  bio: string;
}

const defaultProfile: ProfileData = {
  branch: '', year: '', phone: '', skills: [], interests: [], careerGoal: '', linkedin: '', github: '', bio: ''
}

function ProfilePage() {
  const context = useRouteContext({ strict: false }) as any;
  const router = useRouter()
  
  const { data: sessionData } = authClient.useSession()
  const userName = sessionData?.user?.name || context?.sessionUser?.name || 'Student'
  const userEmail = sessionData?.user?.email || context?.sessionUser?.email || 'username@example.com'

  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [formData, setFormData] = useState<ProfileData>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(!context?.profile)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (context?.profile) {
      setProfile({ ...defaultProfile, ...context.profile })
      setFormData({ ...defaultProfile, ...context.profile })
      setIsLoading(false)
    }
  }, [context?.profile])

  const completionPercentage = context?.completionPercentage || 0;

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (!formData.branch || !formData.year || !formData.careerGoal) {
      setError('Branch, Year, and Career Goal are required.')
      return
    }

    setIsSaving(true)
    try {
      const skillsArray = typeof formData.skills === 'string' 
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) 
        : formData.skills;
        
      const interestsArray = typeof formData.interests === 'string'
        ? formData.interests.split(',').map(s => s.trim()).filter(Boolean)
        : formData.interests;

      const payload = {
        ...formData,
        skills: skillsArray,
        interests: interestsArray,
      }

      const updatedProfile = updateMockProfile(payload)
      
      setProfile({ ...defaultProfile, ...updatedProfile })
      setFormData({ ...defaultProfile, ...updatedProfile })
      setIsEditing(false)
      setSuccess('Profile updated successfully!')
      router.invalidate() // Triggers the _authenticated loader to refetch the profile
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('An error occurred while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  const renderSkills = (skills: string[] | string) => {
    const arr = Array.isArray(skills) ? skills : []
    if (arr.length === 0) return <p className="text-xs text-gray-400 italic">No skills added yet.</p>
    return arr.map(s => (
      <span key={s} className="px-3 py-1 bg-gray-50 border border-[#bccac0]/20 rounded-lg text-xs font-medium">{s}</span>
    ))
  }

  const renderInterests = (interests: string[] | string) => {
    const arr = Array.isArray(interests) ? interests : []
    if (arr.length === 0) return <p className="text-xs text-gray-400 italic">No interests added yet.</p>
    return arr.map(s => (
      <span key={s} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">{s}</span>
    ))
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a878]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <style>{`
        .text-brand-green { color: #00a878; }
        .bg-brand-green { background-color: #00a878; }
        .bg-brand-green-light { background-color: rgba(0,168,120,0.1); }
        .border-brand-green { border-color: #00a878; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 w-full max-w-full min-w-0">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-[#50606f] text-sm">Manage your personal information and track your progress.</p>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-brand-green text-brand-green rounded-lg hover:bg-brand-green-light transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => { setIsEditing(false); setFormData(profile); setError(''); }} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium text-sm">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-wrap gap-6 md:gap-10">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-50"><svg className="w-16 h-16 md:w-20 md:h-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg></div>
              <button className="absolute bottom-1 right-1 w-8 h-8 bg-brand-green text-white rounded-full flex items-center justify-center border-2 border-white"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15.5c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"></path><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"></path></svg></button>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold truncate max-w-[200px]">{userName}</h2>
                <span className="px-3 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-semibold shrink-0">Student</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-[#50606f]">
                <div className="flex items-center gap-2 truncate" title={userEmail}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  <span className="truncate min-w-0">{userEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  {isEditing ? (
                    <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" className="border-b border-gray-300 focus:border-brand-green outline-none w-full bg-transparent px-1" />
                  ) : (
                    profile.phone || <span className="text-gray-400 italic">Not provided</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  {isEditing ? (
                    <input type="text" value={formData.linkedin || ''} onChange={e => setFormData({...formData, linkedin: e.target.value})} placeholder="LinkedIn URL" className="border-b border-gray-300 focus:border-brand-green outline-none w-full bg-transparent px-1" />
                  ) : (
                    profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">LinkedIn</a> : <span className="text-gray-400 italic">LinkedIn Not linked</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
                  {isEditing ? (
                    <input type="text" value={formData.github || ''} onChange={e => setFormData({...formData, github: e.target.value})} placeholder="GitHub URL" className="border-b border-gray-300 focus:border-brand-green outline-none w-full bg-transparent px-1" />
                  ) : (
                    profile.github ? <a href={profile.github} target="_blank" rel="noreferrer" className="text-gray-700 hover:underline">GitHub</a> : <span className="text-gray-400 italic">GitHub Not linked</span>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden md:flex gap-8 border-l border-[#bccac0]/20 pl-10">
              <div className="text-center">
                <p className="text-xs text-[#50606f] font-medium mb-1">Profile Completion</p>
                <p className="text-xl font-bold text-brand-green">{completionPercentage}%</p>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-2">
                  <div className="h-full bg-brand-green rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex gap-6 md:gap-8 overflow-x-auto pb-px scrollbar-hide">
              <a className="px-1 py-3 border-b-2 border-brand-green text-brand-green font-medium text-sm whitespace-nowrap" href="#">Overview</a>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#bccac0]/20 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-50 p-1.5 rounded-lg text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
                <h3 className="font-bold">About Me</h3>
              </div>
              {isEditing ? (
                <textarea 
                  className="w-full flex-1 p-3 border border-gray-200 rounded-xl focus:border-brand-green outline-none text-sm resize-none min-h-[100px]"
                  placeholder="Tell us about yourself..."
                  value={formData.bio || ''}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                ></textarea>
              ) : (
                <p className="text-sm text-[#3d4a42] leading-relaxed whitespace-pre-wrap">
                  {profile.bio || <span className="text-gray-400 italic">No bio provided.</span>}
                </p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#bccac0]/20 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 p-1.5 rounded-lg text-brand-green">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </div>
                  <h3 className="font-bold">Skills</h3>
                </div>
              </div>
              {isEditing ? (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Enter skills separated by commas</p>
                  <textarea 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-brand-green outline-none text-sm resize-none"
                    placeholder="Python, Java, React..."
                    value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
                    onChange={e => setFormData({...formData, skills: e.target.value})}
                  ></textarea>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {renderSkills(profile.skills)}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#bccac0]/20 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-50 p-1.5 rounded-lg text-purple-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
                <h3 className="font-bold">Interests</h3>
              </div>
              {isEditing ? (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Enter interests separated by commas</p>
                  <textarea 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-brand-green outline-none text-sm resize-none"
                    placeholder="Web Development, Data Science..."
                    value={Array.isArray(formData.interests) ? formData.interests.join(', ') : formData.interests}
                    onChange={e => setFormData({...formData, interests: e.target.value})}
                  ></textarea>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {renderInterests(profile.interests)}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#bccac0]/20 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-50 p-1.5 rounded-lg text-orange-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
                <h3 className="font-bold">Career Goal <span className="text-red-500">*</span></h3>
              </div>
              {isEditing ? (
                <textarea 
                  className="w-full flex-1 p-3 border border-gray-200 rounded-xl focus:border-brand-green outline-none text-sm resize-none"
                  placeholder="What is your primary career goal?"
                  value={formData.careerGoal || ''}
                  onChange={e => setFormData({...formData, careerGoal: e.target.value})}
                ></textarea>
              ) : (
                <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100 h-full">
                  <div className="mt-0.5 bg-orange-500 rounded-full p-1 shrink-0"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg></div>
                  <span className="text-sm font-semibold text-[#3d4a42] break-words whitespace-pre-wrap min-w-0">{profile.careerGoal || <span className="text-gray-400 italic font-normal">No career goal set.</span>}</span>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#bccac0]/20 shadow-sm md:col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-50 p-1.5 rounded-lg text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
                <h3 className="font-bold">Education</h3>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                  <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>
                <div className="flex-1 space-y-3">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Branch / Course <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.branch || ''} onChange={e => setFormData({...formData, branch: e.target.value})} placeholder="e.g. Computer Science" className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-brand-green outline-none text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Graduation Year <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.year || ''} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="e.g. 2026" className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-brand-green outline-none text-sm" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-base font-bold text-gray-800">{profile.branch || <span className="text-gray-400 italic">Branch not provided</span>}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-1 bg-green-50 text-brand-green rounded-md text-xs font-bold border border-green-100">Class of {profile.year || 'Unknown'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <aside className="w-full xl:w-72 space-y-6 shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-[#bccac0]/20 shadow-sm text-center">
            <h3 className="font-bold text-sm mb-4">Profile Completion</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-gray-100" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-brand-green" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * completionPercentage) / 100} strokeWidth="8"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{completionPercentage}%</span>
              </div>
            </div>
            <p className="text-xs text-[#50606f] mb-6 px-4">Complete your profile to get better recommendations.</p>
            <button onClick={() => { setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full bg-brand-green text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-100 hover:bg-emerald-600 transition-colors">Update Profile</button>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  )
}
