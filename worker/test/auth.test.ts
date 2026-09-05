import { beforeEach, describe, expect, it, vi } from 'vitest'
import { env } from 'cloudflare:test'
import { api, signupAndLogin } from './helpers'

async function resetD1() {
  const db = (env as unknown as { DB: D1Database }).DB
  await db.exec('DELETE FROM projects')
  await db.exec('DELETE FROM password_reset_tokens')
  await db.exec('DELETE FROM sessions')
  await db.exec('DELETE FROM users')
}

beforeEach(async () => {
  await resetD1()
})

describe('signup', () => {
  it('creates a user and emails a temporary password', async () => {
    const { user, tempPassword } = await signupAndLogin('nova@example.com')
    expect(user.email).toBe('nova@example.com')
    expect(user.mustChangePassword).toBe(true)
    expect(tempPassword).toHaveLength(16)
  })

  it('rejects an invalid email', async () => {
    const res = await api('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email: 'not-an-email' }) })
    expect(res.status).toBe(400)
  })

  it('rejects signing up an email that already has an account', async () => {
    await signupAndLogin('duplicado@example.com')
    const res = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'duplicado@example.com' }),
    })
    expect(res.status).toBe(409)
  })
})

describe('login', () => {
  it('rejects a wrong password', async () => {
    await signupAndLogin('login1@example.com')
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'login1@example.com', password: 'senha-errada' }),
    })
    expect(res.status).toBe(401)
  })

  it('rejects a nonexistent user', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nao-existe@example.com', password: 'qualquer-coisa' }),
    })
    expect(res.status).toBe(401)
  })
})

describe('sessão (me / logout)', () => {
  it('/me retorna 401 sem cookie de sessão', async () => {
    const res = await api('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('/me retorna o usuário com um cookie de sessão válido', async () => {
    const { cookie, user } = await signupAndLogin('sessao@example.com')
    const res = await api('/api/auth/me', { cookie })
    expect(res.status).toBe(200)
    const body = await res.json<{ user: { email: string } }>()
    expect(body.user.email).toBe(user.email)
  })

  it('logout invalida a sessão — /me passa a retornar 401', async () => {
    const { cookie } = await signupAndLogin('logout@example.com')
    const logoutRes = await api('/api/auth/logout', { method: 'POST', cookie })
    expect(logoutRes.status).toBe(204)

    const meRes = await api('/api/auth/me', { cookie })
    expect(meRes.status).toBe(401)
  })
})

describe('change-password', () => {
  it('exige a senha atual correta', async () => {
    const { cookie } = await signupAndLogin('trocar1@example.com')
    const res = await api('/api/auth/change-password', {
      method: 'POST',
      cookie,
      body: JSON.stringify({ currentPassword: 'errada', newPassword: 'novaSenhaSegura123' }),
    })
    expect(res.status).toBe(401)
  })

  it('troca a senha e permite login com a nova senha', async () => {
    const { cookie, tempPassword } = await signupAndLogin('trocar2@example.com')
    const changeRes = await api('/api/auth/change-password', {
      method: 'POST',
      cookie,
      body: JSON.stringify({ currentPassword: tempPassword, newPassword: 'novaSenhaSegura123' }),
    })
    expect(changeRes.status).toBe(200)
    const changed = await changeRes.json<{ user: { mustChangePassword: boolean } }>()
    expect(changed.user.mustChangePassword).toBe(false)

    const loginRes = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'trocar2@example.com', password: 'novaSenhaSegura123' }),
    })
    expect(loginRes.status).toBe(200)
  })

  it('invalida a sessão antiga ao trocar a senha', async () => {
    const { cookie, tempPassword } = await signupAndLogin('trocar3@example.com')
    await api('/api/auth/change-password', {
      method: 'POST',
      cookie,
      body: JSON.stringify({ currentPassword: tempPassword, newPassword: 'outraSenhaSegura123' }),
    })
    // A sessão emitida ANTES da troca (capturada em `cookie`) não deve mais funcionar — apenas a
    // nova sessão retornada pelo próprio change-password (que o cliente adotaria no navegador).
    const meWithOldCookie = await api('/api/auth/me', { cookie })
    expect(meWithOldCookie.status).toBe(401)
  })
})

describe('forgot-password / reset-password', () => {
  it('responde com sucesso genérico mesmo para e-mail inexistente (sem revelar existência)', async () => {
    const res = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'ninguem@example.com' }),
    })
    expect(res.status).toBe(200)
  })

  it('permite redefinir a senha com o token enviado por e-mail', async () => {
    await signupAndLogin('recuperar@example.com')

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const forgotRes = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'recuperar@example.com' }),
    })
    expect(forgotRes.status).toBe(200)
    const logged = logSpy.mock.calls.map((args) => args.join(' ')).join('\n')
    logSpy.mockRestore()
    const match = logged.match(/token=(\S+)/)
    expect(match?.[1]).toBeTruthy()
    const token = match![1]!

    const resetRes = await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: 'senhaRecuperada123' }),
    })
    expect(resetRes.status).toBe(200)

    const loginRes = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'recuperar@example.com', password: 'senhaRecuperada123' }),
    })
    expect(loginRes.status).toBe(200)
  })

  it('rejeita um token de redefinição já usado', async () => {
    await signupAndLogin('recuperar2@example.com')
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'recuperar2@example.com' }),
    })
    const logged = logSpy.mock.calls.map((args) => args.join(' ')).join('\n')
    logSpy.mockRestore()
    const token = logged.match(/token=(\S+)/)?.[1]
    expect(token).toBeTruthy()

    const first = await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: 'primeiraTroca123' }),
    })
    expect(first.status).toBe(200)

    const second = await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: 'segundaTroca123' }),
    })
    expect(second.status).toBe(400)
  })

  it('rejeita um token inválido', async () => {
    const res = await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'token-que-nao-existe', newPassword: 'qualquerSenha123' }),
    })
    expect(res.status).toBe(400)
  })
})
