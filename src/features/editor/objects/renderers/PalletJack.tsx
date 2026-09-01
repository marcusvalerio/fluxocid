import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Rotation 0deg = forks pointing toward -Y (top of the object's local bounding box). */
export function PalletJack({ widthPx, lengthPx }: ObjectRenderProps) {
  const forkZoneHeight = lengthPx * 0.75
  const handleHeight = lengthPx - forkZoneHeight
  const forkWidth = widthPx * 0.3

  return (
    <>
      <Rect x={widthPx * 0.1} y={0} width={forkWidth} height={forkZoneHeight} fill={CATEGORY_COLORS.equipment} />
      <Rect x={widthPx * 0.6} y={0} width={forkWidth} height={forkZoneHeight} fill={CATEGORY_COLORS.equipment} />
      <Rect
        y={forkZoneHeight}
        width={widthPx}
        height={handleHeight}
        fill={CATEGORY_COLORS.equipment}
        cornerRadius={2}
      />
    </>
  )
}
