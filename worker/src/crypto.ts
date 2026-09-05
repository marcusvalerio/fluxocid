/**
 * Password hashing and token utilities — Web Crypto only (native to the Workers runtime, no
 * WASM/native bindings needed). See docs/DEPLOYMENT.md § Segurança for the reasoning.
 *
 * Passwords are hashed with PBKDF2-HMAC-SHA256 (100k iterations, random 16-byte salt) — a real,
 * standards-based password KDF (not a bare SHA-256 digest, which is unsuitable for passwords
 * because it's too fast to brute-force). Session/reset tokens are high-entropy random values
 * already, so they're hashed with plain SHA-256 before storage — that's enough to stop a DB leak
 * from being directly usable as a session, without the deliberate slowness PBKDF2 adds (which
 * would be pointless work for a value that's never guessed, only issued).
 */

const PBKDF2_ITERATIONS = 100_000
const SALT_BYTES = 16
const KEY_BYTES = 32

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_BYTES * 8,
  )
}

/** Returns `pbkdf2$<iterations>$<saltHex>$<hashHex>` — self-describing so the iteration count
 * can be bumped later without invalidating existing hashes. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt.buffer)}$${toHex(hash)}`
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number.parseInt(parts[1] ?? '', 10)
  const salt = fromHex(parts[2] ?? '')
  const expectedHex = parts[3] ?? ''
  if (!Number.isFinite(iterations) || salt.length === 0 || !expectedHex) return false
  const hash = await pbkdf2(password, salt, iterations)
  return timingSafeEqualHex(toHex(hash), expectedHex)
}

/** Random opaque token (hex) for session cookies and password-reset links — 32 bytes of entropy. */
export function generateToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)).buffer)
}

/** SHA-256 digest of a token, for storing session/reset tokens without keeping the raw value at
 * rest — a DB read alone is never enough to impersonate a session. */
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return toHex(digest)
}

/** A readable, unambiguous temporary password for the first-access flow (BR: "senha aleatória
 * segura", never shown in the UI, only ever sent by email) — excludes look-alike characters
 * (0/O, 1/l/I) so it's easy to retype correctly if the user copies it by hand. */
export function generateTempPassword(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return out
}
