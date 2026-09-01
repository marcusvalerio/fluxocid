import { describe, expect, it } from 'vitest'
import { getBoundingBox, snapToGrid } from './geometry'
import type { LayoutObject } from '../../types/layout'

function makeObject(overrides: Partial<LayoutObject> = {}): LayoutObject {
  return {
    id: '1',
    objectType: 'pallet',
    category: 'pallet',
    x: 0,
    y: 0,
    width: 120,
    length: 100,
    rotationDeg: 0,
    zIndex: 0,
    properties: {},
    ...overrides,
  }
}

describe('snapToGrid', () => {
  it('snaps to the nearest multiple of the step', () => {
    expect(snapToGrid(107, 10)).toBe(110)
    expect(snapToGrid(104, 10)).toBe(100)
    expect(snapToGrid(105, 10)).toBe(110)
  })

  it('returns the value unchanged when step is zero', () => {
    expect(snapToGrid(123, 0)).toBe(123)
  })
})

describe('getBoundingBox', () => {
  it('matches the object footprint when not rotated', () => {
    const obj = makeObject({ x: 10, y: 20, width: 100, length: 50 })
    expect(getBoundingBox(obj)).toEqual({ minX: 10, minY: 20, maxX: 110, maxY: 70 })
  })

  it('swaps width/length extent when rotated 90 degrees', () => {
    const obj = makeObject({ x: 0, y: 0, width: 100, length: 50, rotationDeg: 90 })
    const box = getBoundingBox(obj)
    expect(box.maxX - box.minX).toBeCloseTo(50, 5)
    expect(box.maxY - box.minY).toBeCloseTo(100, 5)
  })
})
