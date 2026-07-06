import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import './index.css'

function RouteLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
    </div>
  )
}

const router = createRouter({
  routeTree,
  defaultPendingComponent: RouteLoadingSpinner, // shows instantly instead of freezing on the old page
  defaultPendingMs: 150,                        // wait 150ms before showing it, to avoid flicker on fast navigations
  defaultPreload: 'intent',                      // starts loading a page's data as soon as you hover its link
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
