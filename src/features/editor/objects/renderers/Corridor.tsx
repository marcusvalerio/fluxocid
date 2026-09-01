import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

export function Corridor({ widthPx, lengthPx }: ObjectRenderProps) {
  return (
    <Rect
      width={widthPx}
      height={lengthPx}
      fill={CATEGORY_COLORS.storage}
      opacity={0.08}
      stroke={CATEGORY_COLORS.storage}
      strokeWidth={1}
      dash={[6, 4]}
    />
  )
}
