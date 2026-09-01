import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Top-down plan view: bay dividers plus corner posts at each upright frame, the standard
 * architectural symbol for pallet racking seen from above. */
export function Rack({ widthPx, lengthPx, obj }: ObjectRenderProps) {
  const bays = Number(obj.properties.bays ?? 3)
  const postSize = Math.min(8, widthPx / bays / 4, lengthPx / 4)
  const columns = []
  const posts = []

  for (let i = 1; i < bays; i++) {
    const x = (widthPx / bays) * i
    columns.push(
      <Line key={i} points={[x, 0, x, lengthPx]} stroke={CATEGORY_COLORS.storage} strokeWidth={2} />,
    )
  }

  for (let i = 0; i <= bays; i++) {
    const x = (widthPx / bays) * i
    for (const y of [0, lengthPx]) {
      posts.push(
        <Rect
          key={`${i}-${y}`}
          x={x - postSize / 2}
          y={y - postSize / 2}
          width={postSize}
          height={postSize}
          fill="#7C4A08"
        />,
      )
    }
  }

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FEF3E2" stroke={CATEGORY_COLORS.storage} strokeWidth={2} />
      {columns}
      {posts}
    </>
  )
}
