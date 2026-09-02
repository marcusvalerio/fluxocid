import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Reach truck: a narrower counterweight body with two thin outrigger legs extending forward to
 * the forks — the extended-reach silhouette that distinguishes it from Forklift's shorter, wider
 * stance. Rotation 0deg = forks/legs pointing toward -Y. */
export function ReachTruck({ widthPx, lengthPx }: ObjectRenderProps) {
  const legZoneHeight = lengthPx * 0.55
  const bodyHeight = lengthPx - legZoneHeight
  const legWidth = widthPx * 0.12

  return (
    <>
      <Rect y={legZoneHeight} width={widthPx} height={bodyHeight} fill={CATEGORY_COLORS.equipment} cornerRadius={3} />
      <Rect x={widthPx * 0.2} y={0} width={legWidth} height={legZoneHeight} fill={CATEGORY_COLORS.equipment} opacity={0.8} />
      <Rect x={widthPx * 0.68} y={0} width={legWidth} height={legZoneHeight} fill={CATEGORY_COLORS.equipment} opacity={0.8} />
      <Rect x={widthPx * 0.32} y={0} width={widthPx * 0.36} height={legZoneHeight * 0.25} fill="#1E3A8A" />
    </>
  )
}
