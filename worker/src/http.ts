import type { Context } from 'hono'

export async function readJsonBody<T extends object>(c: Context): Promise<T> {
  return (await c.req.json().catch(() => ({}))) as T
}
