import { createMiddleware } from 'hono/factory'
import { getSessionUser } from './session'
import type { Env, SessionUser } from './types'

/** Rejects unauthenticated requests; otherwise attaches the session user to the context so
 * downstream handlers never re-derive it. */
export const requireAuth = createMiddleware<{ Bindings: Env; Variables: { user: SessionUser } }>(
  async (c, next) => {
    const user = await getSessionUser(c)
    if (!user) return c.json({ error: 'Sessão expirada ou inexistente.' }, 401)
    c.set('user', user)
    await next()
  },
)
