import { Arc, Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

export function Door({ widthPx, lengthPx }: ObjectRenderProps) {
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FFFFFF" stroke={CATEGORY_COLORS.structure} strokeWidth={2} />
      <Line
        points={[0, lengthPx, widthPx, lengthPx]}
        stroke={CATEGORY_COLORS.structure}
        strokeWidth={3}
      />
      <Arc
        x={0}
        y={lengthPx}
        angle={90}
        rotation={-90}
        innerRadius={0}
        outerRadius={widthPx}
        stroke={CATEGORY_COLORS.structure}
        strokeWidth={1}
        dash={[4, 4]}
      />
    </>
  )
}
