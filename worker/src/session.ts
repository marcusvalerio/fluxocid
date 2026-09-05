import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { createSession, deleteSession, findUserById, findValidSession } from './db'
import { generateToken, hashToken } from './crypto'
import type { Env, SessionUser } from './types'

export const SESSION_COOKIE = 'fluxocit_session'
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function isHttps(c: Context): boolean { return new URL(c.req.url).protocol === 'https:' }

export async function issueSession<E extends { Bindings: Env }>(c: Context<E>, userId: string): Promise<void> {
  const token = generateToken()
  await createSession(c.env, userId, await hashToken(token))
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, secure: isHttps(c), sameSite: 'Lax', path: '/', maxAge: SESSION_MAX_AGE_SECONDS })
}

export async function clearSession<E extends { Bindings: Env }>(c: Context<E>): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) await deleteSession(c.env, await hashToken(token))
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
}

export async function getSessionUser<E extends { Bindings: Env }>(c: Context<E>): Promise<SessionUser | null> {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return null
  const session = await findValidSession(c.env, await hashToken(token))
  if (!session) return null
  const user = await findUserById(c.env, session.userId)
  return user ? { id: user.id, email: user.email, mustChangePassword: user.must_change_password === 1 } : null
}
