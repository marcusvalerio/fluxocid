import { describe, expect, it } from 'vitest'
import { generateTempPassword, generateToken, hashPassword, hashToken, verifyPassword } from '../src/crypto'

describe('hashPassword / verifyPassword', () => {
  it('verifies the correct password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    expect(await verifyPassword('wrong password', hash)).toBe(false)
  })

  it('never stores the password as plain text', async () => {
    const hash = await hashPassword('my-secret-password')
    expect(hash).not.toContain('my-secret-password')
    expect(hash.startsWith('pbkdf2$')).toBe(true)
  })

  it('produces a different hash each time (random salt)', async () => {
    const a = await hashPassword('same-password')
    const b = await hashPassword('same-password')
    expect(a).not.toBe(b)
    expect(await verifyPassword('same-password', a)).toBe(true)
    expect(await verifyPassword('same-password', b)).toBe(true)
  })

  it('rejects malformed stored hashes instead of throwing', async () => {
    expect(await verifyPassword('anything', 'not-a-real-hash')).toBe(false)
  })
})

describe('generateToken / hashToken', () => {
  it('generates unique high-entropy tokens', () => {
    const a = generateToken()
    const b = generateToken()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })

  it('hashes deterministically (same token -> same hash)', async () => {
    const token = generateToken()
    expect(await hashToken(token)).toBe(await hashToken(token))
  })

  it('produces different hashes for different tokens', async () => {
    expect(await hashToken(generateToken())).not.toBe(await hashToken(generateToken()))
  })
})

describe('generateTempPassword', () => {
  it('generates a password without ambiguous look-alike characters', () => {
    const pw = generateTempPassword()
    expect(pw).toHaveLength(16)
    expect(pw).not.toMatch(/[0O1lI]/)
  })
})
