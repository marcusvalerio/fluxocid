import { Rect } from 'react-konva'
import type { ObjectRenderProps } from '../types'

/** A pedestrian crosswalk: parallel zebra stripes perpendicular to the longer axis — the
 * universal crosswalk marking, unambiguous even without a label. */
export function PedestrianLane({ widthPx, lengthPx }: ObjectRenderProps) {
  const horizontal = widthPx >= lengthPx
  const laneLength = horizontal ? widthPx : lengthPx
  const stripeThickness = Math.max(6, laneLength / 12)
  const gap = stripeThickness
  const stripes = []
  let pos = 0
  let i = 0
  while (pos < laneLength) {
    stripes.push(
      horizontal
        ? <Rect key={i} x={pos} y={0} width={stripeThickness} height={lengthPx} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={0.5} />
        : <Rect key={i} x={0} y={pos} width={widthPx} height={stripeThickness} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={0.5} />,
    )
    pos += stripeThickness + gap
    i++
  }

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#334155" />
      {stripes}
    </>
  )
}
