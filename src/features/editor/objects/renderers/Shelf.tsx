import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Top-down plan view of static shelving: horizontal shelf-level lines across the depth, unlike
 * Rack's vertical bay dividers — the distinction between light shelving and pallet racking. */
export function Shelf({ widthPx, lengthPx, obj }: ObjectRenderProps) {
  const levels = Number(obj.properties.levels ?? 4)
  const lines = []
  for (let i = 1; i < levels; i++) {
    const y = (lengthPx / levels) * i
    lines.push(
      <Line key={i} points={[0, y, widthPx, y]} stroke={CATEGORY_COLORS.storage} strokeWidth={1.5} opacity={0.6} />,
    )
  }

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FEF3E2" stroke={CATEGORY_COLORS.storage} strokeWidth={2} />
      {lines}
    </>
  )
}
