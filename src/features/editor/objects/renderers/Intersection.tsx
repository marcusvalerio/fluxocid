import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A traffic crossing: a tinted square zone with a painted "+" crosswalk marking, reading as
 * where two circulation lanes meet. */
export function Intersection({ widthPx, lengthPx }: ObjectRenderProps) {
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.flow} opacity={0.08} stroke={CATEGORY_COLORS.flow} strokeWidth={1.5} dash={[6, 4]} />
      <Line points={[widthPx / 2, 0, widthPx / 2, lengthPx]} stroke={CATEGORY_COLORS.flow} strokeWidth={2} dash={[10, 6]} opacity={0.6} />
      <Line points={[0, lengthPx / 2, widthPx, lengthPx / 2]} stroke={CATEGORY_COLORS.flow} strokeWidth={2} dash={[10, 6]} opacity={0.6} />
    </>
  )
}
