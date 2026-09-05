import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'

export function SignupPage() {
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false)
  const signup = useAuthStore((s) => s.signup); const error = useAuthStore((s) => s.error); const navigate = useNavigate()
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await signup(email); setSent(true) } catch { /* store exposes error */ } finally { setBusy(false) } }
  if (sent) return <AuthLayout title="Conta criada"><p className="text-sm text-text-secondary">Se o envio de e-mail estiver configurado, sua senha temporária foi enviada para <strong>{email}</strong>.</p><button onClick={() => navigate('/login')} className="mt-5 w-full rounded-md bg-primary px-4 py-2 text-white">Ir para o login</button></AuthLayout>
  return <AuthLayout title="Criar conta"><form onSubmit={submit} className="space-y-4"><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary" />{error && <p className="text-sm text-danger">{error}</p>}<button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">{busy ? 'Criando…' : 'Criar conta'}</button><Link className="block text-center text-sm text-primary" to="/login">Já tenho conta</Link></form></AuthLayout>
}
