import { Arrow, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Flow rack (gravity/carton flow): parallel arrows across the depth showing the gravity-fed
 * direction from load side to pick side — distinct from Rack's static bay grid. */
export function FlowRack({ widthPx, lengthPx }: ObjectRenderProps) {
  const lanes = 3
  const arrows = []
  for (let i = 0; i < lanes; i++) {
    const cx = (widthPx / lanes) * (i + 0.5)
    arrows.push(
      <Arrow
        key={i}
        points={[cx, lengthPx * 0.15, cx, lengthPx * 0.85]}
        stroke={CATEGORY_COLORS.storage}
        fill={CATEGORY_COLORS.storage}
        strokeWidth={1.5}
        opacity={0.7}
        pointerLength={7}
        pointerWidth={6}
      />,
    )
  }
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FEF3E2" stroke={CATEGORY_COLORS.storage} strokeWidth={2} />
      {arrows}
    </>
  )
}
