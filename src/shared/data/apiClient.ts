const DEFAULT_API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8787' : 'https://fluxocit.contatomarcusjr.workers.dev'
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || DEFAULT_API_BASE_URL

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (res.status === 204) return undefined as T
  let body: unknown = null
  try { body = await res.json() } catch { /* non-JSON response */ }
  if (!res.ok) {
    const message = (body as { error?: string } | null)?.error ?? `Erro ${res.status} ao comunicar com o servidor.`
    throw new ApiError(res.status, message)
  }
  return body as T
}
