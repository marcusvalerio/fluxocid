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

export type BoundsStatus = 'inside' | 'partial' | 'outside'

/**
 * Whether an object's bounding box (rotation-aware) sits fully inside the environment, straddles
 * its edge, or is entirely off it. Used to warn the user without blocking the placement — objects
 * can legitimately be mid-drag or awaiting a bigger environment.
 */
export function getBoundsStatus(obj: LayoutObject, envWidthCm: number, envHeightCm: number): BoundsStatus {
  const box = getBoundingBox(obj)
  const fullyOutside = box.maxX <= 0 || box.minX >= envWidthCm || box.maxY <= 0 || box.minY >= envHeightCm
  if (fullyOutside) return 'outside'
  const fullyInside = box.minX >= 0 && box.maxX <= envWidthCm && box.minY >= 0 && box.maxY <= envHeightCm
  return fullyInside ? 'inside' : 'partial'
}

/** Footprint categories counted toward occupancy — zones (area) and routes (flow) are markers,
 * not physical footprint, so they're excluded. */
const OCCUPANCY_CATEGORIES = new Set(['structure', 'storage', 'equipment', 'pallet'])

/**
 * Approximate percentage of the environment's floor area covered by solid objects (bounding
 * box sum — objects that overlap, e.g. a pallet inside a rack, are double-counted, so this is
 * a directional estimate rather than an exact figure). Returns 0 for an environment with no area.
 */
export function computeOccupancyPercent(objects: LayoutObject[], envWidthCm: number, envHeightCm: number): number {
  const envArea = envWidthCm * envHeightCm
  if (envArea <= 0) return 0
  const occupiedArea = objects
    .filter((o) => OCCUPANCY_CATEGORIES.has(o.category))
    .reduce((sum, o) => sum + o.width * o.length, 0)
  return (occupiedArea / envArea) * 100
}
