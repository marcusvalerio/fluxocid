import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout, ErrorBanner } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/TextField'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const changePassword = useAuthStore((s) => s.changePassword)
  const logout = useAuthStore((s) => s.logout)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [currentPassword, setCurrentPassword] = useState('')
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
      await changePassword(currentPassword, newPassword)
      navigate('/projects', { replace: true })
    } catch {
      // error already surfaced via the store
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={user?.mustChangePassword ? 'Defina sua senha' : 'Trocar senha'}
      subtitle={
        user?.mustChangePassword
          ? 'Por segurança, defina uma nova senha antes de continuar'
          : 'Escolha uma nova senha para sua conta'
      }
    >
      {(localError || error) && <ErrorBanner message={localError ?? error ?? ''} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label={user?.mustChangePassword ? 'Senha temporária (recebida por e-mail)' : 'Senha atual'}
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            if (error) clearError()
          }}
        />
        <TextField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          required
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
          {submitting ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
        {!user?.mustChangePassword && (
          <Button type="button" variant="secondary" className="w-full" onClick={() => navigate('/projects')}>
            Cancelar
          </Button>
        )}
      </form>
      <div className="text-center mt-4 text-sm">
        <button type="button" onClick={() => logout().then(() => navigate('/login'))} className="text-text-secondary hover:underline">
          Sair
        </button>
      </div>
    </AuthLayout>
  )
}
