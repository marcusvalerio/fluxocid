import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A sorting/separation bench: a tabletop with corner legs shown as small dark squares, the
 * standard top-down furniture symbol. */
export function SortingBench({ widthPx, lengthPx }: ObjectRenderProps) {
  const legSize = Math.min(8, widthPx * 0.08, lengthPx * 0.15)
  const legs = [
    [legSize / 2, legSize / 2],
    [widthPx - legSize / 2, legSize / 2],
    [legSize / 2, lengthPx - legSize / 2],
    [widthPx - legSize / 2, lengthPx - legSize / 2],
  ]

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#F1F5F9" stroke={CATEGORY_COLORS.equipment} strokeWidth={2} cornerRadius={2} />
      {legs.map(([x, y]) => (
        <Rect key={`${x}-${y}`} x={x - legSize / 2} y={y - legSize / 2} width={legSize} height={legSize} fill={CATEGORY_COLORS.equipment} />
      ))}
    </>
  )
}
