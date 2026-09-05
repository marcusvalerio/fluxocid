import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false)
  const forgotPassword = useAuthStore((s) => s.forgotPassword); const error = useAuthStore((s) => s.error)
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await forgotPassword(email); setSent(true) } catch { /* store exposes error */ } finally { setBusy(false) } }
  return <AuthLayout title="Recuperar senha">{sent ? <><p className="text-sm text-text-secondary">Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.</p><Link className="mt-5 block text-center text-primary text-sm" to="/login">Voltar ao login</Link></> : <form onSubmit={submit} className="space-y-4"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary" />{error && <p className="text-sm text-danger">{error}</p>}<button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">{busy ? 'Enviando…' : 'Enviar instruções'}</button><Link className="block text-center text-primary text-sm" to="/login">Voltar ao login</Link></form>}</AuthLayout>
}
