import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout, ErrorBanner, SuccessBanner } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/TextField'

interface LoginLocationState {
  justSignedUp?: boolean
  email?: string
  justReset?: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state as LoginLocationState | null) ?? null
  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [email, setEmail] = useState(locationState?.email ?? '')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      const { user } = useAuthStore.getState()
      navigate(user?.mustChangePassword ? '/change-password' : '/projects', { replace: true })
    } catch {
      // error already surfaced via the store
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse seus projetos de layout logístico">
      {locationState?.justSignedUp && (
        <SuccessBanner message="Conta criada! Confira seu e-mail para a senha temporária de acesso." />
      )}
      {locationState?.justReset && <SuccessBanner message="Senha redefinida com sucesso. Faça login com a nova senha." />}
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) clearError()
          }}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (error) clearError()
          }}
        />
        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <div className="flex items-center justify-between mt-4 text-sm">
        <Link to="/forgot-password" className="text-primary hover:underline">
          Esqueci minha senha
        </Link>
        <Link to="/signup" className="text-primary hover:underline">
          Criar conta
        </Link>
      </div>
    </AuthLayout>
  )
}
