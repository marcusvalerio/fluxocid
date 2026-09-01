import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Rotation 0deg = front (forks) pointing toward -Y (top of the object's local bounding box). */
export function Forklift({ widthPx, lengthPx }: ObjectRenderProps) {
  const forkZoneHeight = lengthPx * 0.35
  const bodyHeight = lengthPx - forkZoneHeight
  const forkWidth = widthPx * 0.2

  return (
    <>
      <Rect
        y={forkZoneHeight}
        width={widthPx}
        height={bodyHeight}
        fill={CATEGORY_COLORS.equipment}
        cornerRadius={3}
      />
      <Rect
        x={widthPx * 0.15}
        y={forkZoneHeight * 0.35}
        width={widthPx * 0.7}
        height={forkZoneHeight * 0.4}
        fill={CATEGORY_COLORS.equipment}
        opacity={0.6}
      />
      <Rect x={widthPx * 0.15} y={0} width={forkWidth} height={forkZoneHeight} fill="#1E3A8A" />
      <Rect x={widthPx * 0.65} y={0} width={forkWidth} height={forkZoneHeight} fill="#1E3A8A" />
    </>
  )
}
