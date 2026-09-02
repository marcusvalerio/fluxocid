import { Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import { buildChevrons } from './patternHelpers'
import type { ObjectRenderProps } from '../types'

/** A conveyor belt: a framed lane with roller ticks across its width and flow chevrons along its
 * length — rotation 0deg carries material toward +X. */
export function Conveyor({ widthPx, lengthPx }: ObjectRenderProps) {
  const horizontal = widthPx >= lengthPx
  const rollerCount = Math.max(3, Math.round((horizontal ? widthPx : lengthPx) / 24))
  const rollers = []
  for (let i = 1; i < rollerCount; i++) {
    const pos = ((horizontal ? widthPx : lengthPx) / rollerCount) * i
    rollers.push(
      horizontal
        ? <Rect key={i} x={pos - 1} y={0} width={2} height={lengthPx} fill={CATEGORY_COLORS.equipment} opacity={0.4} />
        : <Rect key={i} x={0} y={pos - 1} width={widthPx} height={2} fill={CATEGORY_COLORS.equipment} opacity={0.4} />,
    )
  }

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#EFF6FF" stroke={CATEGORY_COLORS.equipment} strokeWidth={2} />
      {rollers}
      {buildChevrons(widthPx, lengthPx, CATEGORY_COLORS.equipment, 0.7)}
    </>
  )
}
