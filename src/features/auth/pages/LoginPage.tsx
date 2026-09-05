import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'

export function LoginPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false)
  const login = useAuthStore((s) => s.login); const error = useAuthStore((s) => s.error); const location = useLocation(); const navigate = useNavigate()
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await login(email, password); navigate((location.state as { from?: string } | null)?.from || '/projects', { replace: true }) } catch { /* store exposes error */ } finally { setBusy(false) } }
  return <AuthLayout title="Entrar">
    <form onSubmit={submit} className="space-y-4">
      <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary" />
      <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary" />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">{busy ? 'Entrando…' : 'Entrar'}</button>
      <div className="flex justify-between text-sm"><Link className="text-primary" to="/forgot-password">Esqueci minha senha</Link><Link className="text-primary" to="/signup">Criar conta</Link></div>
    </form>
  </AuthLayout>
}
