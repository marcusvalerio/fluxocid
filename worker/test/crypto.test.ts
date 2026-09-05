import { describe, expect, it } from 'vitest'
import { generateTempPassword, generateToken, hashPassword, hashToken, verifyPassword } from '../src/crypto'

describe('crypto', () => {
  it('verifies the correct password and rejects the wrong one', async () => {
    const hash = await hashPassword('correct horse battery staple')
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true)
    expect(await verifyPassword('wrong password', hash)).toBe(false)
  })

  it('uses a random salt and never stores plain text', async () => {
    const a = await hashPassword('same-password'); const b = await hashPassword('same-password')
    expect(a).not.toBe(b); expect(a).not.toContain('same-password'); expect(await verifyPassword('same-password', a)).toBe(true)
  })

  it('generates opaque tokens and deterministic token hashes', async () => {
    const a = generateToken(); const b = generateToken()
    expect(a).not.toBe(b); expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(await hashToken(a)).toBe(await hashToken(a))
  })

  it('generates a retypable temporary password', () => {
    const password = generateTempPassword()
    expect(password).toHaveLength(16)
    expect(password).not.toMatch(/[0O1lI]/)
  })
})
