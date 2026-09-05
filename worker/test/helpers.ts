import { SELF } from 'cloudflare:test'
import { vi } from 'vitest'

const BASE = 'http://example.com'

export async function api(path: string, init: RequestInit & { cookie?: string } = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  if (init.cookie) headers.set('Cookie', init.cookie)
  return SELF.fetch(`${BASE}${path}`, { ...init, headers })
}

function sessionCookieFrom(res: Response): string {
  const raw = res.headers.get('set-cookie')
  if (!raw) throw new Error('response did not set a session cookie')
  return raw.split(';')[0] ?? raw
}

/** Signs a fresh user up, captures the temp password from the console-logged "email", and logs
 * in — returning the session cookie for authenticated requests in tests. */
export async function signupAndLogin(email: string): Promise<{
  cookie: string
  user: { id: string; email: string; mustChangePassword: boolean }
  tempPassword: string
}> {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  const signupRes = await api('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email }) })
  if (signupRes.status !== 201) throw new Error(`signup failed: ${signupRes.status} ${await signupRes.text()}`)
  const logged = logSpy.mock.calls.map((args) => args.join(' ')).join('\n')
  logSpy.mockRestore()
  const match = logged.match(/Senha temporária: (\S+)/)
  if (!match?.[1]) throw new Error(`temp password not found in log output: ${logged}`)
  const tempPassword = match[1]

  const loginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: tempPassword }),
  })
  if (loginRes.status !== 200) throw new Error(`login failed: ${loginRes.status}`)
  const cookie = sessionCookieFrom(loginRes)
  const body = await loginRes.json<{ user: { id: string; email: string; mustChangePassword: boolean } }>()
  return { cookie, user: body.user, tempPassword }
}
