import { Line, Rect } from 'react-konva'
import type { ObjectRenderProps } from '../types'

/** Top-down carton/box: a plain rectangle with a diagonal corner-flap crease pattern, the
 * standard plan symbol for a closed cardboard box. */
export function Box({ widthPx, lengthPx }: ObjectRenderProps) {
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#D9B98A" stroke="#8B5E34" strokeWidth={1.5} />
      <Line points={[0, 0, widthPx, lengthPx]} stroke="#8B5E34" strokeWidth={1} opacity={0.5} />
      <Line points={[widthPx, 0, 0, lengthPx]} stroke="#8B5E34" strokeWidth={1} opacity={0.5} />
    </>
  )
}
