import { createFileRoute, useRouteContext, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { authClient } from '../../../lib/auth-client'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})

// Total time the green save-wave takes to travel the full length of the page
const WAVE_DURATION = 2.4
const PROFILE_DELAY = 0
const NOTIFICATIONS_DELAY = WAVE_DURATION * (1 / 4)
const SECURITY_DELAY = WAVE_DURATION * (2 / 4)

function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const context = useRouteContext({ strict: false }) as any;
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const sessionUser = context?.sessionUser;
  // Naive check for Google Auth (assuming Google avatars or gmail for this demo)
  const isGoogleAuth = sessionUser?.image?.includes('googleusercontent') || sessionUser?.email?.includes('@gmail.com');

  const [profile, setProfile] = useState({
    name: sessionUser?.name || 'Student',
    email: sessionUser?.email || 'student@example.com',
    phone: context?.profile?.phone || ''
  })
  
  const [notifications, setNotifications] = useState({
    careerRecommendations: true,
    internshipAlerts: true,
    weeklyProgressReminder: true
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Save-wave animation state
  const [saveWave, setSaveWave] = useState(0)
  const [showFloatingCheck, setShowFloatingCheck] = useState(false)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (sessionUser || context?.profile) {
      setProfile(prev => ({
        ...prev,
        name: sessionUser?.name || prev.name,
        email: sessionUser?.email || prev.email,
        phone: context?.profile?.phone || prev.phone
      }))
    }
  }, [sessionUser, context?.profile])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setError(null)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: sessionUser?.id,
          name: profile.name,
          phone: profile.phone,
        })
      });
      const result = await response.json();
      if (!result.success) throw new Error("Failed to update profile settings");
      setSaveSuccess(true);
      
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      setTimeout(() => setSaveSuccess(false), 3000);
      router.invalidate();

      // Trigger the premium AI save-wave animation
      setSaveWave((w) => w + 1)
      setTimeout(() => {
        setShowFloatingCheck(true)
        setTimeout(() => setShowFloatingCheck(false), 1500)
      }, WAVE_DURATION * 1000 + 150)
    } catch (err) {
      setError("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const { error } = await authClient.deleteUser({
        callbackURL: '/login'
      });
      
      if (error) {
        console.error("Delete user error:", error);
        alert("Failed to delete account. Please contact support.");
      } else {
        window.location.href = '/login';
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete account.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }
  
  const handleLogoutAll = async () => {
     try {
       await authClient.revokeOtherSessions();
       alert("Logged out from all other devices successfully.");
     } catch (e) {
       console.error("Logout all failed", e);
     }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-emerald-500"></div>
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
           <button onClick={() => window.location.reload()} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
         </div>
       </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-[850px] mx-auto pb-20">
        
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[32px] font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
              Settings
            </h2>
            <p className="text-[15px] text-slate-500 font-medium mt-1">Manage your profile, security, and notifications.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0 relative">
            {saveSuccess && <span className="text-[14px] font-bold text-emerald-600 flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">check_circle</span> Saved</span>}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving}
              className={`bg-emerald-500 text-white px-8 py-3.5 rounded-xl text-[14px] font-bold transition-all shadow-md flex items-center justify-center gap-2 min-w-[140px]
                ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-600 hover:-translate-y-0.5 shadow-emerald-500/20'}`}
            >
              {isSaving ? (
                 <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
              ) : (
                <>Save Changes</>
              )}
            </motion.button>

            {/* Floating success check + sparkles, appears once the wave finishes */}
            <AnimatePresence>
              {showFloatingCheck && (
                <motion.div
                  key="floating-check"
                  className="absolute -top-3 right-2 flex items-center justify-center pointer-events-none z-20"
                  initial={{ opacity: 0, y: 6, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [6, -14, -20, -30], scale: [0.6, 1.1, 1, 0.9] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.3, times: [0, 0.25, 0.7, 1], ease: 'easeOut' }}
                >
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                    <span className="material-symbols-outlined text-white text-[16px]">check</span>
                  </div>
                  {[0, 1, 2, 3].map((i) => (
                    <motion.span
                      key={i}
                      className="absolute text-emerald-400 text-[11px]"
                      style={{ left: `${(i - 1.5) * 13}px`, top: i % 2 === 0 ? '-11px' : '9px' }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5] }}
                      transition={{ duration: 1, delay: 0.1 + i * 0.06 }}
                    >
                      ✦
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative space-y-10 min-w-0">

            {/* 1. Profile Section */}
            <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100 min-w-0 relative overflow-hidden group">
              <h3 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                Profile
              </h3>
              <div className="flex flex-col sm:flex-row gap-10 items-start">
                <div className="flex-1 w-full space-y-6">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="text" 
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center justify-between">
                       Email Address
                       {isGoogleAuth && <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">Managed by Google</span>}
                    </label>
                    <input 
                      type="email" 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={isGoogleAuth}
                      className={`w-full px-5 py-3.5 border border-slate-200 rounded-xl text-[15px] font-medium transition-all outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${isGoogleAuth ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 text-slate-900'}`}
                    />
                  </div>
                </div>
              </div>

              {saveWave > 0 && (
                <motion.div
                  key={`profile-flash-${saveWave}`}
                  aria-hidden="true"
                  className="absolute inset-0 bg-emerald-400 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.12, 0] }}
                  transition={{ duration: 0.6, delay: PROFILE_DELAY, ease: 'easeInOut' }}
                />
              )}
            </section>

            {/* 2. Notifications */}
            <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100 min-w-0 relative overflow-hidden">
              <h3 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                Notifications
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'careerRecommendations', label: 'Career Recommendations', desc: 'Alerts when AI finds new career matches for you.' },
                  { id: 'internshipAlerts', label: 'Internship Alerts', desc: 'Notifications for new jobs and internships that match your profile.' },
                  { id: 'weeklyProgressReminder', label: 'Weekly Progress Reminder', desc: 'A weekly summary of your study planner and roadmap progress.' }
                ].map((setting, idx) => (
                  <div key={setting.id} className="flex items-center justify-between gap-6 py-5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="min-w-0 pr-4">
                      <h4 className="text-[15px] font-bold text-slate-900 mb-1">{setting.label}</h4>
                      <p className="text-[14px] text-slate-500">{setting.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications[setting.id as keyof typeof notifications]}
                        onChange={(e) => setNotifications({...notifications, [setting.id]: e.target.checked})}
                      />
                      {saveWave > 0 ? (
                        <motion.div
                          key={`toggle-pulse-${saveWave}-${idx}`}
                          className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.12, 1] }}
                          transition={{ duration: 0.4, delay: NOTIFICATIONS_DELAY + idx * 0.08 }}
                        />
                      ) : (
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                      )}
                    </label>
                  </div>
                ))}
              </div>

              {saveWave > 0 && (
                <motion.div
                  key={`notif-flash-${saveWave}`}
                  aria-hidden="true"
                  className="absolute inset-0 bg-emerald-400 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.12, 0] }}
                  transition={{ duration: 0.6, delay: NOTIFICATIONS_DELAY, ease: 'easeInOut' }}
                />
              )}
            </section>

            {/* 3. Security */}
            <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100 min-w-0 relative overflow-hidden">
              <h3 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                Security
              </h3>
              <div className="space-y-4">
                
                {isGoogleAuth ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 border border-slate-100 bg-slate-50/50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 mb-1">Connected with Google</h4>
                        <p className="text-[13px] text-emerald-600 font-bold flex items-center gap-1.5">
                          {saveWave > 0 ? (
                            <motion.span
                              key={`google-check-${saveWave}`}
                              className="material-symbols-outlined text-[16px]"
                              initial={{ scale: 1 }}
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ duration: 0.5, delay: SECURITY_DELAY }}
                            >
                              check_circle
                            </motion.span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          )}
                          Authenticated securely
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 border border-slate-100 bg-slate-50/50 rounded-2xl">
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 mb-1">Password Authentication</h4>
                      <p className="text-[14px] text-slate-500">Use a strong password to protect your account.</p>
                    </div>
                    <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl text-[14px] font-bold hover:bg-slate-50 transition-colors shadow-sm shrink-0">
                       Change Password
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 border border-slate-100 bg-slate-50/50 rounded-2xl">
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 mb-1">Active Sessions</h4>
                    <p className="text-[14px] text-slate-500">Sign out of all other browsers and devices.</p>
                  </div>
                  <button 
                    onClick={handleLogoutAll}
                    className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl text-[14px] font-bold hover:bg-slate-50 transition-colors shadow-sm shrink-0"
                  >
                    Logout from all devices
                  </button>
                </div>

              </div>

              {saveWave > 0 && (
                <motion.div
                  key={`security-flash-${saveWave}`}
                  aria-hidden="true"
                  className="absolute inset-0 bg-emerald-400 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.12, 0] }}
                  transition={{ duration: 0.6, delay: SECURITY_DELAY, ease: 'easeInOut' }}
                />
              )}
            </section>

            {/* 4. Danger Zone — never gets the flash highlight, always stays red */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border-2 border-red-50 min-w-0">
            <h3 className="text-xl font-extrabold text-red-600 mb-2 tracking-tight">
              Danger Zone
            </h3>
            <p className="text-[15px] text-slate-500 mb-8">Irreversible actions that will permanently delete your data.</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 border border-red-100 bg-red-50/30 rounded-2xl">
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 mb-1">Delete Account</h4>
                <p className="text-[14px] text-slate-500">Permanently remove your account and all associated data.</p>
              </div>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-50 text-red-600 px-6 py-3 rounded-xl text-[14px] font-bold hover:bg-red-600 hover:text-white transition-colors border border-red-100 shrink-0"
              >
                Delete Account
              </button>
            </div>
          </section>

          {/* Traveling green wave — travels the full page length, then fades out completely */}
          {saveWave > 0 && (
            <motion.div
              key={`wave-${saveWave}`}
              aria-hidden="true"
              className="absolute left-0 right-0 h-24 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.35), transparent)',
                filter: 'blur(6px)',
              }}
              initial={{ top: '-5%', opacity: 1 }}
              animate={{ top: '100%', opacity: [1, 1, 0] }}
              transition={{ duration: WAVE_DURATION, ease: 'easeInOut', times: [0, 0.85, 1] }}
            />
          )}

        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-2xl">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[32px]">warning</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Delete Account?</h3>
              <p className="text-[15px] text-slate-500 mb-6 leading-relaxed">
                This action cannot be undone. All your progress, resumes, mock test scores, and AI recommendations will be permanently lost.
              </p>
              
              <div className="mb-8">
                 <label className="block text-[13px] font-bold text-slate-700 mb-2">
                    To confirm, type <span className="font-black text-slate-900">DELETE</span> below:
                 </label>
                 <input 
                    type="text" 
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[15px] font-bold text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                 />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                     setShowDeleteModal(false);
                     setDeleteConfirmation('');
                  }}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl text-[15px] font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                  className={`flex-1 py-3.5 rounded-xl text-[15px] font-bold transition-all shadow-sm flex items-center justify-center
                    ${deleteConfirmation === 'DELETE' && !isDeleting 
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/20' 
                      : 'bg-red-100 text-red-300 cursor-not-allowed'}`}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
