import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { createSession, deleteSession, findUserById, findValidSession } from './db'
import { generateToken, hashToken } from './crypto'
import type { Env, SessionUser } from './types'

export const SESSION_COOKIE = 'fluxocit_session'
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

/** Cookies can only carry `Secure` over an actual HTTPS connection — `wrangler dev` serves plain
 * HTTP on localhost, so marking it unconditionally would silently break local login. */
function isHttps(c: Context): boolean {
  return new URL(c.req.url).protocol === 'https:'
}

// Generic over the caller's full context type (Bindings must extend Env, Variables unconstrained)
// so this accepts both a plain `Context<{ Bindings: Env }>` and one with extra `Variables` (e.g.
// requireAuth's authenticated context) — Hono's Context is invariant in Variables via `.set()`,
// so a fixed `Context<{ Bindings: Env }>` parameter type would reject the wider one.
export async function issueSession<E extends { Bindings: Env }>(c: Context<E>, userId: string): Promise<void> {
  const token = generateToken()
  const tokenHash = await hashToken(token)
  await createSession(c.env, userId, tokenHash)
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps(c),
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function clearSession<E extends { Bindings: Env }>(c: Context<E>): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    await deleteSession(c.env, await hashToken(token))
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
}

export async function getSessionUser<E extends { Bindings: Env }>(c: Context<E>): Promise<SessionUser | null> {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return null
  const session = await findValidSession(c.env, await hashToken(token))
  if (!session) return null
  const user = await findUserById(c.env, session.userId)
  if (!user) return null
  return { id: user.id, email: user.email, mustChangePassword: user.must_change_password === 1 }
}
