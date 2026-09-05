import { Hono } from 'hono'
import { createPasswordResetToken, createUser, deleteAllSessionsForUser, findUserByEmail, updateUserPassword, consumePasswordResetToken } from '../db'
import { generateTempPassword, generateToken, hashPassword, hashToken, verifyPassword } from '../crypto'
import { getEmailSender } from '../email'
import { readJsonBody } from '../http'
import { clearSession, getSessionUser, issueSession } from '../session'
import type { Env } from '../types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const authRoutes = new Hono<{ Bindings: Env }>()
const publicUser = (u: { id: string; email: string; mustChangePassword: boolean }) => ({ id: u.id, email: u.email, mustChangePassword: u.mustChangePassword })

authRoutes.post('/signup', async (c) => {
  const body = await readJsonBody<{ email?: string }>(c)
  const email = body.email?.trim().toLowerCase() ?? ''
  if (!EMAIL_RE.test(email)) return c.json({ error: 'E-mail inválido.' }, 400)
  if (await findUserByEmail(c.env, email)) return c.json({ error: 'Este e-mail já possui uma conta. Faça login ou recupere sua senha.' }, 409)
  const tempPassword = generateTempPassword()
  await createUser(c.env, email, await hashPassword(tempPassword))
  await getEmailSender(c.env).send({ to: email, subject: 'Sua senha de acesso ao FluxoCit', text: `Sua conta no FluxoCit foi criada.\n\nSenha temporária: ${tempPassword}\n\nUse essa senha no primeiro acesso e defina uma nova senha em seguida.` })
  return c.json({ email }, 201)
})

authRoutes.post('/login', async (c) => {
  const body = await readJsonBody<{ email?: string; password?: string }>(c)
  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
  if (!email || !password) return c.json({ error: 'Informe e-mail e senha.' }, 400)
  const user = await findUserByEmail(c.env, email)
  if (!user || !(await verifyPassword(password, user.password_hash))) return c.json({ error: 'E-mail ou senha inválidos.' }, 401)
  await issueSession(c, user.id)
  return c.json({ user: publicUser({ id: user.id, email: user.email, mustChangePassword: user.must_change_password === 1 }) })
})

authRoutes.post('/logout', async (c) => { await clearSession(c); return c.body(null, 204) })

authRoutes.get('/me', async (c) => {
  const user = await getSessionUser(c)
  if (!user) return c.json({ error: 'Sessão expirada ou inexistente.' }, 401)
  return c.json({ user: publicUser(user) })
})

authRoutes.post('/change-password', async (c) => {
  const sessionUser = await getSessionUser(c)
  if (!sessionUser) return c.json({ error: 'Sessão expirada ou inexistente.' }, 401)
  const body = await readJsonBody<{ currentPassword?: string; newPassword?: string }>(c)
  const current = body.currentPassword ?? ''; const next = body.newPassword ?? ''
  if (next.length < 8) return c.json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' }, 400)
  const user = await findUserByEmail(c.env, sessionUser.email)
  if (!user || !(await verifyPassword(current, user.password_hash))) return c.json({ error: 'Senha atual incorreta.' }, 401)
  await updateUserPassword(c.env, user.id, await hashPassword(next), false)
  await deleteAllSessionsForUser(c.env, user.id)
  await issueSession(c, user.id)
  return c.json({ user: publicUser({ id: user.id, email: user.email, mustChangePassword: false }) })
})

authRoutes.post('/forgot-password', async (c) => {
  const body = await readJsonBody<{ email?: string }>(c)
  const email = body.email?.trim().toLowerCase() ?? ''
  const generic = { message: 'Se este e-mail estiver cadastrado, enviaremos instruções de recuperação em instantes.' }
  const user = EMAIL_RE.test(email) ? await findUserByEmail(c.env, email) : null
  if (!user) return c.json(generic)
  const token = generateToken()
  await createPasswordResetToken(c.env, user.id, await hashToken(token))
  await getEmailSender(c.env).send({ to: user.email, subject: 'Redefinição de senha — FluxoCit', text: `Acesse ${c.env.FRONTEND_ORIGIN}/reset-password?token=${token} para escolher uma nova senha. O link é válido por 1 hora.` })
  return c.json(generic)
})

authRoutes.post('/reset-password', async (c) => {
  const body = await readJsonBody<{ token?: string; newPassword?: string }>(c)
  const token = body.token ?? ''; const next = body.newPassword ?? ''
  if (!token || next.length < 8) return c.json({ error: 'Link inválido ou senha muito curta (mínimo 8 caracteres).' }, 400)
  const consumed = await consumePasswordResetToken(c.env, await hashToken(token))
  if (!consumed) return c.json({ error: 'Link de redefinição inválido ou expirado. Solicite um novo.' }, 400)
  await updateUserPassword(c.env, consumed.userId, await hashPassword(next), false)
  await deleteAllSessionsForUser(c.env, consumed.userId)
  return c.json({ message: 'Senha redefinida com sucesso. Faça login com a nova senha.' })
})
