/** Unit conversion helpers. Internal storage is always centimeters (see docs/BUSINESS_RULES.md BR-01). */

export function cmToM(cm: number): number {
  return cm / 100
}

export function mToCm(m: number): number {
  return Math.round(m * 100)
}

export function formatMeters(cm: number, decimals = 2): string {
  return cmToM(cm).toFixed(decimals).replace('.', ',')
}

export function parseMetersInput(value: string): number | null {
  const normalized = value.replace(',', '.').trim()
  if (normalized === '') return null
  const parsed = Number.parseFloat(normalized)
  if (Number.isNaN(parsed)) return null
  return mToCm(parsed)
}

/**
 * Converts a value in centimeters (world space) to canvas pixels at the layout's base scale.
 * Zoom is applied separately via the Konva Stage's scale, not here.
 */
export function cmToPx(cm: number, pxPerMeter: number): number {
  return (cm / 100) * pxPerMeter
}

export function pxToCm(px: number, pxPerMeter: number): number {
  return (px / pxPerMeter) * 100
}

export function normalizeDeg(deg: number): number {
  const n = deg % 360
  return n < 0 ? n + 360 : n
}
