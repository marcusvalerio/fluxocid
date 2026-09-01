import type { BoundingBox } from './geometry'

export interface AxisSnapResult {
  /** Delta (cm) to add to the dragged box's position on this axis to align it. */
  delta: number
  /** World position (cm) of the matched line, used to draw a guide. */
  guidePosition: number
}

export interface ObjectSnapResult {
  x?: AxisSnapResult
  y?: AxisSnapResult
}

function axisCandidates(min: number, max: number): number[] {
  return [min, (min + max) / 2, max]
}

/**
 * Finds the closest edge/center alignment between the dragged object's bounding box and any
 * other object's bounding box, independently per axis, within thresholdCm. See docs/BUSINESS_RULES.md
 * BR-21: object snapping takes priority over grid snapping when both apply within the threshold.
 */
export function resolveObjectSnap(
  draggedBox: BoundingBox,
  otherBoxes: BoundingBox[],
  thresholdCm: number,
): ObjectSnapResult {
  const draggedX = axisCandidates(draggedBox.minX, draggedBox.maxX)
  const draggedY = axisCandidates(draggedBox.minY, draggedBox.maxY)

  let bestX: (AxisSnapResult & { diff: number }) | null = null
  let bestY: (AxisSnapResult & { diff: number }) | null = null

  for (const other of otherBoxes) {
    const otherX = axisCandidates(other.minX, other.maxX)
    const otherY = axisCandidates(other.minY, other.maxY)

    for (const dx of draggedX) {
      for (const ox of otherX) {
        const diff = Math.abs(ox - dx)
        if (diff <= thresholdCm && (!bestX || diff < bestX.diff)) {
          bestX = { delta: ox - dx, guidePosition: ox, diff }
        }
      }
    }
    for (const dy of draggedY) {
      for (const oy of otherY) {
        const diff = Math.abs(oy - dy)
        if (diff <= thresholdCm && (!bestY || diff < bestY.diff)) {
          bestY = { delta: oy - dy, guidePosition: oy, diff }
        }
      }
    }
  }

  return {
    x: bestX ? { delta: bestX.delta, guidePosition: bestX.guidePosition } : undefined,
    y: bestY ? { delta: bestY.delta, guidePosition: bestY.guidePosition } : undefined,
  }
}
