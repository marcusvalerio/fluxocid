import { useEffect, type ReactElement, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './state/useAuthStore'

/** Runs the one-time session check (GET /api/auth/me) on app boot and blocks rendering until it
 * resolves — every route decision below assumes `status` is no longer 'loading'. */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg">
        <div className="text-text-secondary text-sm">Carregando…</div>
      </div>
    )
  }
  return <>{children}</>
}

/** Gate for /projects, /editor/*, /change-password — redirects to /login when signed out, and
 * (except on /change-password itself) forces a pending password change before anything else. */
export function RequireAuth({ children }: { children: ReactElement }) {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  return children
}

/** Gate for /login, /signup, /forgot-password, /reset-password — an already-authenticated user
 * has no reason to see these again. */
export function RedirectIfAuthed({ children }: { children: ReactElement }) {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  if (status === 'authenticated') {
    return <Navigate to={user?.mustChangePassword ? '/change-password' : '/projects'} replace />
  }
  return children
}
