import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    // TODO: Replace this with the actual auth check once auth is implemented.
    // Example: const { isAuthenticated } = useAuthStore.getState()
    const isAuthenticated = true

    if (!isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        // Preserve the attempted URL so we can redirect back after login.
        // TODO: Read `search.redirect` in the login page and navigate there on success.
        search: { redirect: location.href },
      })
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
