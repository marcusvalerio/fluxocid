import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

export function Wall({ widthPx, lengthPx }: ObjectRenderProps) {
  return (
    <Rect
      width={widthPx}
      height={lengthPx}
      fill={CATEGORY_COLORS.structure}
      cornerRadius={1}
    />
  )
}
