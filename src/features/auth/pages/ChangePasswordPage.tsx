import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [busy, setBusy] = useState(false)
  const changePassword = useAuthStore((s) => s.changePassword); const error = useAuthStore((s) => s.error); const navigate = useNavigate()
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); try { await changePassword(currentPassword, newPassword); navigate('/projects', { replace: true }) } catch { /* store exposes error */ } finally { setBusy(false) } }
  return <AuthLayout title="Defina sua nova senha"><form onSubmit={submit} className="space-y-4"><input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Senha temporária" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary" /><input required minLength={8} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (mín. 8 caracteres)" className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary" />{error && <p className="text-sm text-danger">{error}</p>}<button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50">{busy ? 'Salvando…' : 'Definir nova senha'}</button></form></AuthLayout>
}
