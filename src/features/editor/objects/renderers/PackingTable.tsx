import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A packing table: a tabletop with a small centered box outline representing the package being
 * packed, distinguishing it from the plain SortingBench. */
export function PackingTable({ widthPx, lengthPx }: ObjectRenderProps) {
  const boxSize = Math.min(22, widthPx * 0.3, lengthPx * 0.5)

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#F1F5F9" stroke={CATEGORY_COLORS.equipment} strokeWidth={2} cornerRadius={2} />
      <Rect
        x={widthPx / 2 - boxSize / 2}
        y={lengthPx / 2 - boxSize / 2}
        width={boxSize}
        height={boxSize}
        stroke={CATEGORY_COLORS.equipment}
        strokeWidth={1.5}
        fill="#8B5E34"
        opacity={0.5}
      />
    </>
  )
}
