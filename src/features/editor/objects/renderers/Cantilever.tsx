import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Cantilever racking: a central spine with perpendicular arm ticks extending to both sides — the
 * fishbone/comb symbol for long-item storage (tubes, lumber, profiles), unlike any bay-framed
 * rack. */
export function Cantilever({ widthPx, lengthPx }: ObjectRenderProps) {
  const horizontal = widthPx >= lengthPx
  const laneLength = horizontal ? widthPx : lengthPx
  const step = Math.max(16, laneLength / 8)

  const arms = []
  for (let pos = step / 2; pos < laneLength; pos += step) {
    arms.push(
      horizontal ? (
        <Line key={`a${pos}`} points={[pos, 2, pos, lengthPx - 2]} stroke={CATEGORY_COLORS.storage} strokeWidth={1.5} opacity={0.6} />
      ) : (
        <Line key={`a${pos}`} points={[2, pos, widthPx - 2, pos]} stroke={CATEGORY_COLORS.storage} strokeWidth={1.5} opacity={0.6} />
      ),
    )
  }

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.storage} opacity={0.06} stroke={CATEGORY_COLORS.storage} strokeWidth={1} />
      {arms}
      {horizontal ? (
        <Line points={[0, lengthPx / 2, widthPx, lengthPx / 2]} stroke={CATEGORY_COLORS.storage} strokeWidth={2.5} />
      ) : (
        <Line points={[widthPx / 2, 0, widthPx / 2, lengthPx]} stroke={CATEGORY_COLORS.storage} strokeWidth={2.5} />
      )}
    </>
  )
}
