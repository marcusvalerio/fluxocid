import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A dashed lane with chevrons along its length axis, reading clearly as a walkway rather than
 * an empty rectangle — corridors are the longer of width/length, chevrons point along that axis. */
export function Corridor({ widthPx, lengthPx }: ObjectRenderProps) {
  const horizontal = widthPx >= lengthPx
  const laneLength = horizontal ? widthPx : lengthPx
  const laneThickness = horizontal ? lengthPx : widthPx
  const chevronSize = Math.min(14, laneThickness * 0.35)
  const step = Math.max(chevronSize * 3, 40)

  const chevrons = []
  for (let pos = step / 2; pos < laneLength; pos += step) {
    const cx = horizontal ? pos : widthPx / 2
    const cy = horizontal ? lengthPx / 2 : pos
    const points = horizontal
      ? [cx - chevronSize / 2, cy - chevronSize / 2, cx + chevronSize / 2, cy, cx - chevronSize / 2, cy + chevronSize / 2]
      : [cx - chevronSize / 2, cy - chevronSize / 2, cx, cy + chevronSize / 2, cx + chevronSize / 2, cy - chevronSize / 2]
    chevrons.push(
      <Line
        key={pos}
        points={points}
        stroke={CATEGORY_COLORS.storage}
        strokeWidth={1.5}
        opacity={0.5}
        lineCap="round"
        lineJoin="round"
      />,
    )
  }

  return (
    <>
      <Rect
        width={widthPx}
        height={lengthPx}
        fill={CATEGORY_COLORS.storage}
        opacity={0.06}
        stroke={CATEGORY_COLORS.storage}
        strokeWidth={1}
        dash={[6, 4]}
      />
      {chevrons}
    </>
  )
}
