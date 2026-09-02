import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A vehicle gate/rolling door: a wide dashed opening marked by repeating vertical slat lines —
 * distinct from Door's single-leaf arc-swing symbol, reads as a wide roll-up/sectional opening. */
export function Gate({ widthPx, lengthPx }: ObjectRenderProps) {
  const slats = []
  const step = Math.max(6, widthPx / 10)
  for (let x = step; x < widthPx; x += step) {
    slats.push(<Line key={x} points={[x, 0, x, lengthPx]} stroke={CATEGORY_COLORS.structure} strokeWidth={1} opacity={0.5} />)
  }
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FFFFFF" stroke={CATEGORY_COLORS.structure} strokeWidth={2} dash={[10, 4]} />
      {slats}
    </>
  )
}
