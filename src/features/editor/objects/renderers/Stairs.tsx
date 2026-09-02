import { Arrow, Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Top-down stairs: evenly spaced step lines across the run plus an arrow showing the ascending
 * direction — the standard plan symbol for a staircase. */
export function Stairs({ widthPx, lengthPx }: ObjectRenderProps) {
  const steps = Math.max(3, Math.round(lengthPx / 14))
  const lines = []
  for (let i = 1; i < steps; i++) {
    const y = (lengthPx / steps) * i
    lines.push(<Line key={i} points={[0, y, widthPx, y]} stroke={CATEGORY_COLORS.structure} strokeWidth={1} opacity={0.6} />)
  }
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FFFFFF" stroke={CATEGORY_COLORS.structure} strokeWidth={2} />
      {lines}
      <Arrow
        points={[widthPx / 2, lengthPx * 0.85, widthPx / 2, lengthPx * 0.15]}
        stroke={CATEGORY_COLORS.structure}
        fill={CATEGORY_COLORS.structure}
        strokeWidth={2}
        pointerLength={8}
        pointerWidth={7}
      />
    </>
  )
}
