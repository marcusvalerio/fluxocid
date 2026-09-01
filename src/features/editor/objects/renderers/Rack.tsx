import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

export function Rack({ widthPx, lengthPx, obj }: ObjectRenderProps) {
  const bays = Number(obj.properties.bays ?? 3)
  const columns = []
  for (let i = 1; i < bays; i++) {
    const x = (widthPx / bays) * i
    columns.push(
      <Line key={i} points={[x, 0, x, lengthPx]} stroke={CATEGORY_COLORS.storage} strokeWidth={2} />,
    )
  }

  return (
    <>
      <Rect
        width={widthPx}
        height={lengthPx}
        fill="#FEF3E2"
        stroke={CATEGORY_COLORS.storage}
        strokeWidth={2}
      />
      {columns}
    </>
  )
}
