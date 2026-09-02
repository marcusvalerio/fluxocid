import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A painted floor lane: solid edge lines with a dashed center line, the standard road-marking
 * symbol — distinct from Corridor (a storage-aisle clearance) and FlowRoute (a single arrow). */
export function TrafficLane({ widthPx, lengthPx }: ObjectRenderProps) {
  const horizontal = widthPx >= lengthPx

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.flow} opacity={0.05} />
      {horizontal ? (
        <>
          <Line points={[0, 1, widthPx, 1]} stroke={CATEGORY_COLORS.flow} strokeWidth={2} opacity={0.7} />
          <Line points={[0, lengthPx - 1, widthPx, lengthPx - 1]} stroke={CATEGORY_COLORS.flow} strokeWidth={2} opacity={0.7} />
          <Line points={[0, lengthPx / 2, widthPx, lengthPx / 2]} stroke={CATEGORY_COLORS.flow} strokeWidth={1.5} dash={[12, 8]} opacity={0.5} />
        </>
      ) : (
        <>
          <Line points={[1, 0, 1, lengthPx]} stroke={CATEGORY_COLORS.flow} strokeWidth={2} opacity={0.7} />
          <Line points={[widthPx - 1, 0, widthPx - 1, lengthPx]} stroke={CATEGORY_COLORS.flow} strokeWidth={2} opacity={0.7} />
          <Line points={[widthPx / 2, 0, widthPx / 2, lengthPx]} stroke={CATEGORY_COLORS.flow} strokeWidth={1.5} dash={[12, 8]} opacity={0.5} />
        </>
      )}
    </>
  )
}
