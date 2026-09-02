import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Push-back racking: storage lanes marked by parallel rail lines with short angled roller ticks,
 * denoting the inclined roller carts that push back as pallets are loaded — distinct from
 * DriveIn's plain open lanes. */
export function PushBack({ widthPx, lengthPx }: ObjectRenderProps) {
  const lanes = 3
  const laneWidth = widthPx / lanes
  const laneLines = []
  const tickMarks = []
  for (let i = 1; i < lanes; i++) {
    const x = laneWidth * i
    laneLines.push(<Line key={`l${i}`} points={[x, 0, x, lengthPx]} stroke={CATEGORY_COLORS.storage} strokeWidth={1.5} opacity={0.6} />)
  }
  const tickStep = Math.max(16, lengthPx / 6)
  for (let lane = 0; lane < lanes; lane++) {
    const cx = laneWidth * (lane + 0.5)
    for (let y = tickStep / 2; y < lengthPx; y += tickStep) {
      tickMarks.push(
        <Line
          key={`${lane}-${y}`}
          points={[cx - laneWidth * 0.3, y - 4, cx + laneWidth * 0.3, y + 4]}
          stroke={CATEGORY_COLORS.storage}
          strokeWidth={1}
          opacity={0.5}
        />,
      )
    }
  }
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FEF3E2" stroke={CATEGORY_COLORS.storage} strokeWidth={2} />
      {laneLines}
      {tickMarks}
    </>
  )
}
