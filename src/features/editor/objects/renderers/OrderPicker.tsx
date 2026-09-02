import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Order picker: a base body with a dashed-outline elevated platform where the operator rides,
 * plus forks — the raised-platform silhouette distinguishing it from PalletJack. Rotation 0deg =
 * forks pointing toward -Y. */
export function OrderPicker({ widthPx, lengthPx }: ObjectRenderProps) {
  const forkZoneHeight = lengthPx * 0.3
  const platformHeight = lengthPx * 0.4
  const bodyHeight = lengthPx - forkZoneHeight - platformHeight
  const forkWidth = widthPx * 0.22

  return (
    <>
      <Rect y={forkZoneHeight + platformHeight} width={widthPx} height={bodyHeight} fill={CATEGORY_COLORS.equipment} cornerRadius={3} />
      <Rect
        x={widthPx * 0.1}
        y={forkZoneHeight}
        width={widthPx * 0.8}
        height={platformHeight}
        stroke={CATEGORY_COLORS.equipment}
        strokeWidth={1.5}
        dash={[4, 3]}
        fill={CATEGORY_COLORS.equipment}
        opacity={0.25}
      />
      <Rect x={widthPx * 0.15} y={0} width={forkWidth} height={forkZoneHeight} fill="#1E3A8A" />
      <Rect x={widthPx * 0.63} y={0} width={forkWidth} height={forkZoneHeight} fill="#1E3A8A" />
    </>
  )
}
