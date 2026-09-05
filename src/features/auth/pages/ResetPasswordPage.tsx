import { useState, type FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'

export function ResetPasswordPage() {
  const [params] = useSearchParams(); const token = params.get('token') ?? ''; const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false)
  const resetPassword = useAuthStore((s) => s.resetPassword); const error = useAuthStore((s) => s.error); const navigate = useNavigate()
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await resetPassword(token, password); setDone(true) } catch { /* store exposes error */ } finally { setBusy(false) } }
  return <AuthLayout title="Redefinir senha">{done ? <><p className="text-sm text-text-secondary">Senha redefinida com sucesso.</p><button onClick={() => navigate('/login')} className="mt-5 w-full rounded-md bg-primary px-4 py-2 text-white">Ir para o login</button></> : <form onSubmit={submit} className="space-y-4"><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha (mín. 8 caracteres)" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary" />{error && <p className="text-sm text-danger">{error}</p>}<button disabled={busy || !token} className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">{busy ? 'Salvando…' : 'Redefinir senha'}</button><Link className="block text-center text-primary text-sm" to="/login">Voltar ao login</Link></form>}</AuthLayout>
}
