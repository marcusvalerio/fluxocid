/** Base URL of the FluxoCit Worker API — see .env.example. Defaults to the local `wrangler dev`
 * port so the app works out of the box in local development without extra setup. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8787'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** True for a fetch-level failure (offline, DNS, CORS, timeout) — as opposed to an ApiError,
 * which means the server was reached but responded with an error status. Callers use this to
 * distinguish "couldn't reach the server" from "server rejected the request" in error messages. */
export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError
}

/**
 * Thin fetch wrapper for the Worker API: JSON in/out, session cookie always included, and a
 * typed ApiError for non-2xx responses so callers can branch on `.status` (e.g. 401 -> redirect
 * to login) without re-parsing the response body themselves.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })

  if (res.status === 204) return undefined as T

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    // No/invalid JSON body — fine for e.g. a network gateway error page.
  }

  if (!res.ok) {
    const message = (body as { error?: string } | null)?.error ?? `Erro ${res.status} ao comunicar com o servidor.`
    throw new ApiError(res.status, message)
  }

  return body as T
}
