import { describe, expect, it } from 'vitest'
import { resolveObjectSnap } from './snap'

describe('resolveObjectSnap', () => {
  it('snaps the dragged box left edge to another box right edge within threshold', () => {
    const dragged = { minX: 103, minY: 0, maxX: 203, maxY: 100 }
    const other = { minX: 0, minY: 0, maxX: 100, maxY: 100 }

    const result = resolveObjectSnap(dragged, [other], 10)

    expect(result.x?.delta).toBe(-3) // 103 -> 100
    expect(result.x?.guidePosition).toBe(100)
  })

  it('snaps centers together', () => {
    const dragged = { minX: 40, minY: 0, maxX: 140, maxY: 100 } // center 90
    const other = { minX: 0, minY: 0, maxX: 200, maxY: 100 } // center 100

    const result = resolveObjectSnap(dragged, [other], 15)

    expect(result.x?.delta).toBe(10) // 90 -> 100
    expect(result.x?.guidePosition).toBe(100)
  })

  it('returns undefined for an axis with no match inside the threshold', () => {
    const dragged = { minX: 500, minY: 0, maxX: 600, maxY: 100 }
    const other = { minX: 0, minY: 0, maxX: 100, maxY: 100 }

    const result = resolveObjectSnap(dragged, [other], 10)

    expect(result.x).toBeUndefined()
  })

  it('picks the closest match across multiple candidate boxes', () => {
    const dragged = { minX: 108, minY: 0, maxX: 208, maxY: 100 }
    const farther = { minX: 0, minY: 0, maxX: 100, maxY: 100 } // right edge 100, diff 8
    const closer = { minX: 0, minY: 0, maxX: 105, maxY: 100 } // right edge 105, diff 3

    const result = resolveObjectSnap(dragged, [farther, closer], 10)

    expect(result.x?.guidePosition).toBe(105)
  })

  it('stays fast with hundreds of candidate objects (RNF-03 / layouts maiores)', () => {
    const others = Array.from({ length: 500 }, (_, i) => ({
      minX: i * 10,
      minY: i * 5,
      maxX: i * 10 + 120,
      maxY: i * 5 + 100,
    }))
    const dragged = { minX: 2503, minY: 0, maxX: 2623, maxY: 100 }

    const start = performance.now()
    for (let i = 0; i < 50; i++) {
      resolveObjectSnap(dragged, others, 8)
    }
    const elapsedMs = performance.now() - start

    // 50 drag-frame calls against 500 objects should be near-instant; a generous ceiling here
    // catches an accidental algorithmic regression (e.g. O(n^2) creeping in) without being flaky.
    expect(elapsedMs).toBeLessThan(200)
  })

  it('resolves X and Y independently', () => {
    const dragged = { minX: 103, minY: 207, maxX: 203, maxY: 307 }
    const other = { minX: 0, minY: 0, maxX: 100, maxY: 200 }

    const result = resolveObjectSnap(dragged, [other], 10)

    expect(result.x?.guidePosition).toBe(100)
    expect(result.y?.guidePosition).toBe(200)
  })
})
