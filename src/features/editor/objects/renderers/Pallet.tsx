import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

export function Pallet({ widthPx, lengthPx }: ObjectRenderProps) {
  const stripeHeight = lengthPx / 7
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.pallet} stroke="#5C3E20" strokeWidth={1} />
      {[1, 3, 5].map((i) => (
        <Rect
          key={i}
          x={widthPx * 0.05}
          y={stripeHeight * i - stripeHeight / 2}
          width={widthPx * 0.9}
          height={stripeHeight * 0.5}
          fill="#B8895D"
        />
      ))}
    </>
  )
}
