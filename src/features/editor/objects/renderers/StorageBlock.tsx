import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A bulk floor-stacked storage block: a solid grid of stack cells, distinct from Rack (upright
 * frames) and Corridor (a travel lane) — this reads as a dense mass of palletized goods. */
export function StorageBlock({ widthPx, lengthPx }: ObjectRenderProps) {
  const cellSize = 22
  const cols = Math.max(1, Math.round(widthPx / cellSize))
  const rows = Math.max(1, Math.round(lengthPx / cellSize))
  const lines = []
  for (let c = 1; c < cols; c++) {
    const x = (widthPx / cols) * c
    lines.push(<Line key={`c${c}`} points={[x, 0, x, lengthPx]} stroke={CATEGORY_COLORS.storage} strokeWidth={1} opacity={0.35} />)
  }
  for (let r = 1; r < rows; r++) {
    const y = (lengthPx / rows) * r
    lines.push(<Line key={`r${r}`} points={[0, y, widthPx, y]} stroke={CATEGORY_COLORS.storage} strokeWidth={1} opacity={0.35} />)
  }

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.storage} opacity={0.18} stroke={CATEGORY_COLORS.storage} strokeWidth={2} />
      {lines}
    </>
  )
}
