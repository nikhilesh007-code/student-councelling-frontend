import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'
import { calculateProfileCompletion, hasMissingMandatoryFields } from '../lib/profile-utils'
import type { ProfileData } from '../lib/profile-utils'

type AuthenticatedContext = {
  profile: ProfileData | null;
  completionPercentage: number;
  sessionUser: { name?: string | null, email?: string | null } | null;
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }): Promise<AuthenticatedContext> => {
    const { data: session } = await authClient.getSession()
    const isAuthenticated = !!session

    if (!isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    let profileData: ProfileData | null = null;
    try {
      const res = await fetch('http://localhost:3000/api/profile', { credentials: 'include' })
      const data = await res.json()
      if (data.success && data.data) {
        profileData = data.data;
      }
    } catch (err) {
      console.error("Failed to fetch profile during onboarding check", err)
    }

    const sessionUser = session?.user ? { name: session.user.name, email: session.user.email } : null;
    const completionPercentage = calculateProfileCompletion(profileData, sessionUser);
    
    console.log('[_authenticated route guard] pathname:', location.pathname);
    console.log('[_authenticated route guard] calculated completion:', completionPercentage);

    // Using the exact same completion value (60%) for route access as we do for sidebar locks
    if (completionPercentage < 60 && location.pathname !== '/profile') {
      console.log('[_authenticated route guard] REDIRECTING to /profile due to < 60% completion');
      throw redirect({
        to: '/profile'
      })
    }

    return {
      profile: profileData,
      completionPercentage,
      sessionUser
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  )
}
