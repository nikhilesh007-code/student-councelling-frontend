import { createFileRoute, useRouteContext, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})

const MOCK_SETTINGS_DATA = {
  profile: {
    name: 'Nikhil',
    email: 'nikhil@example.com',
    phone: '+1 234 567 8900'
  },
  notifications: {
    emailAlerts: true,
    careerRecommendations: true,
    internshipAlerts: false,
    mentorSessions: true,
    placementUpdates: true
  },
  privacy: {
    publicProfile: false,
    aiPersonalization: true,
    shareWithMentors: true
  },
  aiPreferences: {
    careerDomain: 'Software Engineering',
    frequency: 'Weekly',
    learningStyle: 'Visual'
  }
}

function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const context = useRouteContext({ strict: false }) as any;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({
    name: context?.sessionUser?.name || MOCK_SETTINGS_DATA.profile.name,
    email: context?.sessionUser?.email || MOCK_SETTINGS_DATA.profile.email,
    phone: context?.profile?.phone || MOCK_SETTINGS_DATA.profile.phone
  })
  const [notifications, setNotifications] = useState(MOCK_SETTINGS_DATA.notifications)
  const [privacy, setPrivacy] = useState(MOCK_SETTINGS_DATA.privacy)
  const [aiPrefs, setAiPrefs] = useState(MOCK_SETTINGS_DATA.aiPreferences)
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Future Integration Structure:
  // GET /api/profile -> populates profile state
  // GET /api/settings -> populates notifications, privacy, aiPrefs state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (context?.sessionUser || context?.profile) {
      setProfile(prev => ({
        ...prev,
        name: context?.sessionUser?.name || prev.name,
        email: context?.sessionUser?.email || prev.email,
        phone: context?.profile?.phone || prev.phone
      }))
    }
  }, [context?.sessionUser, context?.profile])

  // PUT /api/profile -> saves profile state
  // PUT /api/settings -> saves notifications, privacy, aiPrefs state
  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setError(null)
    try {
      const response = await fetch("http://localhost:3000/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: context?.sessionUser?.id,
          name: profile.name,
          phone: profile.phone,
        })
      });
      const result = await response.json();
      if (!result.success) throw new Error("Failed to update profile settings");
      setSaveSuccess(true);
      
      // Invalidate relevant queries so the user sees fresh recommendations and skill gap analysis
      await queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      await queryClient.invalidateQueries({ queryKey: ['recommendations-ai'] });
      await queryClient.invalidateQueries({ queryKey: ['assessment-data'] });
      await queryClient.invalidateQueries({ queryKey: ['assessment-ai'] });

      setTimeout(() => setSaveSuccess(false), 3000);
      router.invalidate();
    } catch (err) {
      setError("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Loading settings...</p>
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
           <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load settings</h3>
           <p className="text-slate-500 mb-6">{error}</p>
           <button onClick={() => window.location.reload()} className="bg-[#00a878] text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
         </div>
       </DashboardLayout>
    )
  }

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-6xl mx-auto pb-10">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              Settings <span className="material-symbols-outlined text-[#00a878]">settings</span>
            </h2>
            <p className="text-[14px] text-slate-500">Manage your account, privacy, and AI personalization preferences.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {saveSuccess && <span className="text-[13px] font-bold text-[#00a878] flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Saved</span>}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`bg-[#00a878] text-white px-6 py-2.5 rounded-xl text-[13px] font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 min-w-[120px]
                ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#008b63] shadow-emerald-200'}`}
            >
              {isSaving ? (
                 <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">save</span> Save Changes</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0 items-start">
          
          {/* Left Sidebar Navigation (Sticky on Desktop) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 space-y-1">
            {[
              { id: 'section-account', label: 'Account Profile', icon: 'person' },
              { id: 'section-security', label: 'Security', icon: 'shield' },
              { id: 'section-notifications', label: 'Notifications', icon: 'notifications' },
              { id: 'section-appearance', label: 'Appearance', icon: 'palette' },
              { id: 'section-privacy', label: 'Privacy', icon: 'lock' },
              { id: 'section-ai', label: 'AI Preferences', icon: 'psychology' },
              { id: 'section-data', label: 'Data Management', icon: 'database' },
              { id: 'section-danger', label: 'Danger Zone', icon: 'warning' }
            ].map(item => (
               <button 
                 key={item.id}
                 onClick={() => handleNavClick(item.id)}
                 className="w-full flex items-center gap-3 px-4 py-3 text-left text-[13px] font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-[#00a878] transition-colors"
               >
                 <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                 {item.label}
               </button>
            ))}
          </div>

          {/* Main Settings Sections */}
          <div className="lg:col-span-9 space-y-8 min-w-0 pb-20">
            
            {/* 1. Account Settings */}
            <section id="section-account" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">person</span> Account Profile
              </h3>
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-3 relative group overflow-hidden border-4 border-white shadow-sm">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgWym7DldXnEhbwrZfOC_NtONNlu4wbur2YuUXlTYUj6VmxMEZO2HJWwSPYYQTXzRX7-PmkDBpwV_75e7fNpjESS8isWeROPalBEFI9HiCOwn-e2oZilJQCE3Kzbce13jlDDGk1vo1w5E7QIsPvJA687oWsXRDVYT-EUbDZWp4665oxoMeLY4aY6nJI_yrC_P5JnSo2qzObHk6mAqNTs8B3J8zJxzOZD4k7SgXV-Uty1g0yAf_Yq8cTiLkyqdOxyB7xfFEzPzlT_bp" alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="material-symbols-outlined text-white">photo_camera</span>
                    </div>
                  </div>
                  <button className="text-[12px] font-bold text-[#00a878] hover:underline">Change Photo</button>
                </div>
                <div className="flex-1 w-full space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 min-w-0">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:ring-2 focus:ring-[#00a878]/20 focus:border-[#00a878] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                      <input 
                        type="text" 
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:ring-2 focus:ring-[#00a878]/20 focus:border-[#00a878] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:ring-2 focus:ring-[#00a878]/20 focus:border-[#00a878] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Security */}
            <section id="section-security" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">shield</span> Security
              </h3>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl">
                  <div>
                    <h4 className="text-[14px] font-extrabold text-slate-900 mb-1">Password</h4>
                    <p className="text-[13px] text-slate-500">Last changed 3 months ago</p>
                  </div>
                  <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-slate-200 transition-colors">Change Password</button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-6 h-6" />
                    <div>
                      <h4 className="text-[14px] font-extrabold text-slate-900 mb-1">Google Account</h4>
                      <p className="text-[13px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Connected
                      </p>
                    </div>
                  </div>
                  <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-slate-200 transition-colors">Disconnect</button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl">
                  <div>
                    <h4 className="text-[14px] font-extrabold text-slate-900 mb-1">Active Sessions</h4>
                    <p className="text-[13px] text-slate-500">You are logged in on 2 devices</p>
                  </div>
                  <button className="text-red-500 hover:text-red-600 text-[13px] font-bold">Log out all devices</button>
                </div>
              </div>
            </section>

            {/* 3. Notifications */}
            <section id="section-notifications" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">notifications</span> Notifications
              </h3>
              <div className="space-y-4">
                {[
                  { id: 'emailAlerts', label: 'Email Notifications', desc: 'Receive summaries and major alerts via email.' },
                  { id: 'careerRecommendations', label: 'Career Recommendations', desc: 'Alerts when AI finds new career matches.' },
                  { id: 'internshipAlerts', label: 'Internship Alerts', desc: 'Notifications for new jobs and internships.' },
                  { id: 'mentorSessions', label: 'Mentor Sessions', desc: 'Reminders for upcoming 1-on-1 sessions.' },
                  { id: 'placementUpdates', label: 'Placement Updates', desc: 'Critical placement tracking updates.' }
                ].map(setting => (
                  <div key={setting.id} className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="min-w-0 pr-4">
                      <h4 className="text-[14px] font-bold text-slate-900 mb-0.5">{setting.label}</h4>
                      <p className="text-[12px] text-slate-500">{setting.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications[setting.id as keyof typeof notifications]}
                        onChange={(e) => setNotifications({...notifications, [setting.id]: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a878]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Appearance */}
            <section id="section-appearance" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-pink-500">palette</span> Appearance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button className="border-2 border-[#00a878] rounded-xl p-4 flex flex-col items-center gap-3 relative bg-slate-50/50">
                  <div className="absolute top-2 right-2 w-4 h-4 bg-[#00a878] rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] text-white">check</span>
                  </div>
                  <span className="material-symbols-outlined text-[32px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>light_mode</span>
                  <span className="text-[13px] font-bold text-slate-900">Light Mode</span>
                </button>
                <button className="border-2 border-slate-100 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-slate-200 transition-colors bg-slate-900">
                  <span className="material-symbols-outlined text-[32px] text-blue-300" style={{ fontVariationSettings: "'FILL' 1" }}>dark_mode</span>
                  <span className="text-[13px] font-bold text-white">Dark Mode</span>
                </button>
                <button className="border-2 border-slate-100 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-slate-200 transition-colors">
                  <span className="material-symbols-outlined text-[32px] text-slate-500">settings_brightness</span>
                  <span className="text-[13px] font-bold text-slate-900">System Auto</span>
                </button>
              </div>
            </section>

            {/* 5. Privacy */}
            <section id="section-privacy" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-600">lock</span> Privacy
              </h3>
              <div className="space-y-4">
                {[
                  { id: 'publicProfile', label: 'Public Profile', desc: 'Allow recruiters and other students to search for your profile.' },
                  { id: 'aiPersonalization', label: 'Allow AI Personalization', desc: 'Let our AI use your data to improve career roadmap accuracy.' },
                  { id: 'shareWithMentors', label: 'Share Data With Mentors', desc: 'Automatically share your skill gap analysis when booking a session.' }
                ].map(setting => (
                  <div key={setting.id} className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="min-w-0 pr-4">
                      <h4 className="text-[14px] font-bold text-slate-900 mb-0.5">{setting.label}</h4>
                      <p className="text-[12px] text-slate-500">{setting.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={privacy[setting.id as keyof typeof privacy]}
                        onChange={(e) => setPrivacy({...privacy, [setting.id]: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a878]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. AI Preferences */}
            <section id="section-ai" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00a878]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span> AI Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Preferred Career Domain</label>
                  <select 
                    value={aiPrefs.careerDomain}
                    onChange={(e) => setAiPrefs({...aiPrefs, careerDomain: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:ring-2 focus:ring-[#00a878]/20 focus:border-[#00a878] outline-none transition-all appearance-none"
                  >
                    <option>Software Engineering</option>
                    <option>Data Science & AI</option>
                    <option>Product Management</option>
                    <option>UI/UX Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Learning Style</label>
                  <select 
                    value={aiPrefs.learningStyle}
                    onChange={(e) => setAiPrefs({...aiPrefs, learningStyle: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:ring-2 focus:ring-[#00a878]/20 focus:border-[#00a878] outline-none transition-all appearance-none"
                  >
                    <option>Visual (Videos & Diagrams)</option>
                    <option>Auditory (Podcasts & Lectures)</option>
                    <option>Reading/Writing (Docs & Blogs)</option>
                    <option>Kinesthetic (Hands-on Projects)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Recommendation Frequency</label>
                  <select 
                    value={aiPrefs.frequency}
                    onChange={(e) => setAiPrefs({...aiPrefs, frequency: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:ring-2 focus:ring-[#00a878]/20 focus:border-[#00a878] outline-none transition-all appearance-none"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 7. Data Management */}
            <section id="section-data" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">database</span> Data Management
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
                  <span className="material-symbols-outlined text-[24px] text-slate-400">download</span>
                  <div>
                    <h4 className="text-[13px] font-extrabold text-slate-900">Export My Data</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Download a JSON of your profile.</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
                  <span className="material-symbols-outlined text-[24px] text-slate-400">summarize</span>
                  <div>
                    <h4 className="text-[13px] font-extrabold text-slate-900">Download Reports</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Get a PDF of your skill gaps.</p>
                  </div>
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button className="text-[13px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span> Reset Preferences to Default
                </button>
              </div>
            </section>

            {/* 8. Danger Zone */}
            <section id="section-danger" className="bg-red-50/50 rounded-2xl p-6 sm:p-8 border border-red-100 min-w-0">
              <h3 className="text-lg font-extrabold text-red-600 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span> Danger Zone
              </h3>
              <p className="text-[13px] text-red-500/80 mb-6">Irreversible actions that will permanently delete your data.</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-red-100 rounded-xl">
                <div>
                  <h4 className="text-[14px] font-extrabold text-slate-900 mb-1">Delete Account</h4>
                  <p className="text-[12px] text-slate-500">Permanently remove your account and all associated data.</p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-50 text-red-600 px-5 py-2.5 rounded-lg text-[13px] font-extrabold hover:bg-red-600 hover:text-white transition-colors border border-red-100 shrink-0"
                >
                  Delete Account
                </button>
              </div>
            </section>

          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Delete Account?</h3>
              <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
                This action cannot be undone. All your progress, resumes, mock test scores, and AI recommendations will be permanently lost. Are you absolutely sure?
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-[13px] font-extrabold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Mock: Account Deleted');
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-[13px] font-extrabold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Yes, Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
