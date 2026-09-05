import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, ErrorBanner } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/TextField'

export function SignupPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await signup(email.trim())
      navigate('/login', { replace: true, state: { justSignedUp: true, email: email.trim() } })
    } catch {
      // error already surfaced via the store
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Informe seu e-mail — enviaremos uma senha de acesso">
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) clearError()
          }}
        />
        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
      <p className="text-xs text-text-secondary mt-3">
        Você receberá uma senha temporária por e-mail e poderá defini-la novamente no primeiro acesso.
      </p>
      <div className="text-center mt-4 text-sm">
        <Link to="/login" className="text-primary hover:underline">
          Já tenho conta — entrar
        </Link>
      </div>
    </AuthLayout>
  )
}
