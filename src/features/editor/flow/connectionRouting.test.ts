import { describe, expect, it } from 'vitest'
import { routeConnection } from './connectionRouting'

describe('routeConnection', () => {
  it('exits the right edge and enters the left edge when the target is to the right', () => {
    const from = { x: 0, y: 0, width: 100, height: 60 }
    const to = { x: 300, y: 0, width: 100, height: 60 }
    const { points } = routeConnection(from, to)
    const [startX, startY, , , , , endX, endY] = points
    expect(startX).toBe(100) // right edge of `from`
    expect(startY).toBe(30) // vertical center of `from`
    expect(endX).toBe(300) // left edge of `to`
    expect(endY).toBe(30)
  })

  it('exits the left edge and enters the right edge when the target is to the left', () => {
    const from = { x: 300, y: 0, width: 100, height: 60 }
    const to = { x: 0, y: 0, width: 100, height: 60 }
    const { points } = routeConnection(from, to)
    const [startX, , , , , , endX] = points
    expect(startX).toBe(300) // left edge of `from`
    expect(endX).toBe(100) // right edge of `to`
  })

  it('exits the bottom edge and enters the top edge when the target is straight below', () => {
    const from = { x: 0, y: 0, width: 60, height: 100 }
    const to = { x: 0, y: 400, width: 60, height: 100 }
    const { points } = routeConnection(from, to)
    const [startX, startY, , , , , endX, endY] = points
    expect(startX).toBe(30)
    expect(startY).toBe(100) // bottom edge of `from`
    expect(endX).toBe(30)
    expect(endY).toBe(400) // top edge of `to`
  })

  it('picks the dominant axis for a diagonal target', () => {
    const from = { x: 0, y: 0, width: 100, height: 60 }
    // Mostly-horizontal offset (dx=500 dominates dy=20) should still route via left/right edges.
    const to = { x: 500, y: 20, width: 100, height: 60 }
    const { points } = routeConnection(from, to)
    const [startX] = points
    expect(startX).toBe(100)
  })

  it('keeps the control points between the endpoints so the curve bows toward the target', () => {
    const from = { x: 0, y: 0, width: 100, height: 60 }
    const to = { x: 400, y: 0, width: 100, height: 60 }
    const { points } = routeConnection(from, to)
    const [startX, , cp1X, , cp2X, , endX] = points
    expect(cp1X).toBeGreaterThan(startX)
    expect(cp1X).toBeLessThan(endX)
    expect(cp2X).toBeGreaterThan(startX)
    expect(cp2X).toBeLessThan(endX)
  })

  it('returns a degenerate (zero-length) route for coincident boxes without throwing', () => {
    const box = { x: 10, y: 10, width: 40, height: 40 }
    const { points, mid } = routeConnection(box, box)
    expect(points).toHaveLength(8)
    expect(mid).toEqual({ x: 30, y: 30 })
  })

  it('places the midpoint roughly between the two boxes', () => {
    const from = { x: 0, y: 0, width: 100, height: 60 }
    const to = { x: 400, y: 0, width: 100, height: 60 }
    const { mid } = routeConnection(from, to)
    expect(mid.x).toBeGreaterThan(100)
    expect(mid.x).toBeLessThan(400)
    expect(mid.y).toBeCloseTo(30, 5)
  })
})
