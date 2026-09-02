import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A label printer/station: a body with a clipped top-right corner and a small tab representing
 * the label feed, reading as a compact desktop device. */
export function LabelPrinter({ widthPx, lengthPx }: ObjectRenderProps) {
  const cut = Math.min(widthPx, lengthPx) * 0.3

  return (
    <>
      <Line
        points={[0, 0, widthPx - cut, 0, widthPx, cut, widthPx, lengthPx, 0, lengthPx]}
        closed
        fill="#F1F5F9"
        stroke={CATEGORY_COLORS.equipment}
        strokeWidth={2}
      />
      <Rect x={widthPx * 0.15} y={lengthPx * 0.65} width={widthPx * 0.5} height={lengthPx * 0.15} fill={CATEGORY_COLORS.equipment} opacity={0.6} />
    </>
  )
}
