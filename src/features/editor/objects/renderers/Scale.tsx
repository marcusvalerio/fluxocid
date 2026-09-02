import { Circle, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A floor scale: a platform frame with a circular weighing plate — the standard top-down scale
 * pictogram. */
export function Scale({ widthPx, lengthPx }: ObjectRenderProps) {
  const radius = Math.min(widthPx, lengthPx) * 0.32

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#F1F5F9" stroke={CATEGORY_COLORS.equipment} strokeWidth={2} cornerRadius={3} />
      <Circle x={widthPx / 2} y={lengthPx / 2} radius={radius} stroke={CATEGORY_COLORS.equipment} strokeWidth={2} fill="#FFFFFF" />
    </>
  )
}
