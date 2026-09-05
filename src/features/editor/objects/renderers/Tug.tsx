import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Tow tug: a compact body with a coupling hitch line trailing from the rear edge, implying it
 * pulls a train of carts — rotation 0deg = hitch at +Y (trailing edge). */
export function Tug({ widthPx, lengthPx }: ObjectRenderProps) {
  return (
    <>
      <Rect width={widthPx} height={lengthPx * 0.8} fill={CATEGORY_COLORS.equipment} cornerRadius={3} />
      <Line
        points={[widthPx / 2, lengthPx * 0.8, widthPx / 2, lengthPx]}
        stroke={CATEGORY_COLORS.equipment}
        strokeWidth={2.5}
        lineCap="round"
      />
    </>
  )
}
