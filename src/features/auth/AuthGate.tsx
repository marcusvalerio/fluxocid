import { useEffect, type ReactElement, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './state/useAuthStore'

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status); const bootstrap = useAuthStore((s) => s.bootstrap)
  useEffect(() => { void bootstrap() }, [bootstrap])
  if (status === 'loading') return <div className="min-h-dvh flex items-center justify-center bg-bg text-text-secondary text-sm">Carregando…</div>
  return <>{children}</>
}

export function RequireAuth({ children }: { children: ReactElement }) {
  const status = useAuthStore((s) => s.status); const user = useAuthStore((s) => s.user); const remoteEnabled = useAuthStore((s) => s.remoteEnabled); const location = useLocation()
  if (!remoteEnabled) return children
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user?.mustChangePassword && location.pathname !== '/change-password') return <Navigate to="/change-password" replace />
  return children
}

export function RedirectIfAuthed({ children }: { children: ReactElement }) {
  const status = useAuthStore((s) => s.status); const user = useAuthStore((s) => s.user)
  if (status === 'authenticated') return <Navigate to={user?.mustChangePassword ? '/change-password' : '/projects'} replace />
  return children
}
