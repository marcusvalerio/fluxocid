import { Line, Rect } from 'react-konva'
import type { ObjectRenderProps } from '../types'

/** Top-down shipping container: a chamfered-corner rectangle with vertical corrugation ribs, the
 * standard plan symbol distinguishing it from a plain box or pallet. */
export function Container({ widthPx, lengthPx }: ObjectRenderProps) {
  const ribs = []
  const step = Math.max(10, widthPx / 12)
  for (let x = step; x < widthPx; x += step) {
    ribs.push(<Line key={x} points={[x, 2, x, lengthPx - 2]} stroke="#1E3A5F" strokeWidth={1} opacity={0.4} />)
  }
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#2C4A6E" cornerRadius={4} stroke="#1E3A5F" strokeWidth={2} />
      {ribs}
    </>
  )
}
