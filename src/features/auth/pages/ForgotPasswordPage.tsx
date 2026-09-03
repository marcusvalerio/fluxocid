import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout, ErrorBanner, SuccessBanner } from '../AuthLayout'
import { useAuthStore } from '../state/useAuthStore'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/TextField'

export function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch {
      // error already surfaced via the store
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Recuperar senha" subtitle="Enviaremos um link de redefinição para o seu e-mail">
      {error && <ErrorBanner message={error} />}
      {sent ? (
        <SuccessBanner message="Se este e-mail estiver cadastrado, você receberá instruções em instantes." />
      ) : (
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
            {submitting ? 'Enviando…' : 'Enviar instruções'}
          </Button>
        </form>
      )}
      <div className="text-center mt-4 text-sm">
        <Link to="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      </div>
    </AuthLayout>
  )
}
