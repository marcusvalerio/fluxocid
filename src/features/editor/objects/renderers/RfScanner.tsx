import { Arc, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A handheld RF scanner: a small rounded body with a signal-wave arc, reading as a wireless
 * device rather than a generic block. */
export function RfScanner({ widthPx, lengthPx }: ObjectRenderProps) {
  const arcRadius = Math.min(widthPx, lengthPx) * 0.35

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.equipment} opacity={0.85} cornerRadius={4} />
      <Arc
        x={widthPx * 0.7}
        y={lengthPx * 0.3}
        angle={90}
        rotation={-45}
        innerRadius={arcRadius * 0.5}
        outerRadius={arcRadius}
        stroke="#FFFFFF"
        strokeWidth={1.2}
      />
    </>
  )
}
