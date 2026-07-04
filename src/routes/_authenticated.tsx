import { createFileRoute, Outlet } from '@tanstack/react-router'
import { calculateProfileCompletion } from '../lib/profile-utils'
import type { ProfileData } from '../lib/profile-utils'
import { getMockProfile } from '../lib/mock-data'

type AuthenticatedContext = {
  profile: ProfileData | null;
  completionPercentage: number;
  sessionUser: { name?: string | null, email?: string | null } | null;
}

export const Route = createFileRoute('/_authenticated')({
  staleTime: 5 * 60 * 1000, // treat session/profile as fresh for 5 minutes — stop re-fetching on every page click
  beforeLoad: async ({ location }): Promise<AuthenticatedContext> => {
    // 1. Frontend-only mode: Remove Better Auth session fetch, use mock user directly
    const sessionResponse = await fetch(
  `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/get-session`,
  {
    credentials: "include",
  }
);

const sessionData = await sessionResponse.json();

const sessionUser = sessionData?.user ?? null;

    let profileData: ProfileData | null = null;
    
    if (sessionUser?.id) {
        try {
            const profileResponse = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/profile/${sessionUser.id}`, {
                credentials: "include",
            });
            const result = await profileResponse.json();
            if (result.success && result.data) {
                profileData = result.data;
            }
        } catch (err) {
            console.error("Failed to fetch real profile", err);
        }
    }

    // Fallback to mock profile if still null (useful if backend not available)
    if (!profileData) {
        try {
          profileData = await getMockProfile();
        } catch (err) {
          console.error("Failed to fetch mock profile", err)
        }
    }

    // 3. Keep completion for informational banner, but DO NOT block routes or redirect
    const completionPercentage = calculateProfileCompletion(profileData, sessionUser);
    

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
