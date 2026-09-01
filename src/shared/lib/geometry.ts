import type { LayoutObject } from '../../types/layout'

/** Snaps a value (cm) to the nearest multiple of stepCm. See docs/BUSINESS_RULES.md BR-20. */
export function snapToGrid(valueCm: number, stepCm: number): number {
  if (stepCm <= 0) return valueCm
  return Math.round(valueCm / stepCm) * stepCm
}

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Axis-aligned bounding box of the object's rotated footprint (world space, cm). */
export function getBoundingBox(obj: LayoutObject): BoundingBox {
  const cx = obj.x + obj.width / 2
  const cy = obj.y + obj.length / 2
  const rad = (obj.rotationDeg * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const halfW = (obj.width * cos + obj.length * sin) / 2
  const halfH = (obj.width * sin + obj.length * cos) / 2
  return {
    minX: cx - halfW,
    minY: cy - halfH,
    maxX: cx + halfW,
    maxY: cy + halfH,
  }
}

export function getCenter(obj: LayoutObject): { x: number; y: number } {
  return { x: obj.x + obj.width / 2, y: obj.y + obj.length / 2 }
}
