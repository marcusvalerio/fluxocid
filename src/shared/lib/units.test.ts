import { describe, expect, it } from 'vitest'
import { cmToM, cmToPx, formatMeters, mToCm, normalizeDeg, parseMetersInput, pxToCm } from './units'

describe('unit conversions', () => {
  it('converts between centimeters and meters', () => {
    expect(cmToM(270)).toBe(2.7)
    expect(mToCm(2.7)).toBe(270)
  })

  it('formats meters with a comma decimal separator', () => {
    expect(formatMeters(270)).toBe('2,70')
  })

  it('parses meter input accepting comma or dot', () => {
    expect(parseMetersInput('2,7')).toBe(270)
    expect(parseMetersInput('2.7')).toBe(270)
    expect(parseMetersInput('abc')).toBeNull()
    expect(parseMetersInput('')).toBeNull()
  })

  it('converts between centimeters and pixels using the layout scale', () => {
    expect(cmToPx(200, 50)).toBe(100)
    expect(pxToCm(100, 50)).toBe(200)
  })

  it('normalizes rotation degrees into [0, 360)', () => {
    expect(normalizeDeg(370)).toBe(10)
    expect(normalizeDeg(-10)).toBe(350)
    expect(normalizeDeg(0)).toBe(0)
  })
})
