import type { Context } from 'hono'

/** Parses the request JSON body, tolerating an empty/invalid body (returns `{}` cast to T so
 * every field reads as `undefined` and callers validate explicitly) instead of throwing. */
export async function readJsonBody<T extends object>(c: Context): Promise<T> {
  return (await c.req.json().catch(() => ({}))) as T
}
