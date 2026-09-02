import { describe, expect, it } from 'vitest'
import { computeOccupancyPercent, findStorageOverlaps, getBoundsStatus } from './spatialRules'
import type { LayoutObject } from '../../types/layout'

function makeObject(overrides: Partial<LayoutObject> = {}): LayoutObject {
  return {
    id: overrides.id ?? '1',
    objectType: 'rack',
    category: 'storage',
    x: 0,
    y: 0,
    width: 270,
    length: 110,
    rotationDeg: 0,
    zIndex: 0,
    properties: {},
    ...overrides,
  }
}

describe('findStorageOverlaps', () => {
  it('flags two racks whose footprints genuinely overlap', () => {
    const a = makeObject({ id: 'a', x: 0, y: 0 })
    const b = makeObject({ id: 'b', x: 100, y: 0 }) // overlaps a (a spans x:0-270)
    expect(findStorageOverlaps([a, b])).toEqual(new Set(['a', 'b']))
  })

  it('does not flag racks placed edge-to-edge with no real overlap', () => {
    const a = makeObject({ id: 'a', x: 0, y: 0 })
    const b = makeObject({ id: 'b', x: 270, y: 0 }) // touches a's right edge exactly
    expect(findStorageOverlaps([a, b])).toEqual(new Set())
  })

  it('does not flag racks that are simply near each other', () => {
    const a = makeObject({ id: 'a', x: 0, y: 0 })
    const b = makeObject({ id: 'b', x: 400, y: 400 })
    expect(findStorageOverlaps([a, b])).toEqual(new Set())
  })

  it('ignores overlap with non-storage types (e.g. a dock deliberately on a wall)', () => {
    const wall = makeObject({ id: 'wall', objectType: 'wall', category: 'structure', x: 0, y: 0, width: 300, length: 20 })
    const dock = makeObject({ id: 'dock', objectType: 'dock', category: 'structure', x: 0, y: 0, width: 300, length: 50 })
    expect(findStorageOverlaps([wall, dock])).toEqual(new Set())
  })

  it('flags a corridor overlapped by a rack', () => {
    const corridor = makeObject({ id: 'c', objectType: 'corridor', category: 'storage', x: 0, y: 0, width: 300, length: 150 })
    const rack = makeObject({ id: 'r', x: 50, y: 50 })
    expect(findStorageOverlaps([corridor, rack])).toEqual(new Set(['c', 'r']))
  })

  it('accounts for rotation via the bounding box', () => {
    // a 270x110 rack rotated 90deg occupies a 110x270 footprint centered the same place
    const a = makeObject({ id: 'a', x: 0, y: 0, rotationDeg: 90 })
    const b = makeObject({ id: 'b', x: 90, y: -50 })
    expect(findStorageOverlaps([a, b]).size).toBeGreaterThan(0)
  })
})

describe('computeOccupancyPercent', () => {
  it('computes the percentage of environment area covered by solid objects', () => {
    // env 1000x1000cm (10x10m = 100m² = 1,000,000 cm²); one rack 270x110cm = 29,700 cm²
    const rack = makeObject({ id: 'r', x: 0, y: 0, width: 270, length: 110 })
    const pct = computeOccupancyPercent([rack], 1000, 1000)
    expect(pct).toBeCloseTo((270 * 110 * 100) / (1000 * 1000), 5)
  })

  it('excludes areas and flow routes (zones/markers, not physical footprint)', () => {
    const area = makeObject({ id: 'a', objectType: 'area', category: 'area', width: 500, length: 500 })
    const flow = makeObject({ id: 'f', objectType: 'flow-route', category: 'flow', width: 500, length: 20 })
    expect(computeOccupancyPercent([area, flow], 1000, 1000)).toBe(0)
  })

  it('returns 0 for an environment with no area', () => {
    const rack = makeObject({ id: 'r' })
    expect(computeOccupancyPercent([rack], 0, 1000)).toBe(0)
  })
})

describe('getBoundsStatus', () => {
  const envWidthCm = 1000
  const envHeightCm = 1000

  it('is inside when the whole footprint fits within the environment', () => {
    const obj = makeObject({ x: 100, y: 100, width: 270, length: 110 })
    expect(getBoundsStatus(obj, envWidthCm, envHeightCm)).toBe('inside')
  })

  it('is partial when the footprint straddles an edge', () => {
    const obj = makeObject({ x: 950, y: 100, width: 270, length: 110 }) // right edge at 1220 > 1000
    expect(getBoundsStatus(obj, envWidthCm, envHeightCm)).toBe('partial')
  })

  it('is outside when the footprint has no overlap with the environment at all', () => {
    const obj = makeObject({ x: 2000, y: 100, width: 270, length: 110 })
    expect(getBoundsStatus(obj, envWidthCm, envHeightCm)).toBe('outside')
  })

  it('is outside for negative coordinates entirely past the top-left corner', () => {
    const obj = makeObject({ x: -500, y: -500, width: 270, length: 110 })
    expect(getBoundsStatus(obj, envWidthCm, envHeightCm)).toBe('outside')
  })

  it('treats an object exactly flush with the edges as inside', () => {
    const obj = makeObject({ x: 0, y: 0, width: 1000, length: 1000 })
    expect(getBoundsStatus(obj, envWidthCm, envHeightCm)).toBe('inside')
  })
})
