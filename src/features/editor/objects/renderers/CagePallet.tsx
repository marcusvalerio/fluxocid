import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** Cage pallet: a pallet base with a fine wire-mesh grid overlay, distinct from Pallet's solid
 * deck-stripe pattern — reads as an open lattice container. */
export function CagePallet({ widthPx, lengthPx }: ObjectRenderProps) {
  const lines = []
  const stepX = Math.max(8, widthPx / 6)
  const stepY = Math.max(8, lengthPx / 6)
  for (let x = stepX; x < widthPx; x += stepX) {
    lines.push(<Line key={`x${x}`} points={[x, 0, x, lengthPx]} stroke="#5C3E20" strokeWidth={1} opacity={0.5} />)
  }
  for (let y = stepY; y < lengthPx; y += stepY) {
    lines.push(<Line key={`y${y}`} points={[0, y, widthPx, y]} stroke="#5C3E20" strokeWidth={1} opacity={0.5} />)
  }
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.pallet} opacity={0.2} stroke="#5C3E20" strokeWidth={1.5} />
      {lines}
    </>
  )
}
