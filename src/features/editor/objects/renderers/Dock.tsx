import { Group, Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

export function Dock({ widthPx, lengthPx }: ObjectRenderProps) {
  const hatchLines = []
  const step = Math.max(8, widthPx / 6)
  for (let x = -lengthPx; x < widthPx; x += step) {
    hatchLines.push(
      <Line
        key={x}
        points={[x, lengthPx, x + lengthPx, 0]}
        stroke={CATEGORY_COLORS.structure}
        strokeWidth={1}
        opacity={0.5}
      />,
    )
  }

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FFFFFF" stroke={CATEGORY_COLORS.structure} strokeWidth={2} />
      <Group clipFunc={(ctx) => ctx.rect(0, 0, widthPx, lengthPx)}>{hatchLines}</Group>
    </>
  )
}
