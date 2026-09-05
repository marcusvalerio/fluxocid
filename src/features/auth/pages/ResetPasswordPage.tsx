import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout, ErrorBanner } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/TextField'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setLocalError(null)
    if (newPassword.length < 8) {
      setLocalError('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setLocalError('As senhas não coincidem.')
      return
    }
    setSubmitting(true)
    try {
      await resetPassword(token, newPassword)
      navigate('/login', { replace: true, state: { justReset: true } })
    } catch {
      // error already surfaced via the store
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Link inválido">
        <ErrorBanner message="Este link de redefinição está incompleto ou inválido. Solicite um novo." />
        <div className="text-center mt-4 text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Definir nova senha" subtitle="Escolha uma nova senha para sua conta">
      {(localError || error) && <ErrorBanner message={localError ?? error ?? ''} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          required
          autoFocus
          minLength={8}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            setLocalError(null)
            if (error) clearError()
          }}
        />
        <TextField
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setLocalError(null)
            if (error) clearError()
          }}
        />
        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Redefinir senha'}
        </Button>
      </form>
    </AuthLayout>
  )
}
