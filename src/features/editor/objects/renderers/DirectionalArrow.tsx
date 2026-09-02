import { Line } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A compact solid directional sign (rotation 0deg points along +X) — distinct from FlowRoute,
 * which draws a full travel line; this is a standalone "this way" marker like a floor sign. */
export function DirectionalArrow({ widthPx, lengthPx }: ObjectRenderProps) {
  const headSize = lengthPx
  const shaftWidth = lengthPx * 0.35

  return (
    <Line
      points={[
        0, lengthPx / 2 - shaftWidth / 2,
        widthPx - headSize * 0.6, lengthPx / 2 - shaftWidth / 2,
        widthPx - headSize * 0.6, 0,
        widthPx, lengthPx / 2,
        widthPx - headSize * 0.6, lengthPx,
        widthPx - headSize * 0.6, lengthPx / 2 + shaftWidth / 2,
        0, lengthPx / 2 + shaftWidth / 2,
      ]}
      closed
      fill={CATEGORY_COLORS.flow}
      stroke={CATEGORY_COLORS.flow}
      strokeWidth={1}
    />
  )
}
