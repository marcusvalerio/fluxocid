import { getBoundingBox } from './geometry'
import type { LayoutObject } from '../../types/layout'

/** Racks/corridors claim a fixed storage footprint — unlike walls (which meet at corners) or
 * docks (which sit deliberately on a wall), any overlap between two of these is a real
 * planning error. Scoped narrowly to avoid false positives elsewhere in the layout. */
const OVERLAP_CHECKED_TYPES = new Set(['rack', 'corridor'])

/** Ignore near-zero AABB overlap from objects placed edge-to-edge (snap can leave a hairline
 * float-precision sliver that isn't a real conflict). */
const TOLERANCE_CM = 5

/**
 * Returns the ids of storage objects (rack/corridor) whose bounding box overlaps another
 * storage object's by more than a small tolerance. See docs/BUSINESS_RULES.md § Regras espaciais.
 */
export function findStorageOverlaps(objects: LayoutObject[]): Set<string> {
  const candidates = objects.filter((o) => OVERLAP_CHECKED_TYPES.has(o.objectType))
  const boxes = candidates.map((o) => ({ obj: o, box: getBoundingBox(o) }))
  const overlapping = new Set<string>()

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i].box
      const b = boxes[j].box
      const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX)
      const overlapY = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY)
      if (overlapX > TOLERANCE_CM && overlapY > TOLERANCE_CM) {
        overlapping.add(boxes[i].obj.id)
        overlapping.add(boxes[j].obj.id)
      }
    }
  }

  return overlapping
}
