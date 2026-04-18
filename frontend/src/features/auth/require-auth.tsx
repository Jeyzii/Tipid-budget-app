import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './auth-context'

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-400">
        <p className="text-sm">Loading…</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
